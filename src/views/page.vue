<template>
  <MainLayout>
    <a-layout class="h-full">
      <a-layout-header class="bg-white">
        <div class="h-[64px] flex space-x-2.5 items-center">
          <a-input-group class="flex-1 flex" compact>
            <a-input class="flex-1" allowClear v-model:value="form.url" @pressEnter="onPageUpdate">
              <template #prefix><RightOutlined /></template>
              <template #clearIcon><CloseCircleFilled @click="onFmUrlClear" /></template>
            </a-input>
            <a-button @click="onPageUpdate">
              <template #icon><SendOutlined /></template>
              跳转
            </a-button>
          </a-input-group>
          <a-button type="primary">保存</a-button>
        </div>
      </a-layout-header>
      <a-layout>
        <a-layout-content class="relative">
          <iframe class="w-full h-full border-none" :src="curUrl" />
          <div v-if="locEleMod" class="absolute top-0 bottom-0 left-0 right-0" />
        </a-layout-content>
        <a-layout-sider theme="light" :width="300" class="flex flex-col p-3 space-y-2">
          <a-space>
            <a-button :type="locEleMod ? 'primary' : 'text'" @click="onLocEleClick">
              <template #icon><AimOutlined /></template>
            </a-button>
          </a-space>
          <a-list :data-source="form.slots">
            <template #renderItem="{ item }">
              <a-list-item>{{ item }}</a-list-item>
            </template>
          </a-list>
        </a-layout-sider>
      </a-layout>
    </a-layout>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/layouts/main.vue'
import { SendOutlined, RightOutlined, CloseCircleFilled, AimOutlined } from '@ant-design/icons-vue'
import { reactive, ref } from 'vue'
import pgAPI from '@/apis/page'

const form = reactive<{ url: string; slots: any[] }>({ url: '', slots: [] })
const curUrl = ref('')
const locEleMod = ref(false)

async function onPageUpdate() {
  curUrl.value = form.url
  const resp = await pgAPI.colcElements(curUrl.value)
  console.log(resp.data)
}
function onFmUrlClear() {
  curUrl.value = ''
}
function onLocEleClick() {
  locEleMod.value = !locEleMod.value
}
</script>
