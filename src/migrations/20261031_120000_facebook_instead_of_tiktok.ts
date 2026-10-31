import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Podešavanja prodavnice: Facebook URL umesto TikTok URL-a (D-080). Kolona se preimenuje, ne briše.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shop_settings" RENAME COLUMN "tiktok" TO "facebook";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shop_settings" RENAME COLUMN "facebook" TO "tiktok";`)
}
