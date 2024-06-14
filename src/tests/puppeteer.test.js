import puppeteer from 'puppeteer-core'

async function getXPath(element) {
  /** 特殊元素特殊处理
   * @param {Any} element
   **/
  if (element.id !== '') {
    // 如果元素具有 ID 属性
    // 返回格式为 '//*[@id="elementId"]' 的 XPath 路径
    return `//*[@id="${element.id}"]`
  }

  /** 获取元素兄弟元素
   * @param {Unknown} element
   * @returns {Unknown}
   * @returns {Unknown}
   **/
  let index = 1
  // 获取当前元素的父节点的子节点列表
  const siblings =
    element.parentNode && element.parentNode.childNodes ? element.parentNode.childNodes : []

  /** 遍历所有兄弟元素
   * @param {Any} array 集合
   * @returns {Any} 索引
   **/
  for (const sibling of siblings) {
    /** 遍历到当前元素
     * @param {Unknown} element
     * @param {Unknown} sibling
     **/
    if (sibling === element) {
      // 递归调用，获取父节点的 XPath 路径，然后拼接当前元素的标签名和索引
      return [
        await window.getXPath(element.parentNode),
        `/${element.tagName.toLowerCase()}`,
        `[${index}]`
      ].join('')
    }

    /** 遍历到具有相同标签名的元素
     * @param {Unknown} sibling
     * @param {Unknown} element
     * @param {Unknown} index
     **/
    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
      index++ // 增加索引值
    }
  }
}

const browser = await puppeteer.launch({
  executablePath: 'C:\\Users\\shines\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
  // args: ['--no-sandbox', '--disable-setuid-sandbox']
})
const page = await browser.newPage()
page.on('console', msg => console.log(msg.text()))
await page.exposeFunction('getXPath', getXPath)
await Promise.all([
  page.waitForNavigation(),
  page.goto('https://www.antdv.com/docs/vue/introduce-cn')
])

await page.$$eval('*', async function (els) {
  for (const el of els) {
    if (['style', 'script', 'link', 'meta'].includes(el.tagName.toLowerCase())) {
      continue
    }
    if (el === document.body) {
      console.log('/html/body')
      continue
    }
    console.log(
      await getXPath({
        id: el.id,
        tagName: el.tagName,
        parentNode: el.parentNode
      })
    )
  }
})

await browser.close()
