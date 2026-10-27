import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_reviews_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"city" varchar,
  	"rating" numeric DEFAULT 5 NOT NULL,
  	"text" varchar NOT NULL,
  	"email" varchar,
  	"status" "enum_reviews_status" DEFAULT 'pending' NOT NULL,
  	"featured" boolean DEFAULT false,
  	"verified" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "home_page_reviews_items" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "home_page_reviews_items" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reviews_id" integer;
  ALTER TABLE "home_page" ADD COLUMN "reviews_form_button_label" varchar DEFAULT 'Ostavi Recenziju';
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "reviews_product_idx" ON "reviews" USING btree ("product_id");
  CREATE INDEX "reviews_status_idx" ON "reviews" USING btree ("status");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  ALTER TABLE "home_page" DROP COLUMN "reviews_bottom_cta_label";
  ALTER TABLE "home_page" DROP COLUMN "reviews_bottom_cta_url";
  ALTER TABLE "home_page" DROP COLUMN "reviews_bottom_cta_new_tab";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "home_page_reviews_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rating" numeric DEFAULT 5,
  	"text" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"meta" varchar
  );
  
  ALTER TABLE "reviews" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "reviews" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_reviews_fk";
  
  DROP INDEX "payload_locked_documents_rels_reviews_id_idx";
  ALTER TABLE "home_page" ADD COLUMN "reviews_bottom_cta_label" varchar NOT NULL;
  ALTER TABLE "home_page" ADD COLUMN "reviews_bottom_cta_url" varchar NOT NULL;
  ALTER TABLE "home_page" ADD COLUMN "reviews_bottom_cta_new_tab" boolean DEFAULT false;
  ALTER TABLE "home_page_reviews_items" ADD CONSTRAINT "home_page_reviews_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_page_reviews_items_order_idx" ON "home_page_reviews_items" USING btree ("_order");
  CREATE INDEX "home_page_reviews_items_parent_id_idx" ON "home_page_reviews_items" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reviews_id";
  ALTER TABLE "home_page" DROP COLUMN "reviews_form_button_label";
  DROP TYPE "public"."enum_reviews_status";`)
}
