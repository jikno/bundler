import { parseEnv } from './parse-env.ts'
import { assertEquals } from 'https://deno.land/std@0.159.0/testing/asserts.ts'

Deno.test({
	name: 'should parse out env vars',
	fn() {
		const env = parseEnv('HO_HO=happy-slap-jackie,HAGS_BAGS="fe fi fo fum"')

		assertEquals(env, {
			HO_HO: 'happy-slap-jackie',
			HAGS_BAGS: 'fe fi fo fum',
		})
	},
})
