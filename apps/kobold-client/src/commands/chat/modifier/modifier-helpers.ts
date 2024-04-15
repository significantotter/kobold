import { Modifier } from 'kobold-db';
import { KoboldError } from '../../../utils/KoboldError.js';

export class ModifierHelpers {
	public static detailModifier(modifier: Modifier) {
		const modifierTextLines = [];
		if (modifier.description) modifierTextLines.push(`${modifier.description}`);
		modifierTextLines.push(`Type: \`${modifier.type || 'untyped'}\``);
		if (modifier.severity != null) modifierTextLines.push(`Severity: \`${modifier.severity}\``);
		if (modifier.sheetAdjustments.length)
			modifierTextLines.push(
				`Sheet Adjustments: \`${modifier.sheetAdjustments
					.map(sheetAdjustment => {
						return `${sheetAdjustment.property} ${sheetAdjustment.operation} ${sheetAdjustment.value}`;
					})
					.join(', ')}\``
			);
		if (modifier.rollAdjustment) {
			modifierTextLines.push(`Roll Adjustment: \`${modifier.rollAdjustment}\``);
			modifierTextLines.push(`Roll Tags to Adjust: \`${modifier.rollTargetTags}\``);
			modifierTextLines.push(`Init tracker note: \`${modifier.note}\``);
		}
		return modifierTextLines.join('\n');
	}
}
