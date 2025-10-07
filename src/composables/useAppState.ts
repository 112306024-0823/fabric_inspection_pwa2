import { ref, computed, onMounted, onUnmounted } from 'vue';
// import { db } from '../database';
import { onNetworkChange } from '../services/api';
import { performFullSync, getPendingSyncCount } from '../services/sync';
import type { AppState, Roll, Inspection } from '../types';

// 全域應用程式狀態
const appState = ref<AppState>({
  isOnline: navigator.onLine,
  lastSyncAt: undefined,
  pendingSyncCount: 0,
  currentRoll: undefined,
  currentInspection: undefined
});

// 網路狀態監聽器清理函數
let networkCleanup: (() => void) | null = null;

// 同步定時器
let syncTimer: NodeJS.Timeout | null = null;

export function useAppState() {
  // 計算屬性
  const isOnline = computed(() => appState.value.isOnline);
  const pendingSyncCount = computed(() => appState.value.pendingSyncCount);
  const currentRoll = computed(() => appState.value.currentRoll);
  const currentInspection = computed(() => appState.value.currentInspection);
  const lastSyncAt = computed(() => appState.value.lastSyncAt);

  // 設定當前布捲
  const setCurrentRoll = (roll: Roll | undefined) => {
    appState.value.currentRoll = roll;
  };

  // 設定當前檢驗記錄
  const setCurrentInspection = (inspection: Inspection | undefined) => {
    appState.value.currentInspection = inspection;
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

  // 執行自動同步
  const performAutoSync = async () => {
    if (!appState.value.isOnline) {
      console.log('Offline, skipping auto sync');
      return;
    }

    try {
      console.log('Performing auto sync...');
      const { pushSuccess, pullSuccess } = await performFullSync(appState.value.lastSyncAt);
      
      if (pushSuccess && pullSuccess) {
        appState.value.lastSyncAt = new Date().toISOString();
        await updatePendingSyncCount();
        console.log('Auto sync completed successfully');
      } else {
        console.log('Auto sync completed with some failures');
      }
    } catch (error) {
      console.error('Auto sync failed:', error);
    }
  };

  // 手動同步
  const performManualSync = async (): Promise<boolean> => {
    try {
      console.log('Performing manual sync...');
      const { pushSuccess, pullSuccess } = await performFullSync(appState.value.lastSyncAt);
      
      if (pushSuccess && pullSuccess) {
        appState.value.lastSyncAt = new Date().toISOString();
        await updatePendingSyncCount();
        console.log('Manual sync completed successfully');
        return true;
      } else {
        console.log('Manual sync completed with some failures');
        return false;
      }
    } catch (error) {
      console.error('Manual sync failed:', error);
      return false;
    }
  };

  // 初始化應用程式狀態
  const initializeAppState = async () => {
    try {
      // 設定網路狀態監聽
      networkCleanup = onNetworkChange(updateNetworkStatus);
      
      // 更新待同步數量
      await updatePendingSyncCount();
      
      // 設定定時同步（每 60 秒）
      syncTimer = setInterval(() => {
        if (appState.value.isOnline) {
          void performAutoSync();
        }
      }, 30000);
      
      console.log('App state initialized');
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
    
    if (syncTimer) {
      clearInterval(syncTimer);
      syncTimer = null;
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
    performAutoSync,
    performManualSync,
    initializeAppState,
    cleanup
  };
}
