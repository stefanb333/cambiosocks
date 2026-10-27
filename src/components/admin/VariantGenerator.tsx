'use client'

import { Button, toast, useDocumentInfo, useFormModified, useWatchForm } from '@payloadcms/ui'
import { useState } from 'react'
import { optionCombinations } from '@/lib/catalog/variants-shared'

/** 1 kombinacija, 2 do 4 kombinacije, 5 i više kombinacija (21 kombinacija, 22 kombinacije...). */
const kombinacija = (n: number) => {
  const d = n % 10
  const dd = n % 100
  return d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? 'kombinacije' : 'kombinacija'
}

type OptionValue = { name?: string; values?: { value?: string }[] }

/**
 * Dugme "Generiši varijante" u tabu Opcije i varijante. Pravi varijante koje nedostaju
 * za sve kombinacije opcija (postojeće cene, zalihe i SKU-ovi ostaju netaknuti).
 */
export function VariantGenerator() {
  const { id } = useDocumentInfo()
  const modified = useFormModified()
  const { getDataByPath } = useWatchForm()
  const [removeStale, setRemoveStale] = useState(false)
  const [busy, setBusy] = useState(false)

  const options = (getDataByPath('options') as OptionValue[] | undefined) ?? []
  const combos = optionCombinations(options)
  const preview = combos.slice(0, 6).map((c) => c.join(' / '))

  const run = async () => {
    if (!id) return
    if (
      removeStale &&
      !window.confirm(
        'Varijante koje više ne postoje u opcijama biće obrisane, zajedno sa njihovom zalihom. Nastaviti?',
      )
    )
      return
    setBusy(true)
    try {
      const res = await fetch(`/api/products/${id}/generate-variants`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ removeStale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      const parts = [`Novih varijanti: ${data.created}`]
      if (data.removed) parts.push(`obrisano: ${data.removed}`)
      toast.success(`${parts.join(', ')}. Ukupno: ${data.total}.`)
      // Lista varijanti (join polje) se učitava na serveru, pa se stranica osvežava.
      if (data.created || data.removed) setTimeout(() => window.location.reload(), 900)
    } catch (error) {
      toast.error((error as Error).message || 'Varijante nisu napravljene.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="cambio-generator">
      <div className="cambio-generator__head">
        <strong>Generator varijanti</strong>
        <span>
          {combos.length
            ? `${combos.length} ${kombinacija(combos.length)} iz opcija`
            : 'Dodajte opcije i vrednosti (npr. Veličina: 36-40, 41-46).'}
        </span>
      </div>
      {preview.length ? (
        <p className="cambio-generator__preview">
          {preview.join(', ')}
          {combos.length > preview.length ? ` i još ${combos.length - preview.length}` : ''}
        </p>
      ) : null}
      {!id ? (
        <p className="cambio-generator__note">Prvo sačuvajte proizvod, pa generišite varijante.</p>
      ) : modified ? (
        <p className="cambio-generator__note">
          Imate nesačuvane izmene. Sačuvajte proizvod pre generisanja.
        </p>
      ) : null}
      <label className="cambio-generator__check">
        <input
          type="checkbox"
          checked={removeStale}
          onChange={(e) => setRemoveStale(e.target.checked)}
        />
        Obriši varijante koje više ne postoje u opcijama
      </label>
      <Button
        buttonStyle="secondary"
        size="medium"
        disabled={!id || modified || busy || !combos.length}
        onClick={run}
        margin={false}
      >
        {busy ? 'Generišem…' : 'Generiši varijante'}
      </Button>
    </div>
  )
}
