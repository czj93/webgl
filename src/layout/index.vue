<template>
    <div class="wrapper">
        <div class="left-side">
            <SideBar />
        </div>
        <div class="content">
            <router-view />
        </div>
    </div>
</template>
<script setup>
import SideBar from '../components/SideBar.vue'
</script>
<style>
.wrapper {
    width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: flex-start;
}
.left-side {
    flex-basis: 160px;
}
.content {
    flex: 1;
}
</style>