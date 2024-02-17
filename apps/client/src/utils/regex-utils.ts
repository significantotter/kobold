export class RegexUtils {
	public static regex(input: string): RegExp | null {
		let match = input.match(/^\/(.*)\/([^/]*)$/);
		if (!match) {
			return null;
		}

		return new RegExp(match[1], match[2]);
	}

	public static caseInsensitive = (input: string): string => {
		let expression = '';
		for (let i = 0; i < input.length; i++) {
			expression += `[${input[i].toLowerCase()}${input[i].toUpperCase()}]`;
		}
		return expression;
	};

	public static discordId(input: string): string | undefined {
		return input.match(/\b\d{17,20}\b/)?.[0];
	}

	public static tag(
		input: string
	): { username: string; tag: string; discriminator: string } | undefined {
		let match = input.match(/\b(.+)#([\d]{4})\b/);
		if (!match) {
			return;
		}

		return {
			tag: match[0],
			username: match[1],
			discriminator: match[2],
		};
	}
}
