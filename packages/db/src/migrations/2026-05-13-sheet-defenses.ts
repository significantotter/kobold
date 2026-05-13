import { Kysely, sql } from 'kysely';

const migrateExpression = (column: string) => sql`
	jsonb_strip_nulls(
		${sql.ref(column)}
		- 'weaknessesResistances'
		|| jsonb_build_object(
			'infoLists',
			(COALESCE(${sql.ref(column)}->'infoLists', '{}'::jsonb) - 'immunities'),
			'defenses',
			jsonb_build_object(
				'immunities',
				COALESCE(
					(
						SELECT jsonb_agg(
							jsonb_build_object(
								'label', lower(value),
								'raw', value,
								'appliesTo', jsonb_build_array('damage', 'effect'),
								'match', jsonb_build_object('traits', jsonb_build_array(lower(value))),
								'automation', 'auto',
								'source', 'manual'
							)
						)
						FROM jsonb_array_elements_text(COALESCE(${sql.ref(column)}#>'{infoLists,immunities}', '[]'::jsonb)) AS legacy(value)
					),
					'[]'::jsonb
				),
				'weaknesses',
				COALESCE(
					(
						SELECT jsonb_agg(
							jsonb_build_object(
								'label', lower(legacy->>'type'),
								'raw', legacy->>'type',
								'amount', (legacy->>'amount')::int,
								'appliesTo', jsonb_build_array('damage'),
								'match', jsonb_build_object('damageTypes', jsonb_build_array(lower(legacy->>'type'))),
								'automation', 'auto',
								'source', 'manual'
							)
						)
						FROM jsonb_array_elements(COALESCE(${sql.ref(column)}#>'{weaknessesResistances,weaknesses}', '[]'::jsonb)) AS legacy
					),
					'[]'::jsonb
				),
				'resistances',
				COALESCE(
					(
						SELECT jsonb_agg(
							jsonb_build_object(
								'label', lower(legacy->>'type'),
								'raw', legacy->>'type',
								'amount', (legacy->>'amount')::int,
								'appliesTo', jsonb_build_array('damage'),
								'match', jsonb_build_object('damageTypes', jsonb_build_array(lower(legacy->>'type'))),
								'automation', 'auto',
								'source', 'manual'
							)
						)
						FROM jsonb_array_elements(COALESCE(${sql.ref(column)}#>'{weaknessesResistances,resistances}', '[]'::jsonb)) AS legacy
					),
					'[]'::jsonb
				)
			)
		)
	)
`;

export async function up(db: Kysely<any>): Promise<void> {
	await sql`
		UPDATE sheet_record
		SET
			sheet = ${migrateExpression('sheet')},
			adjusted_sheet = CASE
				WHEN adjusted_sheet IS NULL THEN NULL
				ELSE ${migrateExpression('adjusted_sheet')}
			END
	`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
	await sql`
		UPDATE sheet_record
		SET
			sheet = sheet - 'defenses',
			adjusted_sheet = CASE
				WHEN adjusted_sheet IS NULL THEN NULL
				ELSE adjusted_sheet - 'defenses'
			END
	`.execute(db);
}
