ALTER TABLE "nethys_bestiary" ALTER COLUMN "elastic_index" SET DATA TYPE integer USING "elastic_index"::INTEGER;--> statement-breakpoint
ALTER TABLE "nethys_compendium" ALTER COLUMN "elastic_index" SET DATA TYPE integer USING "elastic_index"::INTEGER;--> statement-breakpoint
ALTER TABLE "nethys_bestiary" ADD CONSTRAINT "nethys_bestiary_elastic_index_id_unique" UNIQUE("elastic_index","id");--> statement-breakpoint
ALTER TABLE "nethys_compendium" ADD CONSTRAINT "nethys_compendium_elastic_index_id_unique" UNIQUE("elastic_index","id");