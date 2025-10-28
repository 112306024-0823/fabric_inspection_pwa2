import type { Roll, Inspection, Defect, DefectCode, SyncPushRequest, SyncPushResponse, SyncPullRequest, SyncPullResponse } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

// API 請求輔助函數
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// 取得布捲資料
export async function getRollByBarcode(barcode: string): Promise<Roll | null> {
  try {
    const response = await apiRequest(`/rolls/barcode/${barcode}`);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching roll by barcode:', error);
    return null; // 找不到資料時返回 null
  }
}

// 取得所有布捲資料
export async function getAllRolls(): Promise<Roll[]> {
  try {
    const response = await apiRequest('/rolls');
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching all rolls:', error);
    throw error;
  }
}

// 取得檢驗記錄
export async function getInspectionByRollId(rollId: string): Promise<Inspection | null> {
  try {
    const response = await apiRequest(`/inspections/roll/${rollId}`);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching inspection:', error);
    return null; // 找不到資料時返回 null
  }
}

// 取得缺陷記錄
export async function getDefectsByRollId(rollId: string): Promise<Defect[]> {
  try {
    const response = await apiRequest(`/defects/roll/${rollId}`);
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching defects:', error);
    throw error;
  }
}

// 取得所有缺陷代碼
export async function getAllDefectCodes(): Promise<DefectCode[]> {
  try {
    const response = await apiRequest('/defect-codes');
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching defect codes:', error);
    throw error;
  }
}

// 同步推送
export async function syncPush(request: SyncPushRequest): Promise<SyncPushResponse> {
  try {
    const response = await apiRequest('/sync/push', {
      method: 'POST',
      body: JSON.stringify({ mutations: request.mutations })
    });
    return response as SyncPushResponse;
  } catch (error) {
    console.error('Error in sync push:', error);
    throw error;
  }
}

// 同步拉取
export async function syncPull(request: SyncPullRequest): Promise<SyncPullResponse> {
  try {
    const response = await apiRequest('/sync/pull', {
      method: 'POST',
      body: JSON.stringify({
        since: request.since ?? null,
        take: request.take ?? 100,
      })
    });
    return response as SyncPullResponse;
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

  // 清理函數
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

