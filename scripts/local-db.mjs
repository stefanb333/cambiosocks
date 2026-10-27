// Lokalni Postgres za razvoj (bez Docker-a). Produkcija koristi Neon.
// Pokretanje: npm run db:local  (drži proces otvorenim, Ctrl+C gasi bazu)
import fs from 'node:fs'
import path from 'node:path'
import EmbeddedPostgres from 'embedded-postgres'

const dataDir = path.resolve('.data/postgres')
const port = Number(process.env.LOCAL_DB_PORT || 54329)
const database = 'cambio'

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'postgres',
  password: 'postgres',
  port,
  persistent: true,
  // Windows podrazumevano pravi bazu u WIN1252, a nama treba UTF-8 (č, ć, š, ž, đ).
  initdbFlags: ['--encoding=UTF8', '--locale=C'],
})

const isNew = !fs.existsSync(path.join(dataDir, 'PG_VERSION'))
if (isNew) await pg.initialise()
await pg.start()
if (isNew) await pg.createDatabase(database)

console.log(`Postgres radi: postgres://postgres:postgres@127.0.0.1:${port}/${database}`)

const stop = async () => {
  await pg.stop()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
