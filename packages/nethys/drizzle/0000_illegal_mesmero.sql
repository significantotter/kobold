CREATE TABLE IF NOT EXISTS "nethys_bestiary" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"level" integer,
	"elastic_index" text NOT NULL,
	"elastic_id" text NOT NULL,
	"search" text NOT NULL,
	"tags" jsonb NOT NULL,
	"data" jsonb NOT NULL,
	CONSTRAINT "nethys_bestiary_data_unique" UNIQUE("data")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nethys_compendium" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"level" integer,
	"elastic_index" text NOT NULL,
	"elastic_id" text NOT NULL,
	"search" text NOT NULL,
	"tags" jsonb NOT NULL,
	"data" jsonb NOT NULL,
	CONSTRAINT "nethys_compendium_data_unique" UNIQUE("data")
);
