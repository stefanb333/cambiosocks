import type { PayloadRequest } from 'payload'

type Target = { paths?: string[]; tags?: string[] }

/**
 * On-demand revalidacija storefront-a posle izmene u adminu.
 * Van Next.js okruženja (seed, CLI) next/cache nije dostupan, pa se tiho preskače.
 */
export async function revalidate(req: PayloadRequest, { paths = [], tags = [] }: Target) {
  if (req.context?.disableRevalidate) return
  try {
    const { revalidatePath, revalidateTag } = await import('next/cache')
    for (const tag of tags) revalidateTag(tag, 'max')
    for (const path of paths) revalidatePath(path)
  } catch (error) {
    req.payload.logger.debug({ msg: 'Revalidacija preskočena', error })
  }
}
