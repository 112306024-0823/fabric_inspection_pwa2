<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>

        <q-toolbar-title>    Makalot Fabric Inspection System </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <!-- 移除側邊 Essential Links -->

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 保留按鈕行為但不顯示 drawer
const leftDrawerOpen = ref(false);

function toggleLeftDrawer() { leftDrawerOpen.value = !leftDrawerOpen.value; }
</script>
