<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  const htmlElement = document.documentElement;
  const theme = localStorage.getItem('theme') || 'dark';
  htmlElement.setAttribute('theme', theme);
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
