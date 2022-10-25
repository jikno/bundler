export function getFileSize(text: string) {
	const bytes = text.length * 2

	if (bytes < 1024) return `${roundToOne(bytes)} bytes`

	const kb = bytes / 1024
	if (kb < 1024) return `${roundToOne(kb)} KB`

	const mb = kb / 1024
	if (mb < 1024) return `${roundToOne(mb)} MB`

	const gb = mb / 1024
	if (gb < 1024) return `${roundToOne(gb)} GB`

	const tb = gb / 1024
	return `${roundToOne(tb)} TB`
}

function roundToOne(num: number) {
	const larger = Math.round(num * 10)
	return larger / 10
}
