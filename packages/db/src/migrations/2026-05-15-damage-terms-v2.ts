import { Kysely, sql } from 'kysely';

const termExpression = (term: unknown, fallbackMode: unknown = sql`'damage'`) => sql`
	(${term} - 'criticalOnly')
	|| jsonb_build_object(
		'mode', COALESCE(${term}->>'mode', ${fallbackMode}),
		'persistent', COALESCE((${term}->>'persistent')::boolean, false),
		'tags', COALESCE(${term}->'tags', '[]'::jsonb)
	)
`;

const termArrayExpression = (terms: unknown, fallbackMode: unknown = sql`'damage'`) => sql`
	COALESCE(
		(
			SELECT jsonb_agg(${termExpression(sql`term`, fallbackMode)})
			FROM jsonb_array_elements(COALESCE(${terms}, '[]'::jsonb)) AS term
		),
		'[]'::jsonb
	)
`;

const oneTermArrayExpression = (dice: unknown, damageType: unknown, fallbackMode: unknown) => sql`
	CASE
		WHEN ${dice} IS NULL AND ${damageType} IS NULL THEN '[]'::jsonb
		ELSE jsonb_build_array(
			jsonb_build_object(
				'dice', ${dice},
				'type', ${damageType},
				'tags', '[]'::jsonb,
				'mode', ${fallbackMode},
				'persistent', false
			)
		)
	END
`;

const migrateRollExpression = (roll: unknown) => sql`
	CASE
		WHEN ${roll}->>'type' = 'damage'
			AND NOT (${roll} ? 'terms')
			AND (${roll} ? 'roll' OR ${roll} ? 'damageType')
		THEN
			(${roll} - 'roll' - 'damageType' - 'healInsteadOfDamage')
			|| jsonb_build_object(
				'type', 'damage',
				'terms',
				${oneTermArrayExpression(
					sql`${roll}->'roll'`,
					sql`${roll}->'damageType'`,
					sql`CASE WHEN COALESCE((${roll}->>'healInsteadOfDamage')::boolean, false) THEN 'healing' ELSE 'damage' END`
				)}
			)
		WHEN ${roll}->>'type' = 'advanced-damage'
			AND NOT (
				${roll} ? 'criticalSuccessTerms'
				OR ${roll} ? 'successTerms'
				OR ${roll} ? 'failureTerms'
				OR ${roll} ? 'criticalFailureTerms'
			)
			AND (
				${roll} ? 'criticalSuccessRoll'
				OR ${roll} ? 'successRoll'
				OR ${roll} ? 'failureRoll'
				OR ${roll} ? 'criticalFailureRoll'
			)
		THEN
			(
				${roll}
				- 'damageType'
				- 'healInsteadOfDamage'
				- 'criticalSuccessRoll'
				- 'successRoll'
				- 'failureRoll'
				- 'criticalFailureRoll'
			)
			|| jsonb_build_object(
				'type', 'advanced-damage',
				'criticalSuccessTerms',
				${oneTermArrayExpression(
					sql`${roll}->'criticalSuccessRoll'`,
					sql`${roll}->'damageType'`,
					sql`CASE WHEN COALESCE((${roll}->>'healInsteadOfDamage')::boolean, false) THEN 'healing' ELSE 'damage' END`
				)},
				'successTerms',
				${oneTermArrayExpression(
					sql`${roll}->'successRoll'`,
					sql`${roll}->'damageType'`,
					sql`CASE WHEN COALESCE((${roll}->>'healInsteadOfDamage')::boolean, false) THEN 'healing' ELSE 'damage' END`
				)},
				'failureTerms',
				${oneTermArrayExpression(
					sql`${roll}->'failureRoll'`,
					sql`${roll}->'damageType'`,
					sql`CASE WHEN COALESCE((${roll}->>'healInsteadOfDamage')::boolean, false) THEN 'healing' ELSE 'damage' END`
				)},
				'criticalFailureTerms',
				${oneTermArrayExpression(
					sql`${roll}->'criticalFailureRoll'`,
					sql`${roll}->'damageType'`,
					sql`CASE WHEN COALESCE((${roll}->>'healInsteadOfDamage')::boolean, false) THEN 'healing' ELSE 'damage' END`
				)}
			)
		WHEN ${roll}->>'type' = 'damage' THEN
			(${roll} - 'healInsteadOfDamage')
			|| jsonb_build_object(
				'terms',
				${termArrayExpression(
					sql`${roll}->'terms'`,
					sql`CASE WHEN COALESCE((${roll}->>'healInsteadOfDamage')::boolean, false) THEN 'healing' ELSE 'damage' END`
				)}
			)
		WHEN ${roll}->>'type' = 'advanced-damage' THEN
			(${roll} - 'healInsteadOfDamage')
			|| jsonb_build_object(
				'criticalSuccessTerms',
				${termArrayExpression(
					sql`${roll}->'criticalSuccessTerms'`,
					sql`CASE WHEN COALESCE((${roll}->>'healInsteadOfDamage')::boolean, false) THEN 'healing' ELSE 'damage' END`
				)},
				'successTerms',
				${termArrayExpression(
					sql`${roll}->'successTerms'`,
					sql`CASE WHEN COALESCE((${roll}->>'healInsteadOfDamage')::boolean, false) THEN 'healing' ELSE 'damage' END`
				)},
				'failureTerms',
				${termArrayExpression(
					sql`${roll}->'failureTerms'`,
					sql`CASE WHEN COALESCE((${roll}->>'healInsteadOfDamage')::boolean, false) THEN 'healing' ELSE 'damage' END`
				)},
				'criticalFailureTerms',
				${termArrayExpression(
					sql`${roll}->'criticalFailureTerms'`,
					sql`CASE WHEN COALESCE((${roll}->>'healInsteadOfDamage')::boolean, false) THEN 'healing' ELSE 'damage' END`
				)}
			)
		ELSE ${roll}
	END
`;

const migrateSheetExpression = (column: string) => sql`
	${sql.ref(column)}
	|| jsonb_build_object(
		'attacks',
		COALESCE(
			(
				SELECT jsonb_agg(
					attack || jsonb_build_object(
						'damage',
						COALESCE(
							(
								SELECT jsonb_agg(${termExpression(sql`damage_term`)})
								FROM jsonb_array_elements(COALESCE(attack->'damage', '[]'::jsonb)) AS damage_term
							),
							'[]'::jsonb
						)
					)
				)
				FROM jsonb_array_elements(COALESCE(${sql.ref(column)}->'attacks', '[]'::jsonb)) AS attack
			),
			'[]'::jsonb
		)
	)
`;

const downMigrateSheetExpression = (column: string) => sql`
	${sql.ref(column)}
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
									jsonb_build_object(
										'dice', COALESCE(damage_term->'dice', '""'::jsonb),
										'type', damage_term->'type'
									)
								)
								FROM jsonb_array_elements(COALESCE(attack->'damage', '[]'::jsonb)) AS damage_term
							),
							'[]'::jsonb
						)
					)
				)
				FROM jsonb_array_elements(COALESCE(${sql.ref(column)}->'attacks', '[]'::jsonb)) AS attack
			),
			'[]'::jsonb
		)
	)
`;

export async function up(db: Kysely<any>): Promise<void> {
	await sql`
		UPDATE action
		SET rolls = COALESCE(
			(
				SELECT jsonb_agg(${migrateRollExpression(sql`roll`)})
				FROM jsonb_array_elements(COALESCE(rolls, '[]'::jsonb)) AS roll
			),
			'[]'::jsonb
		)
	`.execute(db);

	await sql`
		UPDATE sheet_record
		SET
			sheet = ${migrateSheetExpression('sheet')},
			adjusted_sheet = CASE
				WHEN adjusted_sheet IS NULL THEN NULL
				ELSE ${migrateSheetExpression('adjusted_sheet')}
			END
	`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
	await sql`
		UPDATE action
		SET rolls = COALESCE(
			(
				SELECT jsonb_agg(
					CASE
						WHEN roll->>'type' = 'damage' THEN
							(roll - 'terms')
							|| jsonb_build_object(
								'type', 'damage',
								'roll', roll#>'{terms,0,dice}',
								'damageType', roll#>'{terms,0,type}',
								'healInsteadOfDamage', COALESCE(roll#>>'{terms,0,mode}', 'damage') = 'healing'
							)
						WHEN roll->>'type' = 'advanced-damage' THEN
							(
								roll
								- 'criticalSuccessTerms'
								- 'successTerms'
								- 'failureTerms'
								- 'criticalFailureTerms'
							)
							|| jsonb_build_object(
								'type', 'advanced-damage',
								'damageType', COALESCE(
									roll#>'{successTerms,0,type}',
									roll#>'{criticalSuccessTerms,0,type}',
									roll#>'{failureTerms,0,type}',
									roll#>'{criticalFailureTerms,0,type}'
								),
								'criticalSuccessRoll', roll#>'{criticalSuccessTerms,0,dice}',
								'successRoll', roll#>'{successTerms,0,dice}',
								'failureRoll', roll#>'{failureTerms,0,dice}',
								'criticalFailureRoll', roll#>'{criticalFailureTerms,0,dice}',
								'healInsteadOfDamage', COALESCE(
									roll#>>'{successTerms,0,mode}',
									roll#>>'{criticalSuccessTerms,0,mode}',
									roll#>>'{failureTerms,0,mode}',
									roll#>>'{criticalFailureTerms,0,mode}',
									'damage'
								) = 'healing'
							)
						ELSE roll
					END
				)
				FROM jsonb_array_elements(COALESCE(rolls, '[]'::jsonb)) AS roll
			),
			'[]'::jsonb
			)
	`.execute(db);

	await sql`
		UPDATE sheet_record
		SET
			sheet = ${downMigrateSheetExpression('sheet')},
			adjusted_sheet = CASE
				WHEN adjusted_sheet IS NULL THEN NULL
				ELSE ${downMigrateSheetExpression('adjusted_sheet')}
			END
	`.execute(db);
}
