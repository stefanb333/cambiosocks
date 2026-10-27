/**
 * UX provera na telefonu (390px, dodir): mete za dodir manje od 44x44px, tekst manji od 12px,
 * polja za unos manja od 16px (iOS zumira) i elementi koji izlaze iz ekrana.
 *   node scripts/ux-audit.mjs [putanje...]
 * Element sa klasom .hit se računa kao 44x44 (proširena površina za dodir, globals.css).
 */
import { chromium, devices } from '@playwright/test'

const base = process.env.BASE_URL || 'http://localhost:3000'
const paths = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      '/',
      '/kolekcije/sve',
      '/proizvodi/muske-carape',
      '/korpa',
      '/porucivanje',
      '/o-nama',
      '/kontakt',
      '/cesta-pitanja',
      '/blog',
      '/pretraga?q=carape',
      '/dostava',
      '/nepostojeca',
    ]
const width = Number(process.env.WIDTH || 390)

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent: devices['iPhone 13'].userAgent,
  reducedMotion: 'reduce',
})
if (process.env.CART)
  await context.addInitScript(
    (cart) => localStorage.setItem('cambio-cart-v1', cart),
    process.env.CART,
  )

for (const path of paths) {
  const page = await context.newPage()
  await page.goto(base + path, { waitUntil: 'load', timeout: 120000 })
  await page.waitForTimeout(1500)
  const report = await page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return (
        r.width > 0 &&
        r.height > 0 &&
        s.visibility !== 'hidden' &&
        s.display !== 'none' &&
        !el.closest('[aria-hidden="true"], dialog:not([open]), [hidden]')
      )
    }
    const label = (el) =>
      (
        el.getAttribute('aria-label') ||
        el.textContent ||
        el.getAttribute('placeholder') ||
        el.getAttribute('name') ||
        el.tagName
      )
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 40)
    const small = []
    for (const el of document.querySelectorAll(
      'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], label:has(input[type=checkbox]), label:has(input[type=radio])',
    )) {
      if (!visible(el)) continue
      if (el.matches('input[type=checkbox], input[type=radio]') && el.closest('label')) continue
      if (el.closest('.hit') || el.classList.contains('hit')) continue
      const r = el.getBoundingClientRect()
      if (r.width < 43.5 || r.height < 43.5)
        small.push(
          `${Math.round(r.width)}x${Math.round(r.height)} ${el.tagName.toLowerCase()} "${label(el)}"`,
        )
    }
    const tiny = new Set()
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const node = walker.currentNode
      const el = node.parentElement
      if (!node.textContent.trim() || !el || !visible(el)) continue
      const fs = parseFloat(getComputedStyle(el).fontSize)
      if (fs < 12) tiny.add(`${fs}px "${node.textContent.trim().slice(0, 30)}"`)
    }
    const inputs = [
      ...document.querySelectorAll(
        'input:not([type=hidden]):not([type=checkbox]):not([type=radio]), select, textarea',
      ),
    ]
      .filter(visible)
      .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
      .map((el) => `${getComputedStyle(el).fontSize} ${label(el)}`)
    return {
      small,
      tiny: [...tiny],
      inputs,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
    }
  })
  console.log(
    `\n== ${path}  (dodir <44: ${report.small.length}, tekst <12px: ${report.tiny.length}, polja <16px: ${report.inputs.length}${report.overflow ? ', HORIZONTALNI SKROL' : ''})`,
  )
  for (const s of report.small) console.log('  dodir  ', s)
  for (const s of report.tiny) console.log('  tekst  ', s)
  for (const s of report.inputs) console.log('  polje  ', s)
  await page.close()
}
await browser.close()
