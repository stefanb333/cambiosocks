'use client'

import { useEffect } from 'react'

/**
 * Slike u nizovima sa prevlačenjem (.snap-row: proizvodi, recenzije, blog) su "lazy", pa ih
 * pregledač učitava tek kada se kartica prevuče u ekran: na telefonu se na trenutak vidi prazno
 * polje, kao da slika ne postoji. Kada niz priđe ekranu (400px pre), sve njegove slike se
 * učitavaju odmah. Radi i uz "smanji pokrete" (nije animacija).
 */
export function RowImageLoader() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target
            .querySelectorAll<HTMLImageElement>('img[loading="lazy"]')
            .forEach((img) => (img.loading = 'eager'))
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '400px 0px' },
    )
    const seen = new WeakSet<Element>()
    const scan = () =>
      document.querySelectorAll('.snap-row').forEach((row) => {
        if (seen.has(row)) return
        seen.add(row)
        io.observe(row)
      })
    scan()

    // Novi nizovi posle klijentske navigacije
    let queued = false
    const mo = new MutationObserver(() => {
      if (queued) return
      queued = true
      requestAnimationFrame(() => {
        queued = false
        scan()
      })
    })
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      mo.disconnect()
      io.disconnect()
    }
  }, [])

  return null
}
