type LexicalNode = { text?: string; children?: LexicalNode[]; type?: string }

/** Izvlači čist tekst iz Lexical JSON-a (za pretragu, meta opis, JSON-LD). */
export function lexicalToPlainText(value: unknown): string {
  const root = (value as { root?: LexicalNode } | null)?.root
  if (!root) return ''
  const parts: string[] = []
  const walk = (node: LexicalNode) => {
    if (typeof node.text === 'string') parts.push(node.text)
    node.children?.forEach(walk)
    if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'listitem')
      parts.push(' ')
  }
  walk(root)
  return parts.join('').replace(/\s+/g, ' ').trim()
}

/** Pravi minimalan Lexical dokument od običnih pasusa (seed, CSV uvoz). */
export function plainTextToLexical(text: string) {
  const paragraphs = text
    .split(/\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean)
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: paragraphs.map((p) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        textStyle: '',
        children: [
          {
            type: 'text',
            text: p,
            format: 0,
            style: '',
            mode: 'normal' as const,
            detail: 0,
            version: 1,
          },
        ],
      })),
    },
  }
}

type TextNode = {
  type: 'text'
  text: string
  format: number
  style: string
  mode: 'normal'
  detail: number
  version: number
}

const textNode = (text: string, format = 0): TextNode => ({
  type: 'text',
  text,
  format,
  style: '',
  mode: 'normal',
  detail: 0,
  version: 1,
})

type LinkNode = {
  type: 'link'
  version: number
  direction: 'ltr'
  format: ''
  indent: number
  fields: { linkType: 'custom'; url: string; newTab: boolean }
  children: TextNode[]
}

/**
 * Jedan red teksta: "**podebljano**" postaje tekst sa format 1 (bold), a "[tekst](/putanja)"
 * link (interni linkovi u člancima i opisima kolekcija, D-063).
 */
function inline(line: string): (TextNode | LinkNode)[] {
  return line
    .split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/)
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith('**') && part.endsWith('**')) return textNode(part.slice(2, -2), 1)
      const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
      if (link) {
        return {
          type: 'link',
          version: 3,
          direction: 'ltr',
          format: '',
          indent: 0,
          fields: { linkType: 'custom', url: link[2], newTab: false },
          children: [textNode(link[1])],
        }
      }
      return textNode(part)
    })
}

/**
 * Jednostavan tekst u Lexical (seed, pravne stranice, članci): "## " je h2, "### " h3, uzastopni
 * redovi sa "- " su lista, ostali redovi pasusi; "**tekst**" je podebljan, "[tekst](/putanja)" link.
 */
export function markdownToLexical(text: string) {
  const doc = plainTextToLexical('')
  const base = { format: '' as const, indent: 0, version: 1, direction: 'ltr' as const }
  const children: unknown[] = []
  let list: { items: ReturnType<typeof inline>[] } | null = null
  const flush = () => {
    if (!list) return
    children.push({
      ...base,
      type: 'list',
      listType: 'bullet',
      tag: 'ul',
      start: 1,
      children: list.items.map((item, i) => ({
        ...base,
        type: 'listitem',
        value: i + 1,
        children: item,
      })),
    })
    list = null
  }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('- ')) {
      list ??= { items: [] }
      list.items.push(inline(line.slice(2)))
      continue
    }
    flush()
    if (line.startsWith('### '))
      children.push({ ...base, type: 'heading', tag: 'h3', children: inline(line.slice(4)) })
    else if (line.startsWith('## '))
      children.push({ ...base, type: 'heading', tag: 'h2', children: inline(line.slice(3)) })
    else
      children.push({
        ...base,
        type: 'paragraph',
        textFormat: 0,
        textStyle: '',
        children: inline(line),
      })
  }
  flush()
  doc.root.children = children as typeof doc.root.children
  return doc
}
