import { extractString } from './extract-string.ts'

/**
 * Parses a string of comma-separated env vars
 *
 * ```ts
 * parseEnv('KEY_1=value,KEY_2 = "with spaces ") // { KEY_1: 'value', KEY_2: 'with spaces' }
 * ```
 */
export function parseEnv(content: string): Record<string, string> {
	const env: Record<string, string> = {}

	while (content.length) {
		const keyString = extractString(content, { bareDelimiters: ['='] })

		const key = keyString.value
		content = content.slice(keyString.consumed).trimStart()

		if (!content.startsWith('=')) throw new Error("Expected an '=' after env name")

		content = content.slice(1).trimStart()

		if (content.startsWith(',')) {
			env[key] = ''
			continue
		}

		const valueString = extractString(content, { bareDelimiters: [','] })

		const value = valueString.value
		content = content.slice(valueString.consumed).trimStart()

		env[key] = value

		if (!content.length) continue

		if (!content.startsWith(',')) throw new Error(`End of key value pair. Expected a comma or end of input, but got ${content[0]}`)
		content = content.slice(1).trimStart()
	}

	return env
}
