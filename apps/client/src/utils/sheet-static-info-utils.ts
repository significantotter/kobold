import { AbilityEnum, isAbilityEnum } from '@kobold/db';
import { KoboldError } from '@kobold/util';

export class SheetStaticInfoUtils {
	public static parseKeyAbility(
		input: string | null
	): AbilityEnum | null | undefined {
		if (input === null) return undefined;
		const normalizedInput = input.trim().toLowerCase();
		if (normalizedInput === 'none') return null;
		if (!isAbilityEnum(normalizedInput)) {
			throw new KoboldError(`Yip! "${input}" is not a valid key ability.`);
		}
		return normalizedInput;
	}

	public static parseNullableLevel(input: string): number | null {
		const normalizedInput = input.trim().toLowerCase();
		if (normalizedInput === 'none') return null;
		if (!/^-?\d+$/.test(normalizedInput)) {
			throw new KoboldError('Yip! NPC level must be a whole number or "none".');
		}
		return Number(normalizedInput);
	}

	public static parseBoolean(input: string, fieldName: string): boolean {
		const normalizedInput = input.trim().toLowerCase();
		if (['true', 'yes', '1', 'on'].includes(normalizedInput)) return true;
		if (['false', 'no', '0', 'off'].includes(normalizedInput)) return false;
		throw new KoboldError(`Yip! ${fieldName} must be true or false.`);
	}
}
