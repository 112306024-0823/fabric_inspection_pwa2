import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // 添加路由守衛來處理導航錯誤
  Router.beforeEach((to, from, next) => {
    console.log('🧭 Router navigation:', from.path, '→', to.path);
    
    // 確保路由參數有效
    if (to.path.startsWith('/inspect/')) {
      const rollId = to.params.rollId as string;
      if (!rollId || rollId === 'undefined' || rollId === 'null') {
        console.warn('❌ Invalid rollId in route:', rollId);
        next('/');
        return;
      }
    }
    
    next();
  });

  // 處理路由錯誤
  Router.onError((error) => {
    console.error('🚨 Router error:', error);
    
    // 如果是 vnode 相關錯誤，嘗試重新導航到首頁
    if (error.message?.includes('vnode') || error.message?.includes('Cannot destructure')) {
      console.log('🔄 Attempting to recover from vnode error...');
      Router.push('/').catch(err => {
        console.error('Failed to recover:', err);
      });
    }
  });

  return Router;
});
