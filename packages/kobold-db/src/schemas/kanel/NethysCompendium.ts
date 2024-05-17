import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type NethysCompendiumId = number;

/** Represents the table public.nethys_compendium */
export default interface NethysCompendiumTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<NethysCompendiumId, NethysCompendiumId | undefined, NethysCompendiumId>;

  /** Database type: pg_catalog.text */
  name: ColumnType<string, string, string>;

  /** Database type: pg_catalog.text */
  category: ColumnType<string, string, string>;

  /** Database type: pg_catalog.int4 */
  level: ColumnType<number | null, number | null, number | null>;

  /** Database type: pg_catalog.int4 */
  elasticIndex: ColumnType<number, number, number>;

  /** Database type: pg_catalog.text */
  elasticId: ColumnType<string, string, string>;

  /** Database type: pg_catalog.text */
  search: ColumnType<string, string, string>;

  /** Database type: pg_catalog.jsonb */
  tags: ColumnType<unknown, unknown, unknown>;

  /** Database type: pg_catalog.jsonb */
  data: ColumnType<unknown, unknown, unknown>;

  /** Database type: pg_catalog.text */
  nethysId: ColumnType<string, string, string>;

  /** Database type: pg_catalog.bool */
  excludeFromSearch: ColumnType<boolean, boolean, boolean>;
}

export const nethysCompendiumId = z.number().int().max(2147483647);

export const zNethysCompendium = z.object({
  id: nethysCompendiumId,
  name: z.string(),
  category: z.string(),
  level: z.number().int().max(2147483647).nullable(),
  elasticIndex: z.number().int().max(2147483647),
  elasticId: z.string(),
  search: z.string(),
  tags: z.unknown(),
  data: z.unknown(),
  nethysId: z.string(),
  excludeFromSearch: z.boolean(),
});

export const zNethysCompendiumInitializer = z.object({
  id: nethysCompendiumId.optional(),
  name: z.string(),
  category: z.string(),
  level: z.number().int().max(2147483647).optional().nullable(),
  elasticIndex: z.number().int().max(2147483647),
  elasticId: z.string(),
  search: z.string(),
  tags: z.unknown(),
  data: z.unknown(),
  nethysId: z.string(),
  excludeFromSearch: z.boolean(),
});

export const zNethysCompendiumMutator = z.object({
  id: nethysCompendiumId.optional(),
  name: z.string().optional(),
  category: z.string().optional(),
  level: z.number().int().max(2147483647).optional().nullable(),
  elasticIndex: z.number().int().max(2147483647).optional(),
  elasticId: z.string().optional(),
  search: z.string().optional(),
  tags: z.unknown().optional(),
  data: z.unknown().optional(),
  nethysId: z.string().optional(),
  excludeFromSearch: z.boolean().optional(),
});

export type NethysCompendium = Selectable<NethysCompendiumTable>;

export type NewNethysCompendium = Insertable<NethysCompendiumTable>;

export type NethysCompendiumUpdate = Updateable<NethysCompendiumTable>;