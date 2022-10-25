export interface ExtractStringOptions {
	bareDelimiters?: string[]
}

export function extractString(content: string, options: ExtractStringOptions = {}) {
	const bareDelimiters = options.bareDelimiters || []

	let consumed = 0
	let value = ''

	let strategy: 'bare' | 'double-quote' | 'single-quote' = 'bare'
	let escaped = false

	if (content.startsWith('"')) {
		strategy = 'double-quote'
		consumed++
	} else if (content.startsWith("'")) {
		strategy = 'single-quote'
		consumed++
	}

	for (const char of content.slice(consumed)) {
		// If we are in the process of being escaped, don't break the string on this char
		if (escaped) {
			escaped = false
		}

		// Otherwise, we'll run all our checks to see if this is an escape char or the end of the string
		else {
			// If the char is a backslash, we need to turn escape mode on. Consume the char, but don't add
			// to the string's value
			if (char === '\\') {
				consumed++
				escaped = true

				// Then don't do anything else. Skip straight to the next char
				continue
			}

			// If we come across whitespace in an unquoted string, finish
			// Also finish if we come across a custom delimiter for bare strings
			if (strategy === 'bare') {
				if (/\s/.test(char)) break
				if (bareDelimiters.includes(char)) break
			}

			// If we come across a double quote in a double quoted string, finish
			if (strategy === 'double-quote' && char === '"') break

			// If we come across a single quote in a single quoted string, finish
			if (strategy === 'single-quote' && char === "'") break
		}

		// Ok, this is not the end of the string. Consume the char
		consumed++
		value += char
	}

	// If the string was quoted, we need to consume that last quote
	if (strategy !== 'bare') {
		// Because the last quote of a quoted string is never consumed, there should be an extra quote to consume
		// If there is not, the string ended because the content ended, not because the string was closed
		if (consumed >= content.length) throw new Error('String was never closed')

		consumed++
	}

	return { consumed, value }
}
