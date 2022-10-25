import { flags } from './deps.ts'
import { helpMessage } from './help.ts'
import { bundle } from './mod.ts'
import { parseEnv } from './utils/parse-env.ts'

const options = flags.parse(Deno.args, {
	boolean: ['watch', 'help', 'no-env', 'no-args', 'livereload'],
	alias: { w: 'watch', h: 'help' },
	string: ['env'],
})

const entryFile = ensureString(options._[0])
const outFile = ensureString(options._[1])

const watch = options.watch
const shouldShowHelp = options.help
const disableEnv = options['no-env']
const disableArgs = options['no-args']
const env = parseEnv(options.env || '')
const livereload = options.livereload

if (shouldShowHelp) {
	console.log(helpMessage)
} else {
	if (!entryFile) throw new TypeError('Expected a single argument')

	await bundle({ entryFile, outFile, disableArgs, disableEnv, env, livereload, watch })
}

function ensureString(arg: string | number | undefined) {
	if (typeof arg === 'number') return `${arg}`
	return arg
}
