<!-- <script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
// import HelloWorld from './components/HelloWorld.vue'
// import MyCanvas from './components/MyCanvas.vue'
// import Layout from './layout/index.vue'
</script> -->

<template>
  <router-view />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
html, body {
  background: #ddd;
}
canvas {
  width: 350px;
  height: 350px;
}

.contral-wrap span {
    display: inline-block;
    width: 100px;
}
</style>
