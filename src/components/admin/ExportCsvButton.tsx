'use client'

import { Button } from '@payloadcms/ui'

/** Dugme "Izvezi CSV" iznad liste (porudžbine, kupci), uz dodatne izvoze (npr. za kurira). */
export function ExportCsvButton({
  collection,
  label = 'Izvezi CSV',
  extra = [],
}: {
  collection: string
  label?: string
  extra?: { label: string; url: string }[]
}) {
  return (
    <div className="cambio-tools">
      <div className="cambio-tools__row">
        <div className="cambio-tools__group cambio-tools__group--end">
          {extra.map((e) => (
            <Button
              key={e.url}
              buttonStyle="primary"
              size="small"
              margin={false}
              el="anchor"
              url={e.url}
            >
              {e.label}
            </Button>
          ))}
          <Button
            buttonStyle="secondary"
            size="small"
            margin={false}
            el="anchor"
            url={`/api/${collection}/export-csv`}
          >
            {label}
          </Button>
        </div>
      </div>
    </div>
  )
}
