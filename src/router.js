import { createRouter, createWebHistory } from 'vue-router'
import DevTools from './views/DevTools.vue'
import Main from './views/Main.vue'

const routes = [
    { path: '/', component: Main },
    { path: '/editor', component: DevTools }
]

export default createRouter({ history: createWebHistory(), routes })