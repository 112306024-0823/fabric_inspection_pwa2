import { boot } from 'quasar/wrappers';
import { useAppState } from '../composables/useAppState';

export default boot(() => {
  // 初始化應用程式狀態
  const { initializeAppState } = useAppState();
  
  // 在應用程式啟動時初始化狀態
  void initializeAppState();
  
  // 監聽 Service Worker 訊息
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SYNC_REQUEST') {
        // 觸發同步
        const { performAutoSync } = useAppState();
        void performAutoSync();
      }
    });
  }
});
