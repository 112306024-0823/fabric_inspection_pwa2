import { ref, computed, onMounted, onUnmounted } from 'vue';
// import { db } from '../database';
import { onNetworkChange } from '../services/api';
import { performFullSync, getPendingSyncCount, setDataChangeCallback } from '../services/sync';
import type { AppState, Roll, Inspection } from '../types';

// 全域應用程式狀態
const appState = ref<AppState>({
  isOnline: navigator.onLine,
  pendingSyncCount: 0
});

// 網路狀態監聽器清理函數
let networkCleanup: (() => void) | null = null;

// 🚀 移除同步定時器，改為事件驅動同步
// let syncTimer: NodeJS.Timeout | null = null;

export function useAppState() {
  // 計算屬性
  const isOnline = computed(() => appState.value.isOnline);
  const pendingSyncCount = computed(() => appState.value.pendingSyncCount);
  const currentRoll = computed(() => appState.value.currentRoll);
  const currentInspection = computed(() => appState.value.currentInspection);
  const lastSyncAt = computed(() => appState.value.lastSyncAt);

  // 設定當前布捲
  const setCurrentRoll = (roll: Roll | undefined) => {
    (appState.value as any).currentRoll = roll;
  };

  // 設定當前檢驗記錄
  const setCurrentInspection = (inspection: Inspection | undefined) => {
    (appState.value as any).currentInspection = inspection;
  };

  // 更新網路狀態
  const updateNetworkStatus = (online: boolean) => {
    appState.value.isOnline = online;
    console.log('Network status changed:', online ? 'Online' : 'Offline');
    
    // 網路恢復時自動同步
    if (online) {
      performAutoSync();
    }
  };

  // 更新待同步數量
  const updatePendingSyncCount = async () => {
    appState.value.pendingSyncCount = await getPendingSyncCount();
  };

  // 資料變更通知
  const notifyDataChanged = async () => {
    await updatePendingSyncCount();
    
    // 如果線上且有待同步資料，立即觸發同步
    if (appState.value.isOnline && appState.value.pendingSyncCount > 0) {
      console.log('📊 Data changed, triggering auto sync...');
      void performAutoSync();
    }
  };

  // 自動同步
  const performAutoSync = async () => {
    if (!appState.value.isOnline) {
      console.log('📴 Offline, skipping auto sync');
      return;
    }

    
    const pendingCount = await getPendingSyncCount();
    if (pendingCount === 0) {
      console.log('No pending items, skipping sync');
      return;
    }

    try {
      const result = await performFullSync(appState.value.lastSyncAt);
      // 發現有待同步資料時執行
      if (result.pushSuccess && result.pullSuccess) {
        appState.value.lastSyncAt = new Date().toISOString();
        await updatePendingSyncCount();
        console.log('✓ Auto sync completed successfully');
      } else {
        console.log('Auto sync completed with some failures');
      }
    } catch (error) {
      console.error('Auto sync failed:', error);
    }
  };

  // 手動同步
  const performManualSync = async (): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('🔄 Performing manual sync...');
      const result = await performFullSync(appState.value.lastSyncAt);
      
      if (result.pushSuccess && result.pullSuccess) {
        appState.value.lastSyncAt = new Date().toISOString();
        await updatePendingSyncCount();
        console.log('✓ Manual sync completed successfully');
        return { success: true, message: '同步完成' };
      } else {
        console.log('⚠ Manual sync completed with some failures');
        await updatePendingSyncCount();
        return { success: false, message: '同步部分失敗，請稍後重試' };
      }
    } catch (error: any) {
      console.error('Manual sync failed:', error);
      return { success: false, message: error?.message || '同步失敗' };
    }
  };

  // 初始化應用程式狀態
  const initializeAppState = async () => {
    try {
      // 設定網路狀態監聽
      networkCleanup = onNetworkChange(updateNetworkStatus);
      
      // 🚀 設定資料變更通知回調
      setDataChangeCallback(notifyDataChanged);
      
      // 更新待同步數量
      await updatePendingSyncCount();

      
      console.log('App state initialized (event-driven sync enabled)');
    } catch (error) {
      console.error('Failed to initialize app state:', error);
    }
  };


  // 清理資源
  const cleanup = () => {
    if (networkCleanup) {
      networkCleanup();
      networkCleanup = null;
    }

  };

  // 組件掛載時初始化
  onMounted(() => {
    void initializeAppState();
  });

  // 組件卸載時清理
  onUnmounted(() => {
    cleanup();
  });

  return {
    // 狀態
    isOnline,
    pendingSyncCount,
    currentRoll,
    currentInspection,
    lastSyncAt,
    
    // 方法
    setCurrentRoll,
    setCurrentInspection,
    updatePendingSyncCount,
    notifyDataChanged,
    performAutoSync,
    performManualSync,
    initializeAppState,
    cleanup
  };
}
