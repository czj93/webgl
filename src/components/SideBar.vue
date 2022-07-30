<template>
    <ul>
        <li v-for="menu in menus" :key="menu.path">
            <router-link :to="menu.redirect || menu.path">{{ menu.meta && menu.meta.title || menu.name }}</router-link>
            <ul v-if="menu.children && menu.children.length">
                <li v-for="childMenu in menu.children" :key="childMenu.path">
                    <router-link :to="reslovePath(menu, childMenu)">{{ childMenu.meta && childMenu.meta.title || childMenu.name }}</router-link>
                </li>
            </ul>
        </li>
    </ul>
</template>

<script setup>
import { routes } from '../router/index'
import { ref } from 'vue'

function transform(list) {

    return list.map(item => {
        const obj = {
            path: item.path,
            redirect: item.redirect,
            meta: item.meta,
        }
        if (item.children) obj.children = transform(item.children)
        return obj
    })
}

const list = transform(routes)

const menus = ref(list)

const reslovePath = (parent, menu) => {
    if (/^\//.test(menu.path)) return menu.path

    if (parent) return parent.path + '/' + menu.path

    return menu.path
}

</script>

<style scoped>
ul {
    list-style: none;
    margin-left: 0;
    text-align: left;
}
ul a {
    color: #666;
    text-decoration: none;
}
ul a:hover {
    color: #1c61eb;
}
a.router-link-exact-active {
    color: #1c61eb;
}
</style>