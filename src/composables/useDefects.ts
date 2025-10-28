import { ref, computed } from 'vue';
import { db } from '../database';
import { getDefectsByRollId, getAllDefectCodes } from '../services/api';
import { addToOutbox } from '../services/sync';
import type { Defect, DefectCode, DefectForm } from '../types';

const defects = ref<Defect[]>([]);
const defectCodes = ref<DefectCode[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

export function useDefects() {
  const defectsList = computed(() => defects.value);
  const defectCodesList = computed(() => defectCodes.value);
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);
  const errorMessage = computed(() => error.value);

  // 按類別分組的缺陷代碼
  const defectCodesByCategory = computed(() => {
    const grouped: Record<string, DefectCode[]> = {};
    defectCodes.value.forEach(code => {
      if (!grouped[code.category]) {
        grouped[code.category] = [];
      }
      grouped[code.category]?.push(code);
    });
    return grouped;
  });

  const clearError = () => {
    error.value = null;
  };

  // 從本地載入缺陷記錄
  const loadDefectsFromLocal = async (rollId?: string) => {
    try {
      loading.value = true;
      clearError();

      if (rollId) {
        const localDefects = await db.defects
          .where('roll_id')
          .equals(rollId)
          .toArray();
        defects.value = localDefects;
      } else {
        const localDefects = await db.defects.toArray();
        defects.value = localDefects;
      }

      console.log(`Loaded ${defects.value.length} defects from local`);
    } catch (err) {
      error.value = 'Failed to load defects from local';
      console.error('Error loading defects:', err);
    } finally {
      loading.value = false;
    }
  };

  // 從伺服器載入缺陷記錄
  const loadDefectsFromServer = async (rollId: string) => {
    try {
      loading.value = true;
      clearError();

      const serverDefects = await getDefectsByRollId(rollId);
      
      // 更新本地資料庫
      for (const defect of serverDefects) {
        await db.defects.put({ ...defect, _dirty: false });
      }

      await loadDefectsFromLocal(rollId);
      console.log('Loaded defects from server');
    } catch (err) {
      error.value = 'Failed to load defects from server';
      console.error('Error loading defects from server:', err);
    } finally {
      loading.value = false;
    }
  };

  // 載入缺陷代碼
  const loadDefectCodes = async () => {
    try {
      // 先查本地
      let localCodes = await db.defectCodes.toArray();
      
      if (localCodes.length > 0) {
        defectCodes.value = localCodes;
        console.log(`Loaded ${localCodes.length} defect codes from local`);
        
        // 背景更新（不阻塞）
        if (navigator.onLine) {
          void loadDefectCodesFromServer();
        }
        return;
      }

      // 本地沒有，從伺服器載入
      if (navigator.onLine) {
        await loadDefectCodesFromServer();
      }
    } catch (err) {
      console.error('Error loading defect codes:', err);
    }
  };

  // 從伺服器載入缺陷代碼
  const loadDefectCodesFromServer = async () => {
    try {
      const serverCodes = await getAllDefectCodes();
      
      // 更新本地資料庫
      for (const code of serverCodes) {
        await db.defectCodes.put(code);
      }

      defectCodes.value = serverCodes;
      console.log(`Loaded ${serverCodes.length} defect codes from server`);
    } catch (err) {
      console.error('Error loading defect codes from server:', err);
    }
  };

  // 新增缺陷記錄
  const addDefect = async (
    rollId: string,
    inspectionId: string | undefined,
    defectForm: DefectForm
  ): Promise<Defect | null> => {
    try {
      clearError();

      const newDefect: Defect = {
        id: crypto.randomUUID(),
        roll_id: rollId,
        inspection_id: inspectionId,
        defect_code_id: defectForm.defect_code_id,
        position_yard: defectForm.position_yard,
        level: defectForm.level,
        remark: defectForm.remark,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rowversion: 1,
        _dirty: true
      };

      // 儲存到本地
      await db.defects.add(newDefect);

      // 加入同步佇列
      await addToOutbox('defects', 'upsert', newDefect.id, newDefect);

      // 重新載入當前 roll 的缺陷列表，避免重複
      await loadDefectsFromLocal(rollId);

      console.log('Defect added:', newDefect.id);
      return newDefect;
    } catch (err) {
      error.value = 'Failed to add defect';
      console.error('Error adding defect:', err);
      return null;
    }
  };

  // 刪除缺陷記錄
  const deleteDefect = async (defectId: string): Promise<boolean> => {
    try {
      clearError();

      const defect = await db.defects.get(defectId);
      if (!defect) return false;

      await db.defects.delete(defectId);
      await addToOutbox('defects', 'delete', defectId, { id: defectId });

      // 重新載入缺陷列表，確保資料一致性
      const rollId = defect.roll_id;
      await loadDefectsFromLocal(rollId);

      console.log('Defect deleted:', defectId);
      return true;
    } catch (err) {
      error.value = 'Failed to delete defect';
      console.error('Error deleting defect:', err);
      return false;
    }
  };

  // 取得缺陷代碼描述
  const getDefectCodeDescription = (defectCodeId: string, lang: 'zh' | 'en' | 'kh' = 'zh'): string => {
    const code = defectCodes.value.find(c => c.id === defectCodeId);
    if (!code) return '';
    
    if (lang === 'zh') return code.description_zh || code.description_en || code.description_kh || '';
    if (lang === 'en') return code.description_en || code.description_zh || code.description_kh || '';
    return code.description_kh || code.description_zh || code.description_en || '';
  };

  // 取得缺陷代碼
  const getDefectCode = (defectCodeId: string): DefectCode | undefined => {
    return defectCodes.value.find(c => c.id === defectCodeId);
  };

  return {
    defectsList,
    defectCodesList,
    defectCodesByCategory,
    isLoading,
    hasError,
    errorMessage,
    clearError,
    loadDefectsFromLocal,
    loadDefectsFromServer,
    loadDefectCodes,
    addDefect,
    deleteDefect,
    getDefectCodeDescription,
    getDefectCode
  };
}
