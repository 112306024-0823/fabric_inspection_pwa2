import { boot } from 'quasar/wrappers';
import { useAppState } from '../composables/useAppState';

export default boot(({ app, router }) => {
  // 初始化應用程式狀態
  const { initializeAppState } = useAppState();
  
  // 在應用程式啟動時初始化狀態
  void initializeAppState();
  
  // 添加全局錯誤處理
  app.config.errorHandler = (error, instance, info) => {
    console.error('🚨 Global error handler:', error, info);
    
    // 如果是 vnode 相關錯誤，嘗試導航到首頁
    if (error.message?.includes('vnode') || error.message?.includes('Cannot destructure')) {
      console.log('🔄 Attempting to recover from vnode error via global handler...');
      router.push('/').catch(err => {
        console.error('Failed to recover via global handler:', err);
      });
    }
  };
  
  // 添加未處理的 Promise 錯誤處理
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection:', event.reason);
    
    // 如果是路由相關錯誤，防止頁面崩潰
    if (event.reason?.message?.includes('vnode') || 
        event.reason?.message?.includes('Cannot destructure') ||
        event.reason?.message?.includes('navigation')) {
      event.preventDefault();
      console.log('🔄 Prevented page crash from unhandled rejection');
    }
  });
  
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
