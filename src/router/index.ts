import axios from 'axios'
import { makeRequest } from '@lib/utils'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Model from '../views/model.vue'
import login from '../views/login.vue'
import project from '@/jsons/project.json'
import Home from '../views/home.vue'
import Page from '../views/page.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: `/${project.name}/`
  },
  {
    path: `/${project.name}/`,
    redirect: `/${project.name}/home`
  },
  {
    path: `/${project.name}/home`,
    name: 'Home',
    component: Home
  },
  {
    path: `/${project.name}/:mname`,
    name: 'model',
    component: Model,
    meta: { reqLogin: true }
  },
  {
    path: `/${project.name}/page/:pid/edit`,
    name: 'Page',
    component: Page,
    meta: { reqLogin: true }
  }
  ,
  {
    path: '/login_platform/login',
    name: 'login',
    component: login
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, _from, next) => {
  if (to.matched.some(record => record.meta.reqLogin) && true) {
    try {
      const result = await makeRequest(
        axios.post([
          '/login_platform',
          '/api/v1/',
          'account',
          '/verify'
        ].join(''), undefined, {
          headers: { authorization: 'Bearer ' + (localStorage.getItem('token') || '') }
        })
      )
      if (result.error) {
        throw new Error(result.data.error)
      }
      next()
    } catch (e) {
      next({
        path: '/login_platform/login',
        query: {
          redirect: to.fullPath
        }
      })
    }
  } else {
    next() // 确保一定要调用 next()
  }
})

export default router
