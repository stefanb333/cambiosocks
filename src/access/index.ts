import type { Access, FieldAccess, PayloadRequest } from 'payload'

export type Role = 'admin' | 'editor'

const roleOf = (req: PayloadRequest): Role | undefined => (req.user as { role?: Role } | null)?.role

export const isAdmin = ({ req }: { req: PayloadRequest }): boolean => roleOf(req) === 'admin'

export const isStaff = ({ req }: { req: PayloadRequest }): boolean => {
  const role = roleOf(req)
  return role === 'admin' || role === 'editor'
}

export const anyone: Access = () => true
export const adminOnly: Access = ({ req }) => isAdmin({ req })
export const staffOnly: Access = ({ req }) => isStaff({ req })
export const adminFieldOnly: FieldAccess = ({ req }) => isAdmin({ req })

/** Javno se vide samo aktivni proizvodi, osoblje vidi sve. */
export const activeOrStaff: Access = ({ req }) => {
  if (isStaff({ req })) return true
  return { status: { equals: 'active' } }
}

/** Varijante: javno samo varijante aktivnih proizvoda (nacrti i arhiva se ne vide preko API-ja). */
export const variantOfActiveOrStaff: Access = ({ req }) => {
  if (isStaff({ req })) return true
  return { 'product.status': { equals: 'active' } }
}

/** Za kolekcije sa Payload draft-ovima: javno samo objavljeno. */
export const publishedOrStaff: Access = ({ req }) => {
  if (isStaff({ req })) return true
  return { _status: { equals: 'published' } }
}
