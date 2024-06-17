import puppeteer from 'puppeteer-core'


const ignTags = ['style', 'script', 'link', 'meta', 'head', 'header', 'title']
const browser = await puppeteer.launch({
  executablePath: 'C:\\Users\\shines\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
  // args: ['--no-sandbox', '--disable-setuid-sandbox']
})
const page = await browser.newPage()
page.on('console', msg => console.log(msg.text()))
await Promise.all([
  page.waitForNavigation(),
  page.goto('https://www.antdv.com/docs/vue/introduce-cn')
])

for (const el of await page.$$('*')) {
  console.log(
    await el.evaluate(function (el, ignTags) {
      const tagName = el.tagName.toLowerCase()
      const ret = { tagName, rectBox: el.getBoundingClientRect().toJSON() }
      if (ignTags.includes(tagName)) {
        return
      }
      if (el === document.body) {
        return { xpath: '/html/body', ...ret }
      }
      if (el.id !== '') {
        return { xpath: `//*[@id="${el.id}"]`, ...ret }
      }

      let index = 1
      const siblings =
        el.parentElement && el.parentElement.children ? el.parentElement.children : []
      for (const sibling of siblings) {
        if (sibling === el) {
          // 递归调用，获取父节点的 XPath 路径，然后拼接当前元素的标签名和索引
          const prtEl = arguments.callee(el.parentElement, ignTags)
          return prtEl
            ? {
                xpath: prtEl.xpath + `/${tagName}[${index}]`,
                ...ret
              }
            : undefined
        }

        if (sibling.nodeType === 1 && sibling.tagName === el.tagName) {
          index++ // 增加索引值
        }
      }
    }, ignTags)
  )
}

await browser.close()
