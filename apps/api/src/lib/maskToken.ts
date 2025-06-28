export function maskToken(token: string, visibleChars = 12): string {
	const maskedLength = Math.max(token.length - visibleChars, 0);
	return `${token.substring(0, visibleChars)}${"\u2022".repeat(maskedLength)}`;
}
