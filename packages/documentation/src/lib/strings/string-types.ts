/**
 * String utilities for type-safe message templates.
 *
 * This module provides a simple replacement for typesafe-i18n,
 * using plain TypeScript for parameterized strings.
 */

/**
 * A simple string that requires no parameters.
 */
export type StaticString = string;

/**
 * A function that takes parameters and returns a formatted string.
 * This replaces typesafe-i18n's parameterized strings like `{paramName}`.
 *
 * @example
 * const greeting = msg((p: { name: string }) => `Hello, ${p.name}!`);
 */
export type ParameterizedString<TParams> = (params: TParams) => string;

/**
 * Helper function to create parameterized strings with type inference.
 * Eliminates the need for `as ParameterizedString<T>` casts.
 *
 * @example
 * const greeting = msg((p: { name: string }) => `Hello, ${p.name}!`);
 * greeting({ name: 'World' }); // "Hello, World!"
 */
export const msg = <T>(fn: (params: T) => string): ParameterizedString<T> => fn;

/**
 * A string that can be either static or parameterized.
 */
export type MessageString<TParams = void> = TParams extends void
	? StaticString
	: ParameterizedString<TParams>;

/**
 * Structure for confirmation dialogs (used with buttons).
 */
export interface ConfirmationStrings<TTextParams = void> {
	text: TTextParams extends void ? StaticString : ParameterizedString<TTextParams>;
	confirmButton: StaticString;
	cancelButton: StaticString;
	expired: StaticString;
}

/**
 * Structure for embed responses.
 */
export interface EmbedStrings<TTitleParams = void, TDescParams = void> {
	title: TTitleParams extends void ? StaticString : ParameterizedString<TTitleParams>;
	description?: TDescParams extends void ? StaticString : ParameterizedString<TDescParams>;
	footer?: StaticString;
}
