<template>
  <MainLayout>
    <a-layout class="h-full">
      <a-layout-header class="bg-white">
        <div class="h-[64px] flex space-x-2.5 items-center">
          <a-input-group class="flex-1 flex" compact>
            <a-input
              class="flex-1"
              allowClear
              v-model:value="page.form.url"
              @pressEnter="onPageUpdate"
            >
              <template #prefix><RightOutlined /></template>
              <template #clearIcon><CloseCircleFilled @click="onFmUrlClear" /></template>
            </a-input>
            <a-button @click="onPageUpdate" :loading="collecting">
              <template #icon><SendOutlined /></template>
              跳转
            </a-button>
          </a-input-group>
          <a-button type="primary" :disabled="collecting" @click="onPageSave">保存</a-button>
        </div>
      </a-layout-header>
      <a-layout class="space-x-3 bg-white">
        <a-layout-content>
          <a-spin tip="页面元素收集中..." :spinning="collecting">
            <iframe
              class="w-full h-full border-none"
              :src="curUrl"
              ref="dspPage"
              @load="onPageLoad"
            />
            <a-dropdown :trigger="['contextmenu']">
              <div
                class="absolute left-0 right-0"
                :style="{ height: dspRect.height + 'px' }"
                @scroll="onPageScroll"
                @mousemove="onMouseMove"
                @click="() => setProp(operas, 'locEleMod', false)"
                @mouseup="onMouseUp"
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
                      stroke: operas.selStkColor
                    }"
                  />

                  <rect
                    v-for="slot in page.form.slots.filter(
                      slot => !page.selKeys.includes(slot.xpath)
                    )"
                    :key="slot.xpath"
                    class="cursor-pointer"
                    :x="page.elMapper[slot.xpath].rectBox.x"
                    :y="page.elMapper[slot.xpath].rectBox.y"
                    :rx="4"
                    :ry="4"
                    :width="page.elMapper[slot.xpath].rectBox.width"
                    :height="page.elMapper[slot.xpath].rectBox.height"
                    :style="{
                      'fill-opacity': 0,
                      'stroke-width': 3,
                      stroke: operas.slotStkColor
                    }"
                    @click="() => setProp(page, 'selKeys', [slot.xpath])"
                  />
                </svg>
                <a-tag
                  v-for="(slot, index) in page.form.slots.filter(
                    slot => !page.selKeys.includes(slot.xpath)
                  )"
                  :key="slot.xpath"
                  class="absolute cursor-pointer"
                  :style="{
                    top: page.elMapper[slot.xpath].rectBox.y + 'px',
                    right:
                      page.elMapper[slot.xpath].rectBox.x +
                      page.elMapper[slot.xpath].rectBox.width +
                      'px'
                  }"
                  :color="operas.slotStkColor"
                  @click="() => setProp(page, 'selKeys', [slot.xpath])"
                >
                  {{ index + 1 }}
                </a-tag>
              </div>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="select">检查</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-spin>
        </a-layout-content>
        <a-layout-sider theme="light" :width="300" class="space-y-2">
          <div class="h-full flex flex-col">
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
                  <icon :style="{ color: operas.selStkColor }">
                    <template #component>
                      <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024">
                        <rect :x="0" :y="0" :width="1024" :height="1024" :rx="20" :ry="20" />
                      </svg>
                    </template>
                  </icon>
                </template>
              </a-button>
            </a-space>
            <a-spin wrapperClassName="flex-1" tip="页面元素收集中..." :spinning="collecting">
              <a-tree
                class="overflow-auto absolute top-0 bottom-0 left-0 right-0"
                :auto-expand-parent="true"
                :tree-data="page.treeData"
                v-model:expendedKeys="page.expKeys"
                v-model:selectedKeys="page.selKeys"
              >
                <template #title="{ dataRef }">
                  {{ dataRef.element ? dataRef.element.tagName : dataRef.title }}&nbsp;
                  <template v-if="dataRef.element">
                    <span v-if="dataRef.element.id">#{{ dataRef.element.id }}</span>
                    <span v-else-if="dataRef.element.clazz">.{{ dataRef.element.clazz }}</span>
                  </template>
                </template>
              </a-tree>
            </a-spin>
            <a-collapse v-model:activeKey="operas.actKey" :bordered="false">
              <a-collapse-panel v-if="page.selKeys.length" key="1" :header="page.selKeys[0]">
                <FormGroup
                  layout="vertical"
                  :mapper="slotMapper"
                  :form="slotForm"
                  :rules="{
                    value: [{ required: true, message: '必须填入值！' }]
                  }"
                  @update:fprop="
                    values => Object.entries(values).map(([k, v]) => setProp(slotForm, k, v))
                  "
                >
                  <template #value="{ formState }">
                    <a-input v-model:value="formState.value">
                      <template #addonBefore>
                        <a-button
                          type="text"
                          size="small"
                          @click="() => setProp(formState, 'valEnc', !formState.valEnc)"
                        >
                          <template #icon>
                            <LockOutlined v-if="formState.valEnc" />
                            <UnlockOutlined v-else />
                          </template>
                        </a-button>
                      </template>
                    </a-input>
                  </template>
                </FormGroup>
                <a-button class="w-full" type="primary" @click="onSlotSave">提交</a-button>
                <template #extra>
                  <CloseOutlined @click="() => setProp(page, 'selKeys', [])" />
                </template>
              </a-collapse-panel>
              <a-collapse-panel v-else-if="page.form.slots.length" key="2">
                <template #header>
                  已关联槽&nbsp;
                  <a-tag v-if="page.form.slots.length" color="#f50">
                    {{ page.form.slots.length }}
                  </a-tag>
                </template>
                <a-descriptions :column="1">
                  <a-descriptions-item v-for="slot in page.form.slots" :key="slot.xpath">
                    <template #label>
                      <a @click="() => setProp(page, 'selKeys', [slot.xpath])">{{ slot.xpath }}</a>
                    </template>
                    <div class="flex-1 flex justify-between">
                      <span v-if="slot.valEnc">●●●●</span>
                      <span v-else>{{ slot.value }}</span>
                      <a-button
                        size="small"
                        type="text"
                        danger
                        @click="() => onSlotRemove(slot.xpath)"
                      >
                        <template #icon><DeleteOutlined /></template>
                      </a-button>
                    </div>
                  </a-descriptions-item>
                </a-descriptions>
              </a-collapse-panel>
            </a-collapse>
          </div>
        </a-layout-sider>
      </a-layout>
    </a-layout>
  </MainLayout>
  <a-modal
    v-model:open="operas.stkClrVsb"
    title="选择框颜色"
    @ok="() => setProp(operas, 'stkClrVsb', false)"
  >
    <ColorSelect v-model:color="operas.selStkColor" />
  </a-modal>
</template>

<script setup lang="ts">
import MainLayout from '@/layouts/main.vue'
import Icon, {
  SendOutlined,
  RightOutlined,
  CloseCircleFilled,
  AimOutlined,
  CloseOutlined,
  LockOutlined,
  UnlockOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import { computed, createVNode, nextTick, onMounted, reactive, ref, watch } from 'vue'
import pgAPI from '@/apis/page'
import { Modal, TreeProps } from 'ant-design-vue'
import ColorSelect from '@lib/components/ColorSelect.vue'
import { setProp } from '@lib/utils'
import { RectBox, inRect } from '@/utils'
import FormGroup from '@lib/components/FormGroup.vue'
import Mapper from '@lib/types/mapper'
import mdlAPI from '@/apis/model'
import { useRoute } from 'vue-router'
import Page, { Slot } from '@/types/page'

type PageEle = {
  xpath: string
  tagName: string
  rectBox: RectBox
}
const slotMapper = new Mapper({
  itype: {
    label: '填入方式',
    type: 'Select',
    options: [
      {
        label: '输入',
        value: 'input'
      },
      {
        label: '选择',
        value: 'select'
      },
      {
        label: '点击',
        value: 'click'
      }
    ]
  },
  value: {
    label: '填入值',
    type: 'Input'
  },
  valEnc: {
    label: '加密值',
    type: 'Checkbox',
    display: false
  }
})

const route = useRoute()
const page = reactive<{
  form: Page
  elMapper: Record<string, PageEle>
  treeData: TreeProps['treeData']
  expKeys: (string | number)[]
  selKeys: (string | number)[]
}>({
  form: Page.copy({ url: 'http://218.242.30.111:8096' }),
  elMapper: {},
  treeData: [],
  expKeys: [],
  selKeys: []
})
const curUrl = ref('')
const operas = reactive<{
  locEleMod: boolean
  selStkColor: string
  slotStkColor: string
  stkClrVsb: boolean
  actKey: string[]
}>({
  locEleMod: false,
  selStkColor: 'red',
  slotStkColor: 'green',
  stkClrVsb: false,
  actKey: ['1']
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
  return page.elMapper[page.selKeys[0]].rectBox
})
const slotForm = reactive<Slot>(new Slot())

onMounted(async () => {
  if (!route.params.pid || route.params.pid === 'n') {
    return
  }
  Page.copy(await mdlAPI.get('page', route.params.pid), page.form, true)
})
watch(
  () => page.selKeys,
  () => {
    if (!page.selKeys.length) {
      slotForm.reset()
      return
    }
    Slot.copy(
      page.form.slots.find(slot => slot.xpath === page.selKeys[0]),
      slotForm,
      true
    )
    slotForm.xpath = page.selKeys[0] as string
    operas.actKey = ['1']
  },
  { deep: true }
)

async function onPageUpdate() {
  collecting.value = true
  curUrl.value = page.form.url
  const result = await pgAPI.colcElements(
    curUrl.value,
    dspPage.value?.getBoundingClientRect() as DOMRect
  )
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
function onMouseMove(e: MouseEvent) {
  e.preventDefault()
  if (!operas.locEleMod) {
    return
  }
  const el = poiOnEle(e.offsetX, e.offsetY)
  page.selKeys = el ? [el.xpath] : []
}
function onMouseUp(e: MouseEvent) {
  if (e.button === 2) {
    e.preventDefault()
    const el = poiOnEle(e.offsetX, e.offsetY)
    page.selKeys = el ? [el.xpath] : []
  }
}
function poiOnEle(x: number, y: number): PageEle | null {
  const els = []
  for (const el of Object.values(page.elMapper)) {
    if (inRect({ x, y }, el.rectBox)) {
      els.push(el)
    }
  }
  const minRect = {
    width: Number.MAX_VALUE,
    height: Number.MAX_VALUE,
    el: null as PageEle | null
  }
  for (const el of els) {
    if (el.rectBox.width < minRect.width && el.rectBox.height < minRect.height) {
      minRect.el = el
    }
  }
  return minRect.el
}
function onSlotSave() {
  const idSlot = page.form.slots.find(slot => slot.xpath === page.selKeys[0])
  if (idSlot) {
    idSlot.value = slotForm.value
  } else {
    page.form.slots.push(Slot.copy(slotForm))
  }
  slotForm.reset()
  page.selKeys = []
}
async function onPageSave() {
  console.log(page.form)
  if (route.query.pid) {
    await mdlAPI.update('page', route.query.pid, page.form)
  } else {
    await mdlAPI.add('page', page.form)
  }
  page.form.reset()
}
function onSlotRemove(xpath: string) {
  Modal.confirm({
    title: '确定删除该槽？',
    icon: createVNode(ExclamationCircleOutlined),
    onOk() {
      page.form.slots.splice(
        page.form.slots.findIndex(slot => slot.xpath === xpath),
        1
      )
    }
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
