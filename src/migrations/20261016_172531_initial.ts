import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_options_kind" AS ENUM('size', 'color', 'other');
  CREATE TYPE "public"."enum_products_category" AS ENUM('odrasli', 'paketi', 'extra-tanke', 'deca');
  CREATE TYPE "public"."enum_products_pattern" AS ENUM('zivotinje', 'graficki', 'hrana-i-pica', 'tacke-i-pruge', 'jednobojni', 'priroda', 'sport-i-vozila');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'active', 'archived');
  CREATE TYPE "public"."enum_products_product_type" AS ENUM('muske', 'zenske', 'sport', 'decije', 'donji-ves');
  CREATE TYPE "public"."enum__products_v_version_options_kind" AS ENUM('size', 'color', 'other');
  CREATE TYPE "public"."enum__products_v_version_category" AS ENUM('odrasli', 'paketi', 'extra-tanke', 'deca');
  CREATE TYPE "public"."enum__products_v_version_pattern" AS ENUM('zivotinje', 'graficki', 'hrana-i-pica', 'tacke-i-pruge', 'jednobojni', 'priroda', 'sport-i-vozila');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'active', 'archived');
  CREATE TYPE "public"."enum__products_v_version_product_type" AS ENUM('muske', 'zenske', 'sport', 'decije', 'donji-ves');
  CREATE TYPE "public"."enum_shop_collections_rules_field" AS ENUM('tags', 'productType', 'brand', 'category', 'pattern');
  CREATE TYPE "public"."enum_shop_collections_type" AS ENUM('manual', 'automatic');
  CREATE TYPE "public"."enum_shop_collections_match" AS ENUM('all', 'any');
  CREATE TYPE "public"."enum_shop_collections_default_sort" AS ENUM('featured', 'newest', 'price-asc', 'price-desc', 'title-asc');
  CREATE TYPE "public"."enum_orders_status_history_from" AS ENUM('nova', 'potvrdjena', 'poslata', 'isporucena', 'otkazana');
  CREATE TYPE "public"."enum_orders_status_history_to" AS ENUM('nova', 'potvrdjena', 'poslata', 'isporucena', 'otkazana');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('nova', 'potvrdjena', 'poslata', 'isporucena', 'otkazana');
  CREATE TYPE "public"."enum_orders_payment_method" AS ENUM('cod');
  CREATE TYPE "public"."enum_orders_payment_status" AS ENUM('pending', 'paid', 'refunded');
  CREATE TYPE "public"."enum_discounts_type" AS ENUM('percentage', 'fixed', 'free_shipping');
  CREATE TYPE "public"."enum_discounts_applies_to" AS ENUM('all', 'collections', 'products');
  CREATE TYPE "public"."enum_subscribers_source" AS ENUM('newsletter', 'notify', 'checkout');
  CREATE TYPE "public"."enum_pages_blocks_story_theme" AS ENUM('light', 'blue');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_story_theme" AS ENUM('light', 'blue');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_promo_bar_theme" AS ENUM('blue', 'yellow', 'black');
  CREATE TYPE "public"."enum_home_page_categories_cards_theme" AS ENUM('light', 'blue');
  CREATE TYPE "public"."enum_home_page_categories_cards_tag_theme" AS ENUM('blue', 'yellow', 'dark-blue');
  CREATE TABLE "products_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "products_options_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"swatch" varchar
  );
  
  CREATE TABLE "products_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"kind" "enum_products_options_kind" DEFAULT 'other' NOT NULL
  );
  
  CREATE TABLE "products_category" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_products_category",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_pattern" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_products_pattern",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"short_description" varchar,
  	"description" jsonb,
  	"material" varchar,
  	"care" varchar,
  	"default_price" numeric,
  	"default_compare_at_price" numeric,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"status" "enum_products_status" DEFAULT 'draft' NOT NULL,
  	"slug" varchar,
  	"product_type" "enum_products_product_type",
  	"brand" varchar DEFAULT 'Cambio',
  	"rating" numeric,
  	"rating_count" numeric,
  	"min_price" numeric,
  	"max_price" numeric,
  	"compare_at_price" numeric,
  	"total_stock" numeric,
  	"available" boolean,
  	"variant_count" numeric,
  	"search_text" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"shop_collections_id" integer
  );
  
  CREATE TABLE "_products_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_options_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"swatch" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"kind" "enum__products_v_version_options_kind" DEFAULT 'other' NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_category" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__products_v_version_category",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_products_v_version_pattern" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__products_v_version_pattern",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_short_description" varchar,
  	"version_description" jsonb,
  	"version_material" varchar,
  	"version_care" varchar,
  	"version_default_price" numeric,
  	"version_default_compare_at_price" numeric,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_status" "enum__products_v_version_status" DEFAULT 'draft' NOT NULL,
  	"version_slug" varchar,
  	"version_product_type" "enum__products_v_version_product_type",
  	"version_brand" varchar DEFAULT 'Cambio',
  	"version_rating" numeric,
  	"version_rating_count" numeric,
  	"version_min_price" numeric,
  	"version_max_price" numeric,
  	"version_compare_at_price" numeric,
  	"version_total_stock" numeric,
  	"version_available" boolean,
  	"version_variant_count" numeric,
  	"version_search_text" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_products_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"shop_collections_id" integer
  );
  
  CREATE TABLE "variants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"option1" varchar,
  	"option2" varchar,
  	"option3" varchar,
  	"price" numeric NOT NULL,
  	"compare_at_price" numeric,
  	"sku" varchar,
  	"stock" numeric DEFAULT 0,
  	"track_inventory" boolean DEFAULT true,
  	"allow_backorder" boolean DEFAULT false,
  	"image_id" integer,
  	"barcode" varchar,
  	"weight" numeric,
  	"position" numeric DEFAULT 0,
  	"title" varchar,
  	"label" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "shop_collections_rules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" "enum_shop_collections_rules_field",
  	"value" varchar
  );
  
  CREATE TABLE "shop_collections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"image_id" integer,
  	"hero_heading" varchar,
  	"hero_text" varchar,
  	"list_heading" varchar DEFAULT 'Najnovije u kolekciji',
  	"type" "enum_shop_collections_type" DEFAULT 'manual' NOT NULL,
  	"match" "enum_shop_collections_match" DEFAULT 'all',
  	"default_sort" "enum_shop_collections_default_sort" DEFAULT 'featured',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"slug" varchar,
  	"show_in_menu" boolean DEFAULT true,
  	"menu_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "shop_collections_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"shop_collections_id" integer
  );
  
  CREATE TABLE "orders_line_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"variant_id" integer,
  	"title" varchar NOT NULL,
  	"variant_title" varchar,
  	"sku" varchar,
  	"unit_price" numeric NOT NULL,
  	"compare_at_price" numeric,
  	"quantity" numeric NOT NULL,
  	"line_total" numeric,
  	"image_id" integer
  );
  
  CREATE TABLE "orders_status_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from" "enum_orders_status_history_from",
  	"to" "enum_orders_status_history_to",
  	"at" timestamp(3) with time zone,
  	"by" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"subtotal" numeric,
  	"discount_total" numeric DEFAULT 0,
  	"shipping_total" numeric DEFAULT 0,
  	"total" numeric,
  	"discount_code" varchar,
  	"customer_note" varchar,
  	"internal_note" varchar,
  	"customer_id" integer,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"shipping_address_name" varchar,
  	"shipping_address_address1" varchar,
  	"shipping_address_address2" varchar,
  	"shipping_address_postal_code" varchar,
  	"shipping_address_city" varchar,
  	"shipping_address_country" varchar DEFAULT 'Srbija',
  	"shipping_address_phone" varchar,
  	"billing_same_as_shipping" boolean DEFAULT true,
  	"billing_address_name" varchar,
  	"billing_address_address1" varchar,
  	"billing_address_address2" varchar,
  	"billing_address_postal_code" varchar,
  	"billing_address_city" varchar,
  	"billing_address_country" varchar DEFAULT 'Srbija',
  	"billing_address_phone" varchar,
  	"tracking_number" varchar,
  	"tracking_url" varchar,
  	"name" varchar,
  	"order_number" numeric,
  	"status" "enum_orders_status" DEFAULT 'nova' NOT NULL,
  	"payment_method" "enum_orders_payment_method" DEFAULT 'cod',
  	"payment_status" "enum_orders_payment_status" DEFAULT 'pending',
  	"stock_deducted" boolean DEFAULT false,
  	"access_token" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "customers_addresses" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"address1" varchar,
  	"address2" varchar,
  	"postal_code" varchar,
  	"city" varchar,
  	"country" varchar DEFAULT 'Srbija',
  	"phone" varchar
  );
  
  CREATE TABLE "customers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar,
  	"last_name" varchar,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"accepts_marketing" boolean DEFAULT false,
  	"note" varchar,
  	"full_name" varchar,
  	"orders_count" numeric DEFAULT 0,
  	"total_spent" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "discounts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"type" "enum_discounts_type" DEFAULT 'percentage' NOT NULL,
  	"value" numeric,
  	"min_subtotal" numeric,
  	"applies_to" "enum_discounts_applies_to" DEFAULT 'all',
  	"once_per_customer" boolean DEFAULT false,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"usage_limit" numeric,
  	"usage_count" numeric DEFAULT 0,
  	"active" boolean DEFAULT true,
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "discounts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"shop_collections_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "subscribers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"source" "enum_subscribers_source" DEFAULT 'newsletter',
  	"interest" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_blocks_page_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"image_id" integer,
  	"mobile_image_id" integer,
  	"overlay" numeric DEFAULT 40,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_story_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_pages_blocks_story_theme" DEFAULT 'light',
  	"heading" varchar,
  	"lead" varchar,
  	"text" varchar,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"label" varchar,
  	"highlight" boolean,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"cta_text" varchar,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"cta_new_tab" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"support_show" boolean DEFAULT true,
  	"support_title" varchar,
  	"support_text" varchar,
  	"support_button_label" varchar,
  	"support_button_url" varchar DEFAULT '/kontakt',
  	"support_availability" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"address" varchar,
  	"availability" varchar,
  	"form_heading" varchar,
  	"form_description" varchar,
  	"topics" varchar,
  	"consent_text" varchar,
  	"response_note" varchar,
  	"success_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading_line1" varchar,
  	"heading_line2" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"cta_new_tab" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_pages_v_blocks_page_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"image_id" integer,
  	"mobile_image_id" integer,
  	"overlay" numeric DEFAULT 40,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_story_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__pages_v_blocks_story_theme" DEFAULT 'light',
  	"heading" varchar,
  	"lead" varchar,
  	"text" varchar,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"label" varchar,
  	"highlight" boolean,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"cta_text" varchar,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"cta_new_tab" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"support_show" boolean DEFAULT true,
  	"support_title" varchar,
  	"support_text" varchar,
  	"support_button_label" varchar,
  	"support_button_url" varchar DEFAULT '/kontakt',
  	"support_availability" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"address" varchar,
  	"availability" varchar,
  	"form_heading" varchar,
  	"form_description" varchar,
  	"topics" varchar,
  	"consent_text" varchar,
  	"response_note" varchar,
  	"success_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading_line1" varchar,
  	"heading_line2" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"cta_new_tab" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"excerpt" varchar,
  	"cover_image_id" integer,
  	"content" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"slug" varchar,
  	"published_at" timestamp(3) with time zone,
  	"featured" boolean DEFAULT false,
  	"read_time" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_excerpt" varchar,
  	"version_cover_image_id" integer,
  	"version_content" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_slug" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_featured" boolean DEFAULT false,
  	"version_read_time" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_posts_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"variants_id" integer,
  	"shop_collections_id" integer,
  	"orders_id" integer,
  	"customers_id" integer,
  	"discounts_id" integer,
  	"subscribers_id" integer,
  	"pages_id" integer,
  	"posts_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "header_nav_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar,
  	"show_collections" boolean DEFAULT false
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"search_placeholder" varchar DEFAULT 'Pretraži proizvode',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_groups_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar,
  	"new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "footer_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL
  );
  
  CREATE TABLE "footer_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar,
  	"new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Dobrodošli u Cambio svet',
  	"email_placeholder" varchar DEFAULT 'Vaša e-mail adresa',
  	"button_label" varchar DEFAULT 'Prijavi se',
  	"newsletter_note" varchar,
  	"copyright" varchar DEFAULT '© 2026 Cambio. Sva prava zadržana.',
  	"location" varchar DEFAULT 'Novi Pazar · Srbija',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "promo_bar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT false,
  	"text" varchar,
  	"url" varchar,
  	"theme" "enum_promo_bar_theme" DEFAULT 'blue',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_page_categories_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag1" varchar,
  	"tag2" varchar,
  	"theme" "enum_home_page_categories_cards_theme" DEFAULT 'light',
  	"tag_theme" "enum_home_page_categories_cards_tag_theme" DEFAULT 'blue',
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"image_id" integer,
  	"cta_label" varchar NOT NULL,
  	"cta_url" varchar NOT NULL,
  	"cta_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "home_page_reviews_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rating" numeric DEFAULT 5,
  	"text" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"meta" varchar
  );
  
  CREATE TABLE "home_page_upcoming_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_heading" varchar NOT NULL,
  	"hero_subheading" varchar,
  	"hero_image_id" integer,
  	"hero_mobile_image_id" integer,
  	"hero_primary_cta_label" varchar NOT NULL,
  	"hero_primary_cta_url" varchar NOT NULL,
  	"hero_primary_cta_new_tab" boolean DEFAULT false,
  	"hero_secondary_cta_label" varchar NOT NULL,
  	"hero_secondary_cta_url" varchar NOT NULL,
  	"hero_secondary_cta_new_tab" boolean DEFAULT false,
  	"categories_heading" varchar,
  	"categories_subheading" varchar,
  	"featured_heading" varchar,
  	"featured_note" varchar,
  	"featured_button_label" varchar DEFAULT 'Dodaj u Korpu',
  	"featured_colors_label" varchar DEFAULT 'Dostupne Boje',
  	"cta_banner_heading_line1" varchar,
  	"cta_banner_heading_line2" varchar,
  	"cta_banner_text" varchar,
  	"cta_banner_image_id" integer,
  	"cta_banner_pill_image_id" integer,
  	"cta_banner_collection_image_id" integer,
  	"cta_banner_cta_label" varchar NOT NULL,
  	"cta_banner_cta_url" varchar NOT NULL,
  	"cta_banner_cta_new_tab" boolean DEFAULT false,
  	"reviews_heading" varchar,
  	"reviews_subheading" varchar,
  	"reviews_top_cta_label" varchar NOT NULL,
  	"reviews_top_cta_url" varchar NOT NULL,
  	"reviews_top_cta_new_tab" boolean DEFAULT false,
  	"reviews_bottom_cta_label" varchar NOT NULL,
  	"reviews_bottom_cta_url" varchar NOT NULL,
  	"reviews_bottom_cta_new_tab" boolean DEFAULT false,
  	"upcoming_heading" varchar,
  	"upcoming_subheading" varchar,
  	"newsletter_heading" varchar,
  	"newsletter_subheading" varchar,
  	"newsletter_placeholder" varchar,
  	"newsletter_note" varchar,
  	"newsletter_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_page_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "shop_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"shipping_price" numeric DEFAULT 499 NOT NULL,
  	"free_shipping_threshold" numeric,
  	"delivery_estimate" varchar DEFAULT '2 do 4 radna dana',
  	"newsletter_discount_code" varchar DEFAULT 'DOBRODOSLI10',
  	"email" varchar,
  	"phone" varchar,
  	"address" varchar,
  	"hours" varchar,
  	"instagram" varchar,
  	"tiktok" varchar,
  	"default_care" varchar,
  	"shipping_info" varchar,
  	"low_stock_threshold" numeric DEFAULT 5,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "shop_settings_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_options_values" ADD CONSTRAINT "products_options_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_options" ADD CONSTRAINT "products_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_category" ADD CONSTRAINT "products_category_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_pattern" ADD CONSTRAINT "products_pattern_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_texts" ADD CONSTRAINT "products_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_shop_collections_fk" FOREIGN KEY ("shop_collections_id") REFERENCES "public"."shop_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_options_values" ADD CONSTRAINT "_products_v_version_options_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_options" ADD CONSTRAINT "_products_v_version_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_category" ADD CONSTRAINT "_products_v_version_category_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_pattern" ADD CONSTRAINT "_products_v_version_pattern_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_texts" ADD CONSTRAINT "_products_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_shop_collections_fk" FOREIGN KEY ("shop_collections_id") REFERENCES "public"."shop_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "variants" ADD CONSTRAINT "variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "variants" ADD CONSTRAINT "variants_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shop_collections_rules" ADD CONSTRAINT "shop_collections_rules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_collections" ADD CONSTRAINT "shop_collections_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shop_collections" ADD CONSTRAINT "shop_collections_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shop_collections_rels" ADD CONSTRAINT "shop_collections_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."shop_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_collections_rels" ADD CONSTRAINT "shop_collections_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_collections_rels" ADD CONSTRAINT "shop_collections_rels_shop_collections_fk" FOREIGN KEY ("shop_collections_id") REFERENCES "public"."shop_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_line_items" ADD CONSTRAINT "orders_line_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_line_items" ADD CONSTRAINT "orders_line_items_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_line_items" ADD CONSTRAINT "orders_line_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_line_items" ADD CONSTRAINT "orders_line_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_status_history" ADD CONSTRAINT "orders_status_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "customers_addresses" ADD CONSTRAINT "customers_addresses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "discounts_rels" ADD CONSTRAINT "discounts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."discounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "discounts_rels" ADD CONSTRAINT "discounts_rels_shop_collections_fk" FOREIGN KEY ("shop_collections_id") REFERENCES "public"."shop_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "discounts_rels" ADD CONSTRAINT "discounts_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_page_hero" ADD CONSTRAINT "pages_blocks_page_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_page_hero" ADD CONSTRAINT "pages_blocks_page_hero_mobile_image_id_media_id_fk" FOREIGN KEY ("mobile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_page_hero" ADD CONSTRAINT "pages_blocks_page_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_story_images" ADD CONSTRAINT "pages_blocks_story_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_story_images" ADD CONSTRAINT "pages_blocks_story_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_story" ADD CONSTRAINT "pages_blocks_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_items" ADD CONSTRAINT "pages_blocks_stats_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_items" ADD CONSTRAINT "pages_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats" ADD CONSTRAINT "pages_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact" ADD CONSTRAINT "pages_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_banner" ADD CONSTRAINT "pages_blocks_cta_banner_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_banner" ADD CONSTRAINT "pages_blocks_cta_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_page_hero" ADD CONSTRAINT "_pages_v_blocks_page_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_page_hero" ADD CONSTRAINT "_pages_v_blocks_page_hero_mobile_image_id_media_id_fk" FOREIGN KEY ("mobile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_page_hero" ADD CONSTRAINT "_pages_v_blocks_page_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story_images" ADD CONSTRAINT "_pages_v_blocks_story_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story_images" ADD CONSTRAINT "_pages_v_blocks_story_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story" ADD CONSTRAINT "_pages_v_blocks_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_items" ADD CONSTRAINT "_pages_v_blocks_stats_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_items" ADD CONSTRAINT "_pages_v_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats" ADD CONSTRAINT "_pages_v_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact" ADD CONSTRAINT "_pages_v_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_banner" ADD CONSTRAINT "_pages_v_blocks_cta_banner_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_banner" ADD CONSTRAINT "_pages_v_blocks_cta_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_texts" ADD CONSTRAINT "posts_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_texts" ADD CONSTRAINT "_posts_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_variants_fk" FOREIGN KEY ("variants_id") REFERENCES "public"."variants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_shop_collections_fk" FOREIGN KEY ("shop_collections_id") REFERENCES "public"."shop_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_discounts_fk" FOREIGN KEY ("discounts_id") REFERENCES "public"."discounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subscribers_fk" FOREIGN KEY ("subscribers_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items_children" ADD CONSTRAINT "header_nav_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_groups_links" ADD CONSTRAINT "footer_groups_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_groups" ADD CONSTRAINT "footer_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_links" ADD CONSTRAINT "footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_categories_cards" ADD CONSTRAINT "home_page_categories_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_categories_cards" ADD CONSTRAINT "home_page_categories_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_reviews_items" ADD CONSTRAINT "home_page_reviews_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_upcoming_items" ADD CONSTRAINT "home_page_upcoming_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_upcoming_items" ADD CONSTRAINT "home_page_upcoming_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_hero_mobile_image_id_media_id_fk" FOREIGN KEY ("hero_mobile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_cta_banner_image_id_media_id_fk" FOREIGN KEY ("cta_banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_cta_banner_pill_image_id_media_id_fk" FOREIGN KEY ("cta_banner_pill_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_cta_banner_collection_image_id_media_id_fk" FOREIGN KEY ("cta_banner_collection_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_newsletter_image_id_media_id_fk" FOREIGN KEY ("newsletter_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_settings_texts" ADD CONSTRAINT "shop_settings_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."shop_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_gallery_order_idx" ON "products_gallery" USING btree ("_order");
  CREATE INDEX "products_gallery_parent_id_idx" ON "products_gallery" USING btree ("_parent_id");
  CREATE INDEX "products_gallery_image_idx" ON "products_gallery" USING btree ("image_id");
  CREATE INDEX "products_options_values_order_idx" ON "products_options_values" USING btree ("_order");
  CREATE INDEX "products_options_values_parent_id_idx" ON "products_options_values" USING btree ("_parent_id");
  CREATE INDEX "products_options_order_idx" ON "products_options" USING btree ("_order");
  CREATE INDEX "products_options_parent_id_idx" ON "products_options" USING btree ("_parent_id");
  CREATE INDEX "products_category_order_idx" ON "products_category" USING btree ("order");
  CREATE INDEX "products_category_parent_idx" ON "products_category" USING btree ("parent_id");
  CREATE INDEX "products_pattern_order_idx" ON "products_pattern" USING btree ("order");
  CREATE INDEX "products_pattern_parent_idx" ON "products_pattern" USING btree ("parent_id");
  CREATE INDEX "products_seo_seo_image_idx" ON "products" USING btree ("seo_image_id");
  CREATE INDEX "products_status_idx" ON "products" USING btree ("status");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_product_type_idx" ON "products" USING btree ("product_type");
  CREATE INDEX "products_min_price_idx" ON "products" USING btree ("min_price");
  CREATE INDEX "products_available_idx" ON "products" USING btree ("available");
  CREATE INDEX "products_search_text_idx" ON "products" USING btree ("search_text");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products_texts_order_parent" ON "products_texts" USING btree ("order","parent_id");
  CREATE INDEX "products_texts_text_idx" ON "products_texts" USING btree ("text");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_shop_collections_id_idx" ON "products_rels" USING btree ("shop_collections_id");
  CREATE INDEX "_products_v_version_gallery_order_idx" ON "_products_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_products_v_version_gallery_parent_id_idx" ON "_products_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_gallery_image_idx" ON "_products_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_products_v_version_options_values_order_idx" ON "_products_v_version_options_values" USING btree ("_order");
  CREATE INDEX "_products_v_version_options_values_parent_id_idx" ON "_products_v_version_options_values" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_options_order_idx" ON "_products_v_version_options" USING btree ("_order");
  CREATE INDEX "_products_v_version_options_parent_id_idx" ON "_products_v_version_options" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_category_order_idx" ON "_products_v_version_category" USING btree ("order");
  CREATE INDEX "_products_v_version_category_parent_idx" ON "_products_v_version_category" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_pattern_order_idx" ON "_products_v_version_pattern" USING btree ("order");
  CREATE INDEX "_products_v_version_pattern_parent_idx" ON "_products_v_version_pattern" USING btree ("parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_seo_version_seo_image_idx" ON "_products_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_products_v_version_version_status_idx" ON "_products_v" USING btree ("version_status");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_product_type_idx" ON "_products_v" USING btree ("version_product_type");
  CREATE INDEX "_products_v_version_version_min_price_idx" ON "_products_v" USING btree ("version_min_price");
  CREATE INDEX "_products_v_version_version_available_idx" ON "_products_v" USING btree ("version_available");
  CREATE INDEX "_products_v_version_version_search_text_idx" ON "_products_v" USING btree ("version_search_text");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_texts_order_parent" ON "_products_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_shop_collections_id_idx" ON "_products_v_rels" USING btree ("shop_collections_id");
  CREATE INDEX "variants_product_idx" ON "variants" USING btree ("product_id");
  CREATE UNIQUE INDEX "variants_sku_idx" ON "variants" USING btree ("sku");
  CREATE INDEX "variants_image_idx" ON "variants" USING btree ("image_id");
  CREATE INDEX "variants_updated_at_idx" ON "variants" USING btree ("updated_at");
  CREATE INDEX "variants_created_at_idx" ON "variants" USING btree ("created_at");
  CREATE INDEX "shop_collections_rules_order_idx" ON "shop_collections_rules" USING btree ("_order");
  CREATE INDEX "shop_collections_rules_parent_id_idx" ON "shop_collections_rules" USING btree ("_parent_id");
  CREATE INDEX "shop_collections_image_idx" ON "shop_collections" USING btree ("image_id");
  CREATE INDEX "shop_collections_seo_seo_image_idx" ON "shop_collections" USING btree ("seo_image_id");
  CREATE UNIQUE INDEX "shop_collections_slug_idx" ON "shop_collections" USING btree ("slug");
  CREATE INDEX "shop_collections_updated_at_idx" ON "shop_collections" USING btree ("updated_at");
  CREATE INDEX "shop_collections_created_at_idx" ON "shop_collections" USING btree ("created_at");
  CREATE INDEX "shop_collections_rels_order_idx" ON "shop_collections_rels" USING btree ("order");
  CREATE INDEX "shop_collections_rels_parent_idx" ON "shop_collections_rels" USING btree ("parent_id");
  CREATE INDEX "shop_collections_rels_path_idx" ON "shop_collections_rels" USING btree ("path");
  CREATE INDEX "shop_collections_rels_products_id_idx" ON "shop_collections_rels" USING btree ("products_id");
  CREATE INDEX "shop_collections_rels_shop_collections_id_idx" ON "shop_collections_rels" USING btree ("shop_collections_id");
  CREATE INDEX "orders_line_items_order_idx" ON "orders_line_items" USING btree ("_order");
  CREATE INDEX "orders_line_items_parent_id_idx" ON "orders_line_items" USING btree ("_parent_id");
  CREATE INDEX "orders_line_items_product_idx" ON "orders_line_items" USING btree ("product_id");
  CREATE INDEX "orders_line_items_variant_idx" ON "orders_line_items" USING btree ("variant_id");
  CREATE INDEX "orders_line_items_image_idx" ON "orders_line_items" USING btree ("image_id");
  CREATE INDEX "orders_status_history_order_idx" ON "orders_status_history" USING btree ("_order");
  CREATE INDEX "orders_status_history_parent_id_idx" ON "orders_status_history" USING btree ("_parent_id");
  CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");
  CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");
  CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");
  CREATE INDEX "orders_access_token_idx" ON "orders" USING btree ("access_token");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "customers_addresses_order_idx" ON "customers_addresses" USING btree ("_order");
  CREATE INDEX "customers_addresses_parent_id_idx" ON "customers_addresses" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "customers_email_idx" ON "customers" USING btree ("email");
  CREATE INDEX "customers_updated_at_idx" ON "customers" USING btree ("updated_at");
  CREATE INDEX "customers_created_at_idx" ON "customers" USING btree ("created_at");
  CREATE UNIQUE INDEX "discounts_code_idx" ON "discounts" USING btree ("code");
  CREATE INDEX "discounts_updated_at_idx" ON "discounts" USING btree ("updated_at");
  CREATE INDEX "discounts_created_at_idx" ON "discounts" USING btree ("created_at");
  CREATE INDEX "discounts_rels_order_idx" ON "discounts_rels" USING btree ("order");
  CREATE INDEX "discounts_rels_parent_idx" ON "discounts_rels" USING btree ("parent_id");
  CREATE INDEX "discounts_rels_path_idx" ON "discounts_rels" USING btree ("path");
  CREATE INDEX "discounts_rels_shop_collections_id_idx" ON "discounts_rels" USING btree ("shop_collections_id");
  CREATE INDEX "discounts_rels_products_id_idx" ON "discounts_rels" USING btree ("products_id");
  CREATE INDEX "subscribers_email_idx" ON "subscribers" USING btree ("email");
  CREATE INDEX "subscribers_updated_at_idx" ON "subscribers" USING btree ("updated_at");
  CREATE INDEX "subscribers_created_at_idx" ON "subscribers" USING btree ("created_at");
  CREATE INDEX "pages_blocks_page_hero_order_idx" ON "pages_blocks_page_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_page_hero_parent_id_idx" ON "pages_blocks_page_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_page_hero_path_idx" ON "pages_blocks_page_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_page_hero_image_idx" ON "pages_blocks_page_hero" USING btree ("image_id");
  CREATE INDEX "pages_blocks_page_hero_mobile_image_idx" ON "pages_blocks_page_hero" USING btree ("mobile_image_id");
  CREATE INDEX "pages_blocks_story_images_order_idx" ON "pages_blocks_story_images" USING btree ("_order");
  CREATE INDEX "pages_blocks_story_images_parent_id_idx" ON "pages_blocks_story_images" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_story_images_image_idx" ON "pages_blocks_story_images" USING btree ("image_id");
  CREATE INDEX "pages_blocks_story_order_idx" ON "pages_blocks_story" USING btree ("_order");
  CREATE INDEX "pages_blocks_story_parent_id_idx" ON "pages_blocks_story" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_story_path_idx" ON "pages_blocks_story" USING btree ("_path");
  CREATE INDEX "pages_blocks_stats_items_order_idx" ON "pages_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_items_parent_id_idx" ON "pages_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_items_image_idx" ON "pages_blocks_stats_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_stats_order_idx" ON "pages_blocks_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_parent_id_idx" ON "pages_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_path_idx" ON "pages_blocks_stats" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_order_idx" ON "pages_blocks_contact" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_parent_id_idx" ON "pages_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_path_idx" ON "pages_blocks_contact" USING btree ("_path");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_banner_order_idx" ON "pages_blocks_cta_banner" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_banner_parent_id_idx" ON "pages_blocks_cta_banner" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_banner_path_idx" ON "pages_blocks_cta_banner" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_banner_image_idx" ON "pages_blocks_cta_banner" USING btree ("image_id");
  CREATE INDEX "pages_seo_seo_image_idx" ON "pages" USING btree ("seo_image_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_blocks_page_hero_order_idx" ON "_pages_v_blocks_page_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_page_hero_parent_id_idx" ON "_pages_v_blocks_page_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_page_hero_path_idx" ON "_pages_v_blocks_page_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_page_hero_image_idx" ON "_pages_v_blocks_page_hero" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_page_hero_mobile_image_idx" ON "_pages_v_blocks_page_hero" USING btree ("mobile_image_id");
  CREATE INDEX "_pages_v_blocks_story_images_order_idx" ON "_pages_v_blocks_story_images" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_story_images_parent_id_idx" ON "_pages_v_blocks_story_images" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_story_images_image_idx" ON "_pages_v_blocks_story_images" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_story_order_idx" ON "_pages_v_blocks_story" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_story_parent_id_idx" ON "_pages_v_blocks_story" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_story_path_idx" ON "_pages_v_blocks_story" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_stats_items_order_idx" ON "_pages_v_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_items_parent_id_idx" ON "_pages_v_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_items_image_idx" ON "_pages_v_blocks_stats_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_stats_order_idx" ON "_pages_v_blocks_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_parent_id_idx" ON "_pages_v_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_path_idx" ON "_pages_v_blocks_stats" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_order_idx" ON "_pages_v_blocks_contact" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_parent_id_idx" ON "_pages_v_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_path_idx" ON "_pages_v_blocks_contact" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_banner_order_idx" ON "_pages_v_blocks_cta_banner" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_banner_parent_id_idx" ON "_pages_v_blocks_cta_banner" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_banner_path_idx" ON "_pages_v_blocks_cta_banner" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_banner_image_idx" ON "_pages_v_blocks_cta_banner" USING btree ("image_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_seo_version_seo_image_idx" ON "_pages_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "posts_cover_image_idx" ON "posts" USING btree ("cover_image_id");
  CREATE INDEX "posts_seo_seo_image_idx" ON "posts" USING btree ("seo_image_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_published_at_idx" ON "posts" USING btree ("published_at");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_texts_order_parent" ON "posts_texts" USING btree ("order","parent_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_cover_image_idx" ON "_posts_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_posts_v_version_seo_version_seo_image_idx" ON "_posts_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_published_at_idx" ON "_posts_v" USING btree ("version_published_at");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_texts_order_parent" ON "_posts_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_variants_id_idx" ON "payload_locked_documents_rels" USING btree ("variants_id");
  CREATE INDEX "payload_locked_documents_rels_shop_collections_id_idx" ON "payload_locked_documents_rels" USING btree ("shop_collections_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_customers_id_idx" ON "payload_locked_documents_rels" USING btree ("customers_id");
  CREATE INDEX "payload_locked_documents_rels_discounts_id_idx" ON "payload_locked_documents_rels" USING btree ("discounts_id");
  CREATE INDEX "payload_locked_documents_rels_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("subscribers_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "header_nav_items_children_order_idx" ON "header_nav_items_children" USING btree ("_order");
  CREATE INDEX "header_nav_items_children_parent_id_idx" ON "header_nav_items_children" USING btree ("_parent_id");
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE INDEX "footer_groups_links_order_idx" ON "footer_groups_links" USING btree ("_order");
  CREATE INDEX "footer_groups_links_parent_id_idx" ON "footer_groups_links" USING btree ("_parent_id");
  CREATE INDEX "footer_groups_order_idx" ON "footer_groups" USING btree ("_order");
  CREATE INDEX "footer_groups_parent_id_idx" ON "footer_groups" USING btree ("_parent_id");
  CREATE INDEX "footer_legal_links_order_idx" ON "footer_legal_links" USING btree ("_order");
  CREATE INDEX "footer_legal_links_parent_id_idx" ON "footer_legal_links" USING btree ("_parent_id");
  CREATE INDEX "home_page_categories_cards_order_idx" ON "home_page_categories_cards" USING btree ("_order");
  CREATE INDEX "home_page_categories_cards_parent_id_idx" ON "home_page_categories_cards" USING btree ("_parent_id");
  CREATE INDEX "home_page_categories_cards_image_idx" ON "home_page_categories_cards" USING btree ("image_id");
  CREATE INDEX "home_page_reviews_items_order_idx" ON "home_page_reviews_items" USING btree ("_order");
  CREATE INDEX "home_page_reviews_items_parent_id_idx" ON "home_page_reviews_items" USING btree ("_parent_id");
  CREATE INDEX "home_page_upcoming_items_order_idx" ON "home_page_upcoming_items" USING btree ("_order");
  CREATE INDEX "home_page_upcoming_items_parent_id_idx" ON "home_page_upcoming_items" USING btree ("_parent_id");
  CREATE INDEX "home_page_upcoming_items_image_idx" ON "home_page_upcoming_items" USING btree ("image_id");
  CREATE INDEX "home_page_hero_hero_image_idx" ON "home_page" USING btree ("hero_image_id");
  CREATE INDEX "home_page_hero_hero_mobile_image_idx" ON "home_page" USING btree ("hero_mobile_image_id");
  CREATE INDEX "home_page_cta_banner_cta_banner_image_idx" ON "home_page" USING btree ("cta_banner_image_id");
  CREATE INDEX "home_page_cta_banner_cta_banner_pill_image_idx" ON "home_page" USING btree ("cta_banner_pill_image_id");
  CREATE INDEX "home_page_cta_banner_cta_banner_collection_image_idx" ON "home_page" USING btree ("cta_banner_collection_image_id");
  CREATE INDEX "home_page_newsletter_newsletter_image_idx" ON "home_page" USING btree ("newsletter_image_id");
  CREATE INDEX "home_page_rels_order_idx" ON "home_page_rels" USING btree ("order");
  CREATE INDEX "home_page_rels_parent_idx" ON "home_page_rels" USING btree ("parent_id");
  CREATE INDEX "home_page_rels_path_idx" ON "home_page_rels" USING btree ("path");
  CREATE INDEX "home_page_rels_products_id_idx" ON "home_page_rels" USING btree ("products_id");
  CREATE INDEX "shop_settings_texts_order_parent" ON "shop_settings_texts" USING btree ("order","parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "products_gallery" CASCADE;
  DROP TABLE "products_options_values" CASCADE;
  DROP TABLE "products_options" CASCADE;
  DROP TABLE "products_category" CASCADE;
  DROP TABLE "products_pattern" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_texts" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "_products_v_version_gallery" CASCADE;
  DROP TABLE "_products_v_version_options_values" CASCADE;
  DROP TABLE "_products_v_version_options" CASCADE;
  DROP TABLE "_products_v_version_category" CASCADE;
  DROP TABLE "_products_v_version_pattern" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_texts" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "variants" CASCADE;
  DROP TABLE "shop_collections_rules" CASCADE;
  DROP TABLE "shop_collections" CASCADE;
  DROP TABLE "shop_collections_rels" CASCADE;
  DROP TABLE "orders_line_items" CASCADE;
  DROP TABLE "orders_status_history" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "customers_addresses" CASCADE;
  DROP TABLE "customers" CASCADE;
  DROP TABLE "discounts" CASCADE;
  DROP TABLE "discounts_rels" CASCADE;
  DROP TABLE "subscribers" CASCADE;
  DROP TABLE "pages_blocks_page_hero" CASCADE;
  DROP TABLE "pages_blocks_story_images" CASCADE;
  DROP TABLE "pages_blocks_story" CASCADE;
  DROP TABLE "pages_blocks_stats_items" CASCADE;
  DROP TABLE "pages_blocks_stats" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_contact" CASCADE;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages_blocks_cta_banner" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v_blocks_page_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_story_images" CASCADE;
  DROP TABLE "_pages_v_blocks_story" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_items" CASCADE;
  DROP TABLE "_pages_v_blocks_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_contact" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_banner" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_texts" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_texts" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "header_nav_items_children" CASCADE;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "footer_groups_links" CASCADE;
  DROP TABLE "footer_groups" CASCADE;
  DROP TABLE "footer_legal_links" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "promo_bar" CASCADE;
  DROP TABLE "home_page_categories_cards" CASCADE;
  DROP TABLE "home_page_reviews_items" CASCADE;
  DROP TABLE "home_page_upcoming_items" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "home_page_rels" CASCADE;
  DROP TABLE "shop_settings" CASCADE;
  DROP TABLE "shop_settings_texts" CASCADE;
  DROP TYPE "public"."enum_products_options_kind";
  DROP TYPE "public"."enum_products_category";
  DROP TYPE "public"."enum_products_pattern";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum_products_product_type";
  DROP TYPE "public"."enum__products_v_version_options_kind";
  DROP TYPE "public"."enum__products_v_version_category";
  DROP TYPE "public"."enum__products_v_version_pattern";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum__products_v_version_product_type";
  DROP TYPE "public"."enum_shop_collections_rules_field";
  DROP TYPE "public"."enum_shop_collections_type";
  DROP TYPE "public"."enum_shop_collections_match";
  DROP TYPE "public"."enum_shop_collections_default_sort";
  DROP TYPE "public"."enum_orders_status_history_from";
  DROP TYPE "public"."enum_orders_status_history_to";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_payment_method";
  DROP TYPE "public"."enum_orders_payment_status";
  DROP TYPE "public"."enum_discounts_type";
  DROP TYPE "public"."enum_discounts_applies_to";
  DROP TYPE "public"."enum_subscribers_source";
  DROP TYPE "public"."enum_pages_blocks_story_theme";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_story_theme";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_promo_bar_theme";
  DROP TYPE "public"."enum_home_page_categories_cards_theme";
  DROP TYPE "public"."enum_home_page_categories_cards_tag_theme";`)
}
