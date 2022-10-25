import { argsSnippet } from './args.ts'
import { generateEnvSnippet } from './env.ts'
import { livereloadSnippet } from './livereload.ts'

export interface GenerateHeaderParams {
	env: Record<string, string> | null
	args: boolean
	livereload: boolean
}

export function generateHeader(params: GenerateHeaderParams) {
	const code = ['window.Deno = {}']

	if (params.livereload) code.push(livereloadSnippet)
	if (params.env) code.push(generateEnvSnippet(params.env))
	if (params.args) code.push(argsSnippet)

	return code.join('\n')
}
