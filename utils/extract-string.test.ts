import { extractString } from './extract-string.ts'
import { assertEquals, assertThrows } from 'https://deno.land/std@0.159.0/testing/asserts.ts'

Deno.test({
	name: 'bare strings should be extracted',
	fn() {
		const result = extractString('ho-ho-ho ho')

		assertEquals(result, { consumed: 8, value: 'ho-ho-ho' })
	},
})

Deno.test({
	name: 'quoted strings should be extracted',
	fn() {
		const result1 = extractString('"hello there" bob')
		assertEquals(result1, { consumed: 13, value: 'hello there' })

		const result2 = extractString("'hello there' bob")
		assertEquals(result2, { consumed: 13, value: 'hello there' })
	},
})

Deno.test({
	name: 'quoted strings with opposite interruptions should be extracted',
	fn() {
		const result1 = extractString('"hello\' there" bob')
		assertEquals(result1, { consumed: 14, value: "hello' there" })

		const result2 = extractString("'hello\" there' bob")
		assertEquals(result2, { consumed: 14, value: 'hello" there' })
	},
})

Deno.test({
	name: 'escaping should work',
	fn() {
		// Escapes on a bare string
		const result1 = extractString('hello\\ there bob')
		assertEquals(result1, { consumed: 12, value: 'hello there' })

		// Escapes on a single quoted string
		const result2 = extractString("'hello\\' there' bob")
		assertEquals(result2, { consumed: 15, value: "hello' there" })

		// Escapes on a double quoted string
		const result3 = extractString('"hello\\" there" bob')
		assertEquals(result3, { consumed: 15, value: 'hello" there' })
	},
})

Deno.test({
	name: 'should still work when string and content end at same time',
	fn() {
		// Escapes on a bare string
		const result1 = extractString('hello')
		assertEquals(result1, { consumed: 5, value: 'hello' })

		// Escapes on a single quoted string
		const result2 = extractString("'hello'")
		assertEquals(result2, { consumed: 7, value: 'hello' })

		// Escapes on a double quoted string
		const result3 = extractString('"hello"')
		assertEquals(result3, { consumed: 7, value: 'hello' })
	},
})

Deno.test({
	name: 'all strings must be closed',
	fn() {
		assertThrows(() => extractString('"hello'))
		assertThrows(() => extractString("'hello"))
	},
})
