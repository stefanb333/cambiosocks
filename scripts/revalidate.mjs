// Revalidira ceo keš storefront-a: node scripts/revalidate.mjs (koristi .env)
import 'dotenv/config'
const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const res = await fetch(`${base}/api/revalidate`, {
  method: 'POST',
  headers: {
    authorization: `Bearer ${process.env.REVALIDATE_SECRET}`,
    'content-type': 'application/json',
  },
  body: '{}',
})
console.log(res.status, await res.text())
