import { bundle as bundleJs } from './utils/bundle.ts'
import { generateHeader } from './utils/header.ts'
import { reformHtml } from './utils/reform-html.ts'
import { createWatcher } from './utils/watcher.ts'
import { wrap } from './utils/wrap.ts'
import { colors } from './deps.ts'
import { getFileSize } from './utils/file-size.ts'

export interface BuildParams {
	/** The html entry file to bundle */
	entryFile: string

	/** The file to write the outputted function to */
	outFile?: string

	/** If true, the builder will watch the filesystem and rebuild on changes */
	watch?: boolean

	/** Env variables to pass to the website. These can be accessed via the Deno.env api */
	env?: Record<string, string>

	/** Do not populate the Deno.env object */
	disableEnv?: boolean

	/** Do not populate the Deno.args array */
	disableArgs?: boolean

	/**
	 * If true, a snippet will be inserted that will prompt web page to reload when
	 * server it was served from restarts. Don't enable this if the bundle will not be
	 * running in a web browser
	 */
	livereload?: boolean
}

export async function bundle(params: BuildParams) {
	const outFile = params.outFile || 'bundle.generated.ts'

	const header = generateHeader({
		args: !params.disableArgs,
		env: params.disableEnv ? null : params.env || null,
		livereload: params.livereload || false,
	})

	if (params.watch) await watchAndBundle()
	else await purelyBundle()

	async function watchAndBundle() {
		const watcher = createWatcher(async () => {
			console.log(colors.blue('Watcher'), 'File change detected! Bundling!')

			const files = await purelyBundle()
			watcher.addFiles(files)
		})

		const files = await purelyBundle()
		watcher.addFiles(files)
	}

	async function purelyBundle() {
		const file = await Deno.readTextFile(params.entryFile)

		const dependentFiles = [params.entryFile]

		const { assets, scripts, transformedHtml } = await reformHtml({
			html: file,
			htmlLocalPath: params.entryFile,
			rootPath: Deno.cwd(),
			header,
		})

		for (const asset in assets) dependentFiles.push(asset)

		for (const script in scripts) {
			const localUrl = scripts[script]
			const { js, files } = await bundleJs(script)

			dependentFiles.push(...files)
			assets[localUrl] = js
		}

		const fn = wrap({ assets, html: transformedHtml })

		await Deno.writeTextFile(outFile, fn)
		console.log(colors.green('Emit'), outFile, colors.gray(getFileSize(fn)))

		return dependentFiles
	}
}
