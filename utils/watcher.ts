export function createWatcher(fn: (file: string) => unknown) {
	const interval = 1000
	const files = new Set<string>()

	async function pollFiles() {
		const now = Date.now()
		const lastCheckedTime = now - interval + interval * 0.1

		const filesToRemove: string[] = []

		for (const file of files) {
			const mtime = await getMtime(file)

			if (mtime === null) {
				filesToRemove.push(file)
				continue
			}

			if (mtime > lastCheckedTime) {
				fn(file)
				break
			}
		}

		for (const file of filesToRemove) {
			files.delete(file)
		}
	}

	function addFiles(newFiles: string[]) {
		for (const file of newFiles) files.add(file)
	}

	setInterval(() => pollFiles(), interval)

	return { addFiles }
}

async function getMtime(file: string) {
	// if (!file.startsWith('file://')) throw new Error('Expected files to be URLs')
	// const filePath = file.slice(7)

	let stat: Deno.FileInfo | null
	try {
		stat = await Deno.stat(file)
	} catch (_) {
		return null
	}

	if (!stat.mtime) throw new Error('Cannot poll file. OS does not support mtime')

	return stat.mtime.getTime()
}
