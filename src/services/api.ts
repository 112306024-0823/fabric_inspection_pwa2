import { supabase } from './sqlserver';
import type { Roll, Inspection, Defect, DefectCode, SyncPushRequest, SyncPushResponse, SyncPullRequest, SyncPullResponse } from '../types';

// 取得布捲資料
export async function getRollByBarcode(barcode: string): Promise<Roll | null> {
  try {
    const { data, error } = await supabase
      .from('rolls')
      .select('*')
      .eq('barcode', barcode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // 找不到資料
      }
      throw error;
    }

    return data as Roll;
  } catch (error) {
    console.error('Error fetching roll by barcode:', error);
    throw error;
  }
}

// 取得所有布捲資料
export async function getAllRolls(): Promise<Roll[]> {
  try {
    const { data, error } = await supabase
      .from('rolls')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as Roll[];
  } catch (error) {
    console.error('Error fetching all rolls:', error);
    throw error;
  }
}

// 取得檢驗記錄
export async function getInspectionByRollId(rollId: string): Promise<Inspection | null> {
  try {
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('roll_id', rollId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as Inspection;
  } catch (error) {
    console.error('Error fetching inspection:', error);
    throw error;
  }
}

// 取得缺陷記錄
export async function getDefectsByRollId(rollId: string): Promise<Defect[]> {
  try {
    // SQL Server API 已經在後端處理了 JOIN，直接獲取數據即可
    const { data, error } = await supabase
      .from('defects')
      .select('*')
      .eq('roll_id', rollId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Defect[];
  } catch (error) {
    console.error('Error fetching defects:', error);
    throw error;
  }
}

// 取得所有缺陷代碼
export async function getAllDefectCodes(): Promise<DefectCode[]> {
  try {
    const { data, error } = await supabase
      .from('defect_codes')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    // 後端已經過濾了 is_active = 1，這裡不需要再過濾
    return data as DefectCode[];
  } catch (error) {
    console.error('Error fetching defect codes:', error);
    throw error;
  }
}

// 同步推送
export async function syncPush(request: SyncPushRequest): Promise<SyncPushResponse> {
  try {
    // 透過 Postgres RPC 呼叫 plpgsql 函數 sync_push
    const { data, error } = await supabase.rpc('sync_push', { mutations: request.mutations as unknown as any });
    if (error) throw error;
    return data as SyncPushResponse;
  } catch (error) {
    console.error('Error in sync push:', error);
    throw error;
  }
}

// 同步拉取
export async function syncPull(request: SyncPullRequest): Promise<SyncPullResponse> {
  try {
    const { data, error } = await supabase.rpc('sync_pull', {
      since_timestamp: request.since ?? null,
      take_limit: request.take ?? 100,
    });
    if (error) throw error;
    return data as SyncPullResponse;
  } catch (error) {
    console.error('Error in sync pull:', error);
    throw error;
  }
}

// 檢查網路連線
export function isOnline(): boolean {
  return navigator.onLine;
}

// 監聽網路狀態變化
export function onNetworkChange(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // 返回清理函數
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

