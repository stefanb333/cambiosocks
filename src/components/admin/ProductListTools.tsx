'use client'

import { Button, toast, useSelection } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { groupByHandle, missingHeaders, type ProductGroup } from '@/lib/catalog/shopify-csv-shared'
import { parseCsv } from '@/lib/csv'

type GroupResult = {
  handle: string
  line: number
  action: 'created' | 'updated' | 'skipped'
  variantsCreated: number
  variantsUpdated: number
  images: number
  errors: string[]
  warnings: string[]
}

type Pending = { name: string; groups: ProductGroup[]; parseErrors: string[]; check: GroupResult[] }

const BATCH = 10
const BATCH_WITH_IMAGES = 3

const STATUS_LABEL = { active: 'Aktiviraj', draft: 'Vrati u nacrt', archived: 'Arhiviraj' } as const

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `Greška ${res.status}`)
  return data as T
}

async function runImport(
  groups: ProductGroup[],
  dryRun: boolean,
  importImages: boolean,
  onProgress: (done: number) => void,
) {
  const size = importImages && !dryRun ? BATCH_WITH_IMAGES : BATCH
  const all: GroupResult[] = []
  for (let i = 0; i < groups.length; i += size) {
    const { results } = await postJson<{ results: GroupResult[] }>('/api/products/import-csv', {
      groups: groups.slice(i, i + size),
      dryRun,
      importImages,
    })
    all.push(...results)
    onProgress(Math.min(i + size, groups.length))
  }
  return all
}

function summary(results: GroupResult[]) {
  const sum = (k: 'variantsCreated' | 'variantsUpdated' | 'images') =>
    results.reduce((n, r) => n + r[k], 0)
  return {
    created: results.filter((r) => r.action === 'created').length,
    updated: results.filter((r) => r.action === 'updated').length,
    skipped: results.filter((r) => r.action === 'skipped').length,
    variantsCreated: sum('variantsCreated'),
    variantsUpdated: sum('variantsUpdated'),
    images: sum('images'),
    errors: results.flatMap((r) => r.errors),
    warnings: results.flatMap((r) => r.warnings),
  }
}

/** Iznad liste proizvoda: masovna promena statusa izabranih i CSV uvoz/izvoz (Shopify format). */
export function ProductListTools() {
  const router = useRouter()
  const { count, getSelectedIds, toggleAll } = useSelection()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [importImages, setImportImages] = useState(true)
  const [pending, setPending] = useState<Pending | null>(null)
  const [report, setReport] = useState<ReturnType<typeof summary> | null>(null)

  const setStatus = async (status: keyof typeof STATUS_LABEL) => {
    const ids = getSelectedIds()
    if (!ids.length) return
    setBusy(status)
    try {
      const { updated } = await postJson<{ updated: number }>('/api/products/bulk-status', {
        ids,
        status,
      })
      toast.success(`Ažurirano proizvoda: ${updated}.`)
      toggleAll(false)
      router.refresh()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const onFile = async (file: File) => {
    setReport(null)
    setBusy('check')
    try {
      const rows = parseCsv(await file.text())
      const missing = missingHeaders(rows)
      if (!rows.length || missing.length) {
        throw new Error(
          rows.length
            ? `Fajl nema kolone: ${missing.join(', ')}. Očekuje se Shopify CSV format.`
            : 'Fajl je prazan.',
        )
      }
      const { groups, errors } = groupByHandle(rows)
      const check = await runImport(groups, true, importImages, (done) =>
        setBusy(`check:${done}/${groups.length}`),
      )
      setPending({ name: file.name, groups, parseErrors: errors, check })
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setBusy(null)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const confirmImport = async () => {
    if (!pending) return
    const valid = pending.groups.filter(
      (g) => !pending.check.find((r) => r.handle === g.handle)?.errors.length,
    )
    setBusy('import')
    try {
      const results = await runImport(valid, false, importImages, (done) =>
        setBusy(`import:${done}/${valid.length}`),
      )
      setReport(summary(results))
      setPending(null)
      toast.success('Uvoz je završen.')
      router.refresh()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const check = pending ? summary(pending.check) : null
  const progress = busy?.includes(':') ? busy.split(':')[1] : ''

  return (
    <div className="cambio-tools">
      <div className="cambio-tools__row">
        {count > 0 ? (
          <div
            className="cambio-tools__group"
            role="group"
            aria-label="Akcije za izabrane proizvode"
          >
            <span className="cambio-tools__count">Izabrano: {count}</span>
            {(Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]).map((s) => (
              <Button
                key={s}
                buttonStyle="secondary"
                size="small"
                margin={false}
                disabled={Boolean(busy)}
                onClick={() => setStatus(s)}
              >
                {busy === s ? 'Čuvam…' : STATUS_LABEL[s]}
              </Button>
            ))}
          </div>
        ) : null}
        <div className="cambio-tools__group cambio-tools__group--end">
          <Button
            buttonStyle="secondary"
            size="small"
            margin={false}
            el="anchor"
            url="/api/products/export-csv"
          >
            Izvezi CSV
          </Button>
          <Button
            buttonStyle="secondary"
            size="small"
            margin={false}
            disabled={Boolean(busy)}
            onClick={() => fileRef.current?.click()}
          >
            {busy?.startsWith('check') ? `Proveravam ${progress}` : 'Uvezi CSV'}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
          <label className="cambio-tools__check">
            <input
              type="checkbox"
              checked={importImages}
              onChange={(e) => setImportImages(e.target.checked)}
            />
            Uvezi i slike
          </label>
        </div>
      </div>

      {pending && check ? (
        <div className="cambio-tools__panel" role="region" aria-label="Provera CSV fajla">
          <strong>Provera fajla {pending.name}</strong>
          <p>
            Novih proizvoda: {check.created}, za ažuriranje: {check.updated}, sa greškom:{' '}
            {check.skipped}. Varijante: {check.variantsCreated} novih, {check.variantsUpdated} za
            ažuriranje.{importImages ? ` Slika za uvoz: ${check.images}.` : ''}
          </p>
          {[...pending.parseErrors, ...check.errors].length ? (
            <ul className="cambio-tools__errors">
              {[...pending.parseErrors, ...check.errors].slice(0, 30).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          ) : null}
          {check.warnings.length ? (
            <ul className="cambio-tools__warnings">
              {check.warnings.slice(0, 15).map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          ) : null}
          <p className="cambio-tools__hint">
            Proizvodi sa greškom se preskaču. Postojeće vrednosti se ne brišu kada je polje u fajlu
            prazno.
          </p>
          <div className="cambio-tools__group">
            <Button
              size="small"
              margin={false}
              disabled={Boolean(busy) || check.created + check.updated === 0}
              onClick={confirmImport}
            >
              {busy?.startsWith('import')
                ? `Uvozim ${progress}`
                : `Uvezi ${check.created + check.updated} proizvoda`}
            </Button>
            <Button
              buttonStyle="secondary"
              size="small"
              margin={false}
              disabled={Boolean(busy)}
              onClick={() => setPending(null)}
            >
              Odustani
            </Button>
          </div>
        </div>
      ) : null}

      {report ? (
        <div className="cambio-tools__panel" role="status">
          <strong>Uvoz završen</strong>
          <p>
            Napravljeno proizvoda: {report.created}, ažurirano: {report.updated}. Varijante:{' '}
            {report.variantsCreated} novih, {report.variantsUpdated} ažurirano. Slika:{' '}
            {report.images}.
          </p>
          {[...report.errors, ...report.warnings].length ? (
            <ul className="cambio-tools__warnings">
              {[...report.errors, ...report.warnings].slice(0, 30).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          ) : null}
          <Button
            buttonStyle="secondary"
            size="small"
            margin={false}
            onClick={() => setReport(null)}
          >
            Zatvori
          </Button>
        </div>
      ) : null}
    </div>
  )
}
