<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>Makalot Fabric Inspection System</q-toolbar-title>
        
        <!-- 狀態和同步按鈕 -->
        <div class="row items-center q-gutter-sm">
          <!-- 線上/離線狀態 -->
          <q-chip 
            :color="isOnline ? 'positive' : 'negative'" 
            text-color="white" 
            icon="wifi"
            size="md"
          >
            {{ isOnline ? 'Online' : 'Offline' }}
          </q-chip>
          
          <!-- 待同步數量 -->
          <q-chip 
            v-if="pendingSyncCount > 0"
            color="warning" 
            text-color="white" 
            icon="sync_problem"
            size="md"
          >
            {{ pendingSyncCount }} 待同步
          </q-chip>
          
          <!-- 同步按鈕 -->
          <q-btn 
            flat 
            round 
            icon="sync" 
            @click="handleSync"
            :loading="syncing"
            :disable="!isOnline"
            size="md"
            class="sync-btn"
          >
            <q-tooltip>{{ isOnline ? '同步資料' : '離線狀態無法同步' }}</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- 移除側邊 Essential Links -->

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppState } from '../composables/useAppState';

// 保留按鈕行為但不顯示 drawer
const leftDrawerOpen = ref(false);

function toggleLeftDrawer() { leftDrawerOpen.value = !leftDrawerOpen.value; }

// 使用應用狀態
const { isOnline, pendingSyncCount, performAutoSync } = useAppState();

// 同步狀態
const syncing = ref(false);

// 處理同步
const handleSync = async () => {
  if (!isOnline.value) return;
  
  syncing.value = true;
  try {
    await performAutoSync();
  } catch (error) {
    console.error('Sync failed:', error);
  } finally {
    syncing.value = false;
  }
};
</script>

<style scoped>
.sync-btn {
  transition: all 0.3s ease;
}

.sync-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sync-btn:not(:disabled):hover {
  transform: scale(1.1);
}

/* 響應式調整 */
@media (max-width: 768px) {
  .q-toolbar {
    padding: 0 8px;
  }
  
  .q-toolbar-title {
    font-size: 1.1rem;
  }
  
  .q-chip {
    font-size: 0.8rem;
  }
  
  .q-btn {
    min-width: 36px;
    min-height: 36px;
  }
}
</style>
