'use client'

import { Button } from '@payloadcms/ui'

/** Dugme "Izvezi CSV" iznad liste (porudžbine, kupci). */
export function ExportCsvButton({
  collection,
  label = 'Izvezi CSV',
}: {
  collection: string
  label?: string
}) {
  return (
    <div className="cambio-tools">
      <div className="cambio-tools__row">
        <div className="cambio-tools__group cambio-tools__group--end">
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
