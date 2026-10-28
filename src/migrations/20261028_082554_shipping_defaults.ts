import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shop_settings" ALTER COLUMN "shipping_price" SET DEFAULT 300;
  ALTER TABLE "shop_settings" ALTER COLUMN "delivery_estimate" SET DEFAULT '1 do 3 radna dana';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shop_settings" ALTER COLUMN "shipping_price" SET DEFAULT 499;
  ALTER TABLE "shop_settings" ALTER COLUMN "delivery_estimate" SET DEFAULT '2 do 4 radna dana';`)
}
