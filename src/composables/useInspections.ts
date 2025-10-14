import { ref, computed } from 'vue';
import { db } from '../database';
import { getInspectionByRollId } from '../services/api';
import { addToOutbox } from '../services/sync';
import type { Inspection, SpecCheckForm, QualityCheckForm } from '../types';

const inspections = ref<Inspection[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

export function useInspections() {
  const inspectionsList = computed(() => inspections.value);
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);
  const errorMessage = computed(() => error.value);

  const clearError = () => {
    error.value = null;
  };

  // 從本地載入檢驗記錄
  const loadInspectionsFromLocal = async (rollId?: string) => {
    try {
      loading.value = true;
      clearError();

      if (rollId) {
        const localInspections = await db.inspections
          .where('roll_id')
          .equals(rollId)
          .toArray();
        inspections.value = localInspections;
      } else {
        const localInspections = await db.inspections.toArray();
        inspections.value = localInspections;
      }

      console.log(`Loaded ${inspections.value.length} inspections from local`);
    } catch (err) {
      error.value = 'Failed to load inspections from local';
      console.error('Error loading inspections:', err);
    } finally {
      loading.value = false;
    }
  };

  // 從伺服器載入檢驗記錄
  const loadInspectionFromServer = async (rollId: string) => {
    try {
      loading.value = true;
      clearError();

      const serverInspection = await getInspectionByRollId(rollId);
      if (serverInspection) {
        await db.inspections.put({ ...serverInspection, _dirty: false });
        await loadInspectionsFromLocal(rollId);
      }

      console.log('Loaded inspection from server');
    } catch (err) {
      error.value = 'Failed to load inspection from server';
      console.error('Error loading inspection from server:', err);
    } finally {
      loading.value = false;
    }
  };

  // 取得檢驗記錄
  const getInspection = async (rollId: string): Promise<Inspection | null> => {
    try {
      // 先查本地
      let inspection = await db.inspections.where('roll_id').equals(rollId).first();
      
      if (inspection) {
        return inspection;
      }

      // 本地沒有且線上，查伺服器
      if (navigator.onLine) {
        const serverInspection = await getInspectionByRollId(rollId);
        if (serverInspection) {
          await db.inspections.put({ ...serverInspection, _dirty: false });
          return serverInspection;
        }
      }

      return null;
    } catch (err) {
      console.error('Error getting inspection:', err);
      return null;
    }
  };

  // 儲存檢驗記錄
  const saveInspection = async (
    rollId: string,
    specForm: SpecCheckForm,
    qualityForm: QualityCheckForm,
    existingInspection?: Inspection
  ): Promise<Inspection | null> => {
    try {
      clearError();

      const inspectionData: Inspection = {
        id: existingInspection?.id || crypto.randomUUID(),
        roll_id: rollId,
        inspector_name: existingInspection?.inspector_name || 'Inspector',
        ...specForm,
        ...qualityForm,
        remark: existingInspection?.remark || '',
        finished: existingInspection?.finished || false,
        inspection_started_at: existingInspection?.inspection_started_at || new Date().toISOString(),
        inspection_finished_at: existingInspection?.inspection_finished_at || '',
        created_at: existingInspection?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rowversion: (existingInspection?.rowversion || 0) + 1,
        _dirty: true
      };

      // 儲存到本地
      await db.inspections.put(inspectionData);

      // 加入同步佇列（online-first 會立即嘗試推送）
      await addToOutbox('inspections', 'upsert', inspectionData.id, inspectionData);

      console.log('Inspection saved:', inspectionData.id);
      return inspectionData;
    } catch (err) {
      error.value = 'Failed to save inspection';
      console.error('Error saving inspection:', err);
      return null;
    }
  };

  // 完成檢驗
  const finishInspection = async (inspection: Inspection): Promise<boolean> => {
    try {
      clearError();

      const finishedInspection: Inspection = {
        ...inspection,
        finished: true,
        inspection_finished_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rowversion: inspection.rowversion + 1,
        _dirty: true
      };

      await db.inspections.put(finishedInspection);
      await addToOutbox('inspections', 'upsert', finishedInspection.id, finishedInspection);

      console.log('Inspection finished:', finishedInspection.id);
      return true;
    } catch (err) {
      error.value = 'Failed to finish inspection';
      console.error('Error finishing inspection:', err);
      return false;
    }
  };

  // 刪除檢驗記錄
  const deleteInspection = async (inspectionId: string): Promise<boolean> => {
    try {
      clearError();

      await db.inspections.delete(inspectionId);
      await addToOutbox('inspections', 'delete', inspectionId, { id: inspectionId });

      await loadInspectionsFromLocal();
      console.log('Inspection deleted:', inspectionId);
      return true;
    } catch (err) {
      error.value = 'Failed to delete inspection';
      console.error('Error deleting inspection:', err);
      return false;
    }
  };

  return {
    inspectionsList,
    isLoading,
    hasError,
    errorMessage,
    clearError,
    loadInspectionsFromLocal,
    loadInspectionFromServer,
    getInspection,
    saveInspection,
    finishInspection,
    deleteInspection
  };
}
