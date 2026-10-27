/**
 * Snimci stranice na svim ciljnim širinama + provera horizontalnog skrola i elemenata
 * koji izlaze van ekrana.
 *   node scripts/screens.mjs <putanja> <naziv> [širine]
 *   CART='[...]' node scripts/screens.mjs /korpa korpa   (korpa iz localStorage)
 * Snimci: docs/screenshots/<naziv>-<širina>.png
 */
import fs from 'node:fs'
import { chromium, devices } from '@playwright/test'

const [path = '/', name = 'stranica', list] = process.argv.slice(2)
const base = process.env.BASE_URL || 'http://localhost:3000'
const widths = list
  ? list.split(',').map(Number)
  : [360, 390, 430, 768, 1024, 1280, 1440, 1920, 2560]
fs.mkdirSync('docs/screenshots', { recursive: true })

const browser = await chromium.launch()
let problems = 0
for (const width of widths) {
  const mobile = width < 768
  const context = await browser.newContext({
    viewport: { width, height: mobile ? 844 : 1024 },
    deviceScaleFactor: mobile ? 2 : 1,
    isMobile: mobile,
    hasTouch: mobile,
    userAgent: mobile ? devices['iPhone 13'].userAgent : undefined,
    // Statični snimci: bez animacija (otkrivanje, paralaksa), isto kao kod korisnika sa "smanji pokrete".
    reducedMotion: 'reduce',
  })
  // CART='[{"variantId":274,"quantity":2}]' puni korpu za snimke /korpa i /porucivanje.
  if (process.env.CART) {
    await context.addInitScript(
      (cart) => localStorage.setItem('cambio-cart-v1', cart),
      process.env.CART,
    )
  }
  const page = await context.newPage()
  await page.goto(base + path, { waitUntil: 'load', timeout: 120000 })
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  await page.evaluate(async () => {
    await document.fonts.ready
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 50))
    }
    window.scrollTo(0, 0)
  })
  await page
    .waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 30000 })
    .catch(() => {})
  await page.waitForTimeout(400)

  const report = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    const scroll = document.documentElement.scrollWidth
    const offenders = []
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      // Elementi unutar horizontalnih slidera smeju da izlaze (skroluju se unutar sebe).
      if (el.closest('.snap-row')) continue
      const style = getComputedStyle(el)
      if (style.position === 'fixed' || el.closest('dialog')) continue
      if (r.right > vw + 1 || r.left < -1) {
        offenders.push(
          `${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 3).join('.')} [${Math.round(r.left)}..${Math.round(r.right)}]`,
        )
      }
    }
    return { vw, scroll, offenders: offenders.slice(0, 8) }
  })
  const file = `docs/screenshots/${name}-${width}.png`
  await page.screenshot({ path: file, fullPage: true })
  const bad = report.scroll > report.vw
  if (bad || report.offenders.length) problems++
  console.log(
    `${width}px: ${bad ? 'HORIZONTALNI SKROL ' + report.scroll + '>' + report.vw : 'bez horizontalnog skrola'}${report.offenders.length ? '\n   van ekrana: ' + report.offenders.join('\n               ') : ''}`,
  )
  await context.close()
}
await browser.close()
process.exit(problems ? 1 : 0)
