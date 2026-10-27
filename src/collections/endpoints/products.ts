import { isStaff } from '@/access'
import { exportProductsCsv, importProductGroup } from '@/lib/catalog/shopify-csv'
import type { ProductGroup } from '@/lib/catalog/shopify-csv-shared'
import { generateVariants } from '@/lib/catalog/variants'
import type { Endpoint, PayloadRequest } from 'payload'

const forbidden = () => Response.json({ message: 'Nemate dozvolu za ovu akciju.' }, { status: 403 })
const body = async (req: PayloadRequest) =>
  ((await req.json?.().catch(() => null)) ?? {}) as Record<string, unknown>

/** Najviše proizvoda po jednom pozivu uvoza (admin šalje fajl u delovima, D-046). */
export const IMPORT_BATCH_LIMIT = 10

export const productEndpoints: Endpoint[] = [
  {
    // POST /api/products/:id/generate-variants  { removeStale?: boolean }
    path: '/:id/generate-variants',
    method: 'post',
    handler: async (req) => {
      if (!isStaff({ req })) return forbidden()
      const id = req.routeParams?.id as string
      const { removeStale } = await body(req)
      try {
        const result = await generateVariants(req.payload, id, {
          removeStale: removeStale === true,
          req,
        })
        return Response.json(result)
      } catch (error) {
        req.payload.logger.error(error)
        return Response.json(
          { message: 'Varijante nisu napravljene. Proverite da li je proizvod sačuvan.' },
          { status: 400 },
        )
      }
    },
  },
  {
    // GET /api/products/export-csv
    path: '/export-csv',
    method: 'get',
    handler: async (req) => {
      if (!isStaff({ req })) return forbidden()
      const csv = await exportProductsCsv(req.payload, req)
      const date = new Date().toISOString().slice(0, 10)
      return new Response(csv, {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': `attachment; filename="cambio-proizvodi-${date}.csv"`,
          'cache-control': 'no-store',
        },
      })
    },
  },
  {
    // POST /api/products/import-csv  { groups: ProductGroup[], dryRun: boolean, importImages: boolean }
    path: '/import-csv',
    method: 'post',
    handler: async (req) => {
      if (!isStaff({ req })) return forbidden()
      const { groups, dryRun, importImages } = await body(req)
      if (!Array.isArray(groups) || groups.length > IMPORT_BATCH_LIMIT) {
        return Response.json({ message: 'Neispravan zahtev za uvoz.' }, { status: 400 })
      }
      const results = []
      for (const group of groups as ProductGroup[]) {
        if (!group || typeof group.handle !== 'string' || !Array.isArray(group.rows)) continue
        try {
          results.push(
            await importProductGroup(req.payload, req, group, {
              dryRun: dryRun !== false,
              importImages: importImages === true,
            }),
          )
        } catch (error) {
          req.payload.logger.error(error)
          results.push({
            handle: group.handle,
            line: group.line,
            action: 'skipped',
            variantsCreated: 0,
            variantsUpdated: 0,
            images: 0,
            errors: [`Red ${group.line}: ${(error as Error).message}`],
            warnings: [],
          })
        }
      }
      return Response.json({ results })
    },
  },
  {
    // POST /api/products/bulk-status  { ids: number[], status: 'active' | 'draft' | 'archived' }
    path: '/bulk-status',
    method: 'post',
    handler: async (req) => {
      if (!isStaff({ req })) return forbidden()
      const { ids, status } = await body(req)
      if (
        !Array.isArray(ids) ||
        !ids.length ||
        !['active', 'draft', 'archived'].includes(status as string)
      ) {
        return Response.json({ message: 'Neispravan zahtev.' }, { status: 400 })
      }
      const result = await req.payload.update({
        collection: 'products',
        where: { id: { in: ids.map(Number).filter(Number.isFinite) } },
        data: { status: status as 'active' | 'draft' | 'archived' },
        req,
        depth: 0,
      })
      return Response.json({ updated: result.docs.length, errors: result.errors.length })
    },
  },
]
