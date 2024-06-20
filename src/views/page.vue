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
            <a-button @click="onPageUpdate" :loading="collecting">
              <template #icon><SendOutlined /></template>
              跳转
            </a-button>
          </a-input-group>
          <a-button type="primary" :disabled="collecting">保存</a-button>
        </div>
      </a-layout-header>
      <a-layout class="space-x-3">
        <a-layout-content>
          <a-spin tip="页面元素收集中..." :spinning="collecting">
            <iframe
              class="w-full h-full border-none"
              :src="curUrl"
              ref="dspPage"
              @load="onPageLoad"
            />
            <div
              class="absolute left-0 right-0 overflow-y-scroll"
              :style="{ height: dspRect.height + 'px' }"
              @scroll="onPageScroll"
            >
              <svg class="w-full" :style="{ height: dspRect.sclHgt + 'px' }">
                <rect
                  v-if="selRect.width"
                  :x="selRect.x"
                  :y="selRect.y"
                  :rx="4"
                  :ry="4"
                  :width="selRect.width"
                  :height="selRect.height"
                  :style="{
                    'fill-opacity': 0,
                    'stroke-width': 3,
                    stroke: operas.stkColor
                  }"
                />
              </svg>
            </div>
          </a-spin>
          <div v-if="operas.locEleMod" class="absolute top-0 bottom-0 left-0 right-0" />
        </a-layout-content>
        <a-layout-sider theme="light" :width="300" class="space-y-2">
          <a-space>
            <a-button
              :type="operas.locEleMod ? 'primary' : 'text'"
              :disabled="collecting"
              @click="onLocEleClick"
            >
              <template #icon><AimOutlined /></template>
            </a-button>
            <a-button
              type="text"
              :disabled="collecting"
              @click="() => setProp(operas, 'stkClrVsb', true)"
            >
              <template #icon>
                <icon :style="{ color: operas.stkColor }">
                  <template #component>
                    <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024">
                      <rect :x="0" :y="0" :width="1024" :height="1024" :rx="20" :ry="20" />
                    </svg>
                  </template>
                </icon>
              </template>
            </a-button>
            <a-modal
              v-model:open="operas.stkClrVsb"
              title="选择框颜色"
              @ok="() => setProp(operas, 'stkClrVsb', false)"
            >
              <ColorSelect v-model:color="operas.stkColor" />
            </a-modal>
          </a-space>
          <a-spin tip="页面元素收集中..." :spinning="collecting">
            <a-tree
              class="overflow-auto absolute left-0 bottom-9 top-0 right-0"
              :auto-expand-parent="true"
              :tree-data="page.treeData"
              v-model:selectedKeys="page.selKeys"
            >
              <template #title="{ dataRef }">
                {{ dataRef.element ? dataRef.element.tagName : dataRef.title }}&nbsp;
                <span v-if="dataRef.element && dataRef.element.clazz">
                  .{{ dataRef.element.clazz }}
                </span>
              </template>
            </a-tree>
          </a-spin>
        </a-layout-sider>
      </a-layout>
    </a-layout>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/layouts/main.vue'
import Icon, {
  SendOutlined,
  RightOutlined,
  CloseCircleFilled,
  AimOutlined
} from '@ant-design/icons-vue'
import { computed, nextTick, reactive, ref } from 'vue'
import pgAPI from '@/apis/page'
import { TreeProps } from 'ant-design-vue'
import ColorSelect from '@lib/components/ColorSelect.vue'
import { setProp } from '@lib/utils'

type RectBox = {
  x: number
  y: number
  width: number
  height: number
}
type PageEle = {
  xpath: string
  tagName: string
  rectBox: { x: number; y: number; w: number; h: number }
}

const form = reactive<{ url: string; slots: any[] }>({ url: 'http://192.168.1.12:8096', slots: [] })
const page = reactive<{
  elMapper: Record<string, PageEle>
  treeData: TreeProps['treeData']
  expdKeys: (string | number)[]
  selKeys: (string | number)[]
}>({
  elMapper: {},
  treeData: [],
  expdKeys: [],
  selKeys: []
})
const curUrl = ref('')
const operas = reactive<{
  locEleMod: boolean
  stkColor: string
  stkClrVsb: boolean
}>({
  locEleMod: false,
  stkColor: 'red',
  stkClrVsb: false
})
const collecting = ref(false)
const dspPage = ref<HTMLIFrameElement | null>(null)
const dspRect = reactive<{ width: number; height: number; sclWid: number; sclHgt: number }>({
  width: 0,
  height: 0,
  sclWid: 0,
  sclHgt: 0
})
const selRect = computed<RectBox>(() => {
  if (!page.selKeys.length) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }
  const selKey = ((page.selKeys[0] as string).startsWith('*') ? '//' : '/') + page.selKeys[0]
  const selEl = page.elMapper[selKey]
  return {
    x: selEl.rectBox.x * dspRect.width,
    y: selEl.rectBox.y * dspRect.height,
    width: selEl.rectBox.w * dspRect.width,
    height: selEl.rectBox.h * dspRect.height
  }
})

async function onPageUpdate() {
  collecting.value = true
  curUrl.value = form.url
  const result = await pgAPI.colcElements(curUrl.value)
  page.elMapper = Object.fromEntries(result.elements.map((el: any) => [el.xpath, el]))
  page.treeData = result.treeData
  page.selKeys = []
  collecting.value = false
}
function onFmUrlClear() {
  curUrl.value = ''
}
function onLocEleClick() {
  operas.locEleMod = !operas.locEleMod
}
function onPageLoad() {
  try {
    dspRect.width = dspPage.value?.clientWidth as number
    dspRect.height = dspPage.value?.clientHeight as number
    const doc = dspPage.value?.contentDocument || window.document
    dspRect.sclWid = Math.max(
      doc.body.clientWidth,
      doc.documentElement.clientWidth,
      doc.body.scrollWidth,
      doc.documentElement.scrollWidth
    )
    dspRect.sclHgt = Math.max(
      doc.body.clientHeight,
      doc.documentElement.clientHeight,
      doc.body.scrollHeight,
      doc.documentElement.scrollHeight
    )
    console.log(dspRect.sclHgt)
  } catch (e) {
    console.error(e)
  }
}
function onPageScroll(e: Event) {
  nextTick(() => {
    dspPage.value?.contentWindow?.scrollTo({
      top: (e.target as any).scrollTop,
      behavior: 'smooth'
    })
    console.log(dspPage.value?.contentDocument?.body.scrollTop)
  })
}
</script>

<style>
.ant-tree-title {
  word-break: keep-all !important;
  white-space: nowrap !important;
}

.ant-spin-container {
  position: relative !important;
}
</style>
