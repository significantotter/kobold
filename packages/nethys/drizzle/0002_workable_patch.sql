ALTER TABLE "nethys_bestiary" ADD COLUMN "nethys_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "nethys_bestiary" ADD COLUMN "exclude_from_search" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "nethys_compendium" ADD COLUMN "nethys_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "nethys_compendium" ADD COLUMN "exclude_from_search" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "nethys_bestiary" ADD CONSTRAINT "nethys_bestiary_nethys_id_unique" UNIQUE("nethys_id");--> statement-breakpoint
ALTER TABLE "nethys_compendium" ADD CONSTRAINT "nethys_compendium_nethys_id_unique" UNIQUE("nethys_id");