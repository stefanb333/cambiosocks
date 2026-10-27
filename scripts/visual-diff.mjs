/**
 * Poređenje stranice sa Figma eksportom na 1440px.
 *   node scripts/visual-diff.mjs <url> <figma.png> <izlaz-prefix> [visinaSekcije=600]
 * Pravi: <prefix>-site.png (snimak sajta), <prefix>-diff.png (razlike crveno) i
 * <prefix>-side.png (Figma levo | sajt desno), i ispisuje procenat razlike po trakama.
 */
import { chromium } from '@playwright/test'
import sharp from 'sharp'

// siteOffset: koliko px preskočiti na vrhu sajta (npr. header kojeg nema u Figma frejmu)
const [url, figmaPath, prefix, bandArg, siteOffsetArg] = process.argv.slice(2)
const siteOffset = Number(siteOffsetArg || 0)
const band = Number(bandArg || 600)
const width = 1440

const browser = await chromium.launch()
// reducedMotion: poređenje sa Figmom bez animacija (D-057)
const page = await browser.newPage({
  viewport: { width, height: 1024 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
})
await page.goto(url, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
// Učitaj lazy slike
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) {
    window.scrollTo(0, y)
    await new Promise((r) => setTimeout(r, 60))
  }
  window.scrollTo(0, 0)
})
await page
  .waitForFunction(
    () => [...document.images].every((i) => i.complete && i.naturalWidth > 0),
    null,
    { timeout: 60000 },
  )
  .catch(() => console.log('Upozorenje: neke slike nisu učitane'))
await page.waitForTimeout(800)
await page.screenshot({ path: `${prefix}-site.png`, fullPage: true })
await browser.close()

const figma = sharp(figmaPath)
const fm = await figma.metadata()
const site = sharp(`${prefix}-site.png`)
const sm = await site.metadata()
const height = Math.min(fm.height, sm.height - siteOffset)
console.log(`Figma ${fm.width}x${fm.height}, sajt ${sm.width}x${sm.height}, poredi se ${height}px`)

const a = await sharp(figmaPath)
  .extract({ left: 0, top: 0, width, height })
  .removeAlpha()
  .raw()
  .toBuffer()
const b = await sharp(`${prefix}-site.png`)
  .extract({ left: 0, top: siteOffset, width, height })
  .removeAlpha()
  .raw()
  .toBuffer()
const diff = Buffer.alloc(width * height * 3)
const bands = []
let total = 0
for (let y = 0; y < height; y++) {
  const bi = Math.floor(y / band)
  bands[bi] ??= 0
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 3
    const d = Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2])
    const bad = d > 60
    if (bad) {
      total++
      bands[bi]++
      diff[i] = 255
      diff[i + 1] = 0
      diff[i + 2] = 0
    } else {
      const g = Math.round(((a[i] + a[i + 1] + a[i + 2]) / 3) * 0.35 + 160)
      diff[i] = diff[i + 1] = diff[i + 2] = g
    }
  }
}
await sharp(diff, { raw: { width, height, channels: 3 } })
  .png()
  .toFile(`${prefix}-diff.png`)
await sharp({ create: { width: width * 2, height, channels: 3, background: '#fff' } })
  .composite([
    {
      input: await sharp(figmaPath).extract({ left: 0, top: 0, width, height }).png().toBuffer(),
      left: 0,
      top: 0,
    },
    {
      input: await sharp(`${prefix}-site.png`)
        .extract({ left: 0, top: siteOffset, width, height })
        .png()
        .toBuffer(),
      left: width,
      top: 0,
    },
  ])
  .png()
  .toFile(`${prefix}-side.png`)

console.log(`Ukupna razlika: ${((total / (width * height)) * 100).toFixed(2)}%`)
bands.forEach((n, i) => {
  const h = Math.min(band, height - i * band)
  console.log(
    `  ${String(i * band).padStart(5)}-${String(i * band + h).padStart(5)}px: ${((n / (width * h)) * 100).toFixed(1)}%`,
  )
})
