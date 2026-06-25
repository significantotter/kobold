import { Kysely, sql } from 'kysely';

const normalizeSheetExpression = (column: string) => sql`
	jsonb_set(
		(
			${sql.ref(column)} - 'sourceData'
			|| jsonb_build_object(
				'attacks',
				COALESCE(
					(
						SELECT jsonb_agg(
							attack || jsonb_build_object(
								'damage',
								COALESCE(
									(
										SELECT jsonb_agg(
											damage_term
											|| jsonb_build_object(
												'dice', COALESCE(damage_term->'dice', 'null'::jsonb),
												'type', COALESCE(damage_term->'type', 'null'::jsonb)
											)
										)
										FROM jsonb_array_elements(
											COALESCE(attack->'damage', '[]'::jsonb)
										) AS damage_term
									),
									'[]'::jsonb
								)
							)
						)
						FROM jsonb_array_elements(
							COALESCE(${sql.ref(column)}->'attacks', '[]'::jsonb)
						) AS attack
					),
					'[]'::jsonb
				)
			)
		),
		'{staticInfo,keyAbility}',
		CASE
			WHEN ${sql.ref(column)}#>'{staticInfo,keyAbility}' IS NULL THEN 'null'::jsonb
			WHEN jsonb_typeof(${sql.ref(column)}#>'{staticInfo,keyAbility}') = 'null'
				THEN 'null'::jsonb
			WHEN ${sql.ref(column)}#>>'{staticInfo,keyAbility}' IN (
				'strength',
				'dexterity',
				'constitution',
				'intelligence',
				'wisdom',
				'charisma'
			)
				THEN ${sql.ref(column)}#>'{staticInfo,keyAbility}'
			ELSE 'null'::jsonb
		END,
		true
	)
`;

export async function up(db: Kysely<any>): Promise<void> {
	await sql`
		UPDATE sheet_record
		SET
			sheet = ${normalizeSheetExpression('sheet')},
			adjusted_sheet = CASE
				WHEN adjusted_sheet IS NULL THEN NULL
				ELSE ${normalizeSheetExpression('adjusted_sheet')}
			END
	`.execute(db);
}

export async function down(_db: Kysely<any>): Promise<void> {
	// This migration only fills required defaults and removes obsolete data.
}
