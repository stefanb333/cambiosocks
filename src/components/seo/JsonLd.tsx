/**
 * JSON-LD blok za strukturisane podatke. "<" se escapuje, pa tekst iz CMS-a (npr. naziv sa
 * "</script>") ne može da zatvori skriptu i ubaci kod u stranicu.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
