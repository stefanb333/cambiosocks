import Link from 'next/link'
import { CmsImage } from '@/components/ui/CmsImage'
import { coverSizes } from '@/lib/media'
import type { Post } from '@/payload-types'

/** Figma "Article card" (86:1001): bela kartica 420px, slika 240px, teme, naslov, opis, vreme čitanja. */
export function ArticleCard({ post }: { post: Post }) {
  return (
    <article className="flex h-full w-[min(84vw,420px)] flex-col gap-4 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <Link
        href={`/blog/${post.slug}`}
        className="relative block h-[200px] shrink-0 overflow-hidden rounded-t-2xl lg:h-60"
        tabIndex={-1}
        aria-hidden
      >
        <CmsImage
          media={post.coverImage}
          alt=""
          fill
          sizes={coverSizes(
            post.coverImage,
            [
              { media: '(min-width: 1024px)', width: '420px', height: '240px' },
              { width: '86vw', height: '200px' },
            ],
            1.05,
          )}
          className="object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-6">
        {post.tags?.length ? (
          <ul className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((t) => (
              <li
                key={t}
                className="rounded-[99px] bg-neutral-100 px-3.5 py-2 text-[12px] leading-4 text-black"
              >
                {t}
              </li>
            ))}
          </ul>
        ) : null}
        <h3 className="text-[16px] leading-6 font-semibold text-black">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary">
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? (
          <p className="text-[14px] leading-5 text-neutral-700">{post.excerpt}</p>
        ) : null}
        <p className="mt-auto text-[12px] leading-4 text-neutral-700">
          {post.readTime ?? 1} min čitanja
        </p>
      </div>
    </article>
  )
}
