import { pathUtils, contentType } from '../deps.ts'

export interface WrapParams {
	html: string
	assets: Record<string, string>
}

export function wrap(params: WrapParams) {
	const newAssets: Record<string, { content: string; contentType: string }> = {}

	for (const asset in params.assets) {
		newAssets[asset] = {
			content: params.assets[asset],
			contentType: contentType(pathUtils.extname(asset)) || 'application/octet-stream',
		}
	}

	return `\	
export default function (...args: string[]): Record<string, { content: string, contentType: string }> {
	return {
		'/': { content: \`${params.html}\`, contentType: 'text/html' },
		...${JSON.stringify(newAssets)}
	}
}
`
}
