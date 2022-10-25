import { denoBundle, createCache } from '../deps.ts'

export async function bundle(entryPath: string) {
	if (!entryPath.startsWith('/')) throw new Error('Expected entryPath to be an absolute path')

	const entryUrl = `file://${entryPath}`
	const cache = createCache()
	const localFiles: string[] = []

	const { code } = await denoBundle(new URL(entryUrl), {
		load(specifier) {
			if (specifier.startsWith('file://')) localFiles.push(specifier.slice(7))

			return cache.load(specifier)
		},
		type: 'classic',
		compilerOptions: { sourceMap: false },
	})

	const mappingRegex = /\/\/# sourceMappingURL=data:application\/json;base64,[\w/+]+=*/
	const js = `(async function(){\n\n${code.replace(mappingRegex, '')}\n\n})()`

	return { js, files: localFiles }
}
