import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import MyLib from '@lib/index'
import './style.css'
import { createPinia } from 'pinia'
import axios from 'axios'

axios.interceptors.request.use(
  function (config) {
    const token = `Bearer ${localStorage.getItem('token')}`
    if (token) {
      config.headers.setAuthorization(token)
    }
    return config
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

axios.defaults.baseURL = import.meta.env.PROD ? 'http://218.242.30.111:6031' : undefined

createApp(App).use(router).use(Antd).use(MyLib).use(createPinia()).mount('#app')
