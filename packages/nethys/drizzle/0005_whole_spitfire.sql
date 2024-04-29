ALTER TABLE "nethys_bestiary" DROP CONSTRAINT "nethys_bestiary_elastic_index_elastic_id_unique";--> statement-breakpoint
ALTER TABLE "nethys_compendium" DROP CONSTRAINT "nethys_compendium_elastic_index_elastic_id_unique";--> statement-breakpoint
ALTER TABLE "nethys_bestiary" ADD CONSTRAINT "nethys_bestiary_elastic_id_unique" UNIQUE("elastic_id");--> statement-breakpoint
ALTER TABLE "nethys_compendium" ADD CONSTRAINT "nethys_compendium_elastic_id_unique" UNIQUE("elastic_id");