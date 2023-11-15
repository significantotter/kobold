// Kobold Errors are expected error messages encountered through regular use of the bot
// These result in a simple response message and no error logging
export class KoboldError extends Error {
	public constructor(
		public responseMessage: string,
		errorMessage?: string
	) {
		super(errorMessage ?? responseMessage);
	}
}
