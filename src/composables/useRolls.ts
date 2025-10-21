import { ref, computed } from 'vue';
import { db } from '../database';
import { getRollByBarcode, getAllRolls } from '../services/api';
import { addToOutbox } from '../services/sync';
import type { Roll } from '../types';

// 布捲列表狀態
const rolls = ref<Roll[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

export function useRolls() {
  // 計算屬性
  const rollsList = computed(() => rolls.value);
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);
  const errorMessage = computed(() => error.value);

  // 清除錯誤
  const clearError = () => {
    error.value = null;
  };

  // 從本地資料庫載入布捲列表
  const loadRollsFromLocal = async () => {
    try {
      loading.value = true;
      clearError();
      
      const localRolls = await db.rolls.orderBy('updated_at').reverse().toArray();
      rolls.value = localRolls;
      
      console.log(`Loaded ${localRolls.length} rolls from local database`);
    } catch (err) {
      error.value = 'Failed to load rolls from local database';
      console.error('Error loading rolls from local:', err);
    } finally {
      loading.value = false;
    }
  };

  // 從伺服器載入布捲列表
  const loadRollsFromServer = async () => {
    try {
      loading.value = true;
      clearError();
      
      const serverRolls = await getAllRolls();
      
      // 更新本地資料庫
      await db.transaction('rw', [db.rolls], async () => {
        for (const roll of serverRolls) {
          await db.rolls.put({ ...roll, _dirty: false });
        }
      });
      
      // 更新本地狀態
      await loadRollsFromLocal();
      
      console.log(`Loaded ${serverRolls.length} rolls from server`);
    } catch (err) {
      error.value = 'Failed to load rolls from server';
      console.error('Error loading rolls from server:', err);
    } finally {
      loading.value = false;
    }
  };

  // 根據條碼搜尋布捲（先查本地，再查伺服器）
  const searchRollByBarcode = async (barcode: string): Promise<Roll | null> => {
    try {
      clearError();
      
      // 先查本地資料庫
      let roll = await db.rolls.where('barcode').equals(barcode).first();
      
      if (roll) {
        console.log('Found roll in local database:', roll.barcode);
        return roll;
      }
      
      // 本地沒有，查伺服器
      roll = await getRollByBarcode(barcode);
      
      if (roll) {
        // 儲存到本地資料庫
        await db.rolls.put({ ...roll, _dirty: false });
        
        // 更新本地狀態
        await loadRollsFromLocal();
        
        console.log('Found roll on server and cached locally:', roll.barcode);
        return roll;
      }
      
      console.log('Roll not found:', barcode);
      return null;
    } catch (err) {
      error.value = 'Failed to search roll';
      console.error('Error searching roll:', err);
      return null;
    }
  };

  // 新增布捲到本地（離線模式）
  const addRollOffline = async (rollData: Partial<Roll>): Promise<Roll | null> => {
    try {
      clearError();
      
      const newRoll: Roll = {
        id: crypto.randomUUID(),
        barcode: rollData.barcode || '',
        bl_no: rollData.bl_no || '',
        po_no: rollData.po_no || '',
        style: rollData.style || '',
        color: rollData.color || '',
        lot: rollData.lot || '',
        roll_number: rollData.roll_number || '',
        fabric_description: rollData.fabric_description,
        supplier: rollData.supplier,
        total_length: rollData.total_length || 0,
        need_inspect_length: rollData.need_inspect_length || 0,
        inspected_length: rollData.inspected_length || 0,
        standard_yard: rollData.standard_yard || 0,
        grade: rollData.grade,
        avg_points: rollData.avg_points,
        status: rollData.status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rowversion: 1,
      };
      
      // 儲存到本地資料庫
      await db.rolls.add(newRoll);
      
      // 加入同步佇列
      await addToOutbox('rolls', 'upsert', newRoll.id, newRoll);
      
      // 更新本地狀態
      await loadRollsFromLocal();
      
      console.log('Added roll offline:', newRoll.barcode);
      return newRoll;
    } catch (err) {
      error.value = 'Failed to add roll offline';
      console.error('Error adding roll offline:', err);
      return null;
    }
  };

  // 更新布捲狀態
  const updateRollStatus = async (rollId: string, status: Roll['status']): Promise<boolean> => {
    try {
      clearError();
      
      const roll = await db.rolls.get(rollId);
      if (!roll) {
        error.value = 'Roll not found';
        return false;
      }
      
      const updatedRoll = {
        ...roll,
        status,
        updated_at: new Date().toISOString(),
      };
      
      // 更新本地資料庫
      await db.rolls.put(updatedRoll);
      
      // 加入同步佇列
      await addToOutbox('rolls', 'upsert', rollId, updatedRoll);
      
      // 更新本地狀態
      await loadRollsFromLocal();
      
      console.log('Updated roll status:', rollId, status);
      return true;
    } catch (err) {
      error.value = 'Failed to update roll status';
      console.error('Error updating roll status:', err);
      return false;
    }
  };

  // 編輯布捲（本地修改 + outbox）
  const editRoll = async (rollId: string, changes: Partial<Roll>): Promise<boolean> => {
    try {
      clearError();
      const roll = await db.rolls.get(rollId);
      if (!roll) return false;

      const updated: Roll = {
        ...roll,
        ...changes,
        updated_at: new Date().toISOString(),
      };
      await db.rolls.put(updated);
      await addToOutbox('rolls', 'upsert', rollId, updated);
      await loadRollsFromLocal();
      return true;
    } catch (err) {
      console.error('Error editing roll:', err);
      return false;
    }
  };

  // 刪除布捲的「檢驗記錄」（而非刪整個 roll）
  const deleteRoll = async (rollId: string): Promise<boolean> => {
    try {
      clearError();
      // 先找該 roll 的 inspections，逐筆刪除
      const inspections = await db.inspections.where('roll_id').equals(rollId).toArray();
      for (const ins of inspections) {
        await db.inspections.delete(ins.id);
        await addToOutbox('inspections', 'delete', ins.id, { id: ins.id });
      }
      // 視需要也可清該 roll 的 defects（此處保留）
      const defects = await db.defects.where('roll_id').equals(rollId).toArray();
      for (const d of defects) {
        await db.defects.delete(d.id);
        await addToOutbox('defects', 'delete', d.id, { id: d.id });
      }
      await loadRollsFromLocal();
      return true;
    } catch (err) {
      console.error('Error deleting roll:', err);
      return false;
    }
  };

  // 根據 ID 取得布捲
  const getRollById = async (rollId: string): Promise<Roll | null> => {
    try {
      return await db.rolls.get(rollId) || null;
    } catch (err) {
      console.error('Error getting roll by ID:', err);
      return null;
    }
  };

  // 根據狀態篩選布捲
  const getRollsByStatus = (status: Roll['status']) => {
    return computed(() => rolls.value.filter(roll => roll.status === status));
  };

  // 搜尋布捲
  const searchRolls = (query: string) => {
    return computed(() => {
      if (!query.trim()) return rolls.value;
      
      const lowerQuery = query.toLowerCase();
      return rolls.value.filter(roll => 
        roll.barcode.toLowerCase().includes(lowerQuery) ||
        roll.bl_no.toLowerCase().includes(lowerQuery) ||
        roll.po_no.toLowerCase().includes(lowerQuery) ||
        roll.style.toLowerCase().includes(lowerQuery) ||
        roll.color.toLowerCase().includes(lowerQuery) ||
        roll.lot.toLowerCase().includes(lowerQuery) ||
        roll.roll_number.toLowerCase().includes(lowerQuery)
      );
    });
  };

  return {
    // 狀態
    rollsList,
    isLoading,
    hasError,
    errorMessage,
    
    // 方法
    clearError,
    loadRollsFromLocal,
    loadRollsFromServer,
    searchRollByBarcode,
    addRollOffline,
    updateRollStatus,
    editRoll,
    deleteRoll,
    getRollById,
    getRollsByStatus,
    searchRolls
  };
}

