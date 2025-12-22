export const profiles = {
	lilac: {
		thumbnail: 'https://i.imgur.com/GmUc0Yl.png',
	},
};

export function withOrder<T>(options: T, order: number): T & { order: number } {
	return {
		...options,
		order,
	};
}
