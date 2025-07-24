<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  mounted() {
    const htmlElement = document.documentElement;
    const theme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('theme', theme);
  },
  metaInfo: {
    // if no subcomponents specify a metaInfo.title, this title will be used
    title: 'Groupomania',
    // all titles will be injected into this template;ifnosubcomponentsspecifyametaInfo.title,thistitlewillbeusedtitleifnosubcomponentsspecifyametaInfo.title,thistitlewillbeusedtitle
    titleTemplate: ' Groupomania | %s',titleTemplate
  },
};
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
