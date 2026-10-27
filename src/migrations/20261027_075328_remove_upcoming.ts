import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_page_upcoming_items" CASCADE;
  ALTER TABLE "home_page" DROP COLUMN "upcoming_heading";
  ALTER TABLE "home_page" DROP COLUMN "upcoming_subheading";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "home_page_upcoming_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"image_id" integer
  );
  
  ALTER TABLE "home_page" ADD COLUMN "upcoming_heading" varchar;
  ALTER TABLE "home_page" ADD COLUMN "upcoming_subheading" varchar;
  ALTER TABLE "home_page_upcoming_items" ADD CONSTRAINT "home_page_upcoming_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_upcoming_items" ADD CONSTRAINT "home_page_upcoming_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_page_upcoming_items_order_idx" ON "home_page_upcoming_items" USING btree ("_order");
  CREATE INDEX "home_page_upcoming_items_parent_id_idx" ON "home_page_upcoming_items" USING btree ("_parent_id");
  CREATE INDEX "home_page_upcoming_items_image_idx" ON "home_page_upcoming_items" USING btree ("image_id");`)
}
