import { Modifier } from 'kobold-db';
import { KoboldError } from '../../../utils/KoboldError.js';

export class ModifierHelpers {
	public static validateSeverity(severity: string | null): number | null {
		severity = severity?.toLowerCase?.()?.trim?.() ?? null;
		if ([null, 'null', 'none', 'x', 'no', 'false'].includes(severity)) {
			return null;
		} else if (!isNaN(Number(severity))) {
			return Number(severity);
		} else {
			throw new KoboldError(
				'Yip! I couldn\'t understand the severity you entered. Please enter a number or "none" to remove the severity.'
			);
		}
	}
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
		}
		return modifierTextLines.join('\n');
	}
}
