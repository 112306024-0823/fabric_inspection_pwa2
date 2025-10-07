<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { initDatabase } from './database';

onMounted(async () => {
  try {
    await initDatabase();
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
});
</script>
