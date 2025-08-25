<template>
  <component :is="layoutComponent">
    <RouterView />
  </component>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useLanguage } from './composables/useLanguage';

const { initLanguage } = useLanguage();
const route = useRoute();

onMounted(() => {
  const htmlElement = document.documentElement;
  const theme = localStorage.getItem('theme') || 'dark';
  htmlElement.setAttribute('theme', theme);
  initLanguage();
});

import { layouts, type LayoutName } from '@/layouts';

const layoutComponent = computed(() => {
  const layoutName = route.meta.layout as LayoutName | undefined;
  return (layoutName && layouts[layoutName]) || layouts.DefaultLayout;
});
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Nunito&display=swap');

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

#app {
  font-family: Nunito, sans-serif;
  color: #020202;
}
</style>
