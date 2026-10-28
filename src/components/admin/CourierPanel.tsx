'use client'

import { Button, useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

type Data = { text: string; shipment: { cod: number; reference: string } }

/**
 * Blok "Podaci za kurira (AKS)" na porudžbini (D-079): podaci za pošiljku se slažu sami iz
 * porudžbine; dugme kopira sve u formu kurirske službe, drugo otvara adresnicu za štampu.
 * Prikazuje sačuvano stanje porudžbine (posle izmene adrese: sačuvati pa osvežiti).
 */
export function CourierPanel() {
  const { id } = useDocumentInfo()
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    let active = true
    fetch(`/api/orders/${id}/courier`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: Data) => active && setData(d))
      .catch(() => active && setError('Podaci za kurira trenutno nisu dostupni.'))
    return () => {
      active = false
    }
  }, [id])

  if (!id) return null

  const copy = async () => {
    if (!data) return
    await navigator.clipboard.writeText(data.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="cambio-card cambio-courier">
      <div className="cambio-courier__head">
        <h3>Podaci za kurira (AKS)</h3>
        {data ? (
          <span className={`cambio-courier__cod ${data.shipment.cod ? '' : 'is-paid'}`}>
            {data.shipment.cod ? `Otkupnina ${data.shipment.cod} RSD` : 'Bez otkupnine'}
          </span>
        ) : null}
      </div>
      {error ? (
        <p>{error}</p>
      ) : (
        <pre className="cambio-courier__text">{data?.text ?? 'Učitavam…'}</pre>
      )}
      <div className="cambio-courier__actions">
        <Button buttonStyle="primary" size="small" margin={false} onClick={copy} disabled={!data}>
          {copied ? 'Kopirano' : 'Kopiraj podatke'}
        </Button>
        <Button
          buttonStyle="secondary"
          size="small"
          margin={false}
          el="anchor"
          url={`/api/orders/${id}/label`}
          newTab
        >
          Odštampaj adresnicu
        </Button>
      </div>
    </div>
  )
}
