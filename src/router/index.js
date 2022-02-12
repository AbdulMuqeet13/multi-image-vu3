import { createRouter, createWebHistory } from 'vue-router'
import Form from '../views/Form.vue'

const routes = [
  {
    path: '/',
    name: 'Form',
    component: Form
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
