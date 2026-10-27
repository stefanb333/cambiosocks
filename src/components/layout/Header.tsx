import { getHeader, getMenuCollections } from '@/lib/data'
import { HeaderClient, type NavItem } from './HeaderClient'
import { PromoBar } from './PromoBar'

/**
 * Header iz Figme: varijanta "overlay" preko hero slike na početnoj (17:611),
 * varijanta "solid" na ostalim stranicama (52:1066).
 */
export async function Header({ variant = 'solid' }: { variant?: 'overlay' | 'solid' }) {
  const [header, collections] = await Promise.all([getHeader(), getMenuCollections()])

  const items: NavItem[] = (header.navItems ?? []).map((item) => ({
    label: item.label,
    url: item.url || '/',
    children: item.showCollections
      ? collections.map((c) => ({ label: c.title, url: `/kolekcije/${c.slug}` }))
      : (item.children ?? []).map((c) => ({ label: c.label, url: c.url })),
  }))

  return (
    <>
      <PromoBar />
      <HeaderClient
        variant={variant}
        items={items}
        searchPlaceholder={header.searchPlaceholder || 'Pretraži Proizvod'}
      />
    </>
  )
}
