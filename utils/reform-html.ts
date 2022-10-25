import { HTMLRewriter, pathUtils, recursiveReaddir } from '../deps.ts'

export interface ReformHtmlParams {
	/** An absolute path that represents where on the local filesystem the website root is located */
	rootPath: string

	/** A path that represents the location of the supplied html file relative to the website root */
	htmlLocalPath: string

	/** The html contents to operate on */
	html: string

	/** Extra script content to be added */
	header: string
}

export interface ReformHtmlResult {
	/**
	 * TS->JS
	 *
	 * An array of absolute paths (TS), representative of files on the local system, that need to be
	 * read, bundled into JS files, and cached as an absolute, site-relative path (JS).
	 */
	scripts: Record<string, string>

	/**
	 * A->RA
	 *
	 * An array of absolute paths (A), representative of files on the local system, that need to be
	 * cached as an absolute, site-relative path (RA).
	 */
	assets: Record<string, string>

	/**
	 * The transformed html. Asset meta tags are removed, and references to typescript files are
	 * changed to js files.
	 */
	transformedHtml: string
}

/** Read certain data from html, while also performing some slight transformations */
export async function reformHtml(params: ReformHtmlParams): Promise<ReformHtmlResult> {
	const htmlFsPath = pathUtils.join(params.rootPath, params.htmlLocalPath)

	const assets: Record<string, string> = {}
	const scripts: Record<string, string> = {}

	const addAsset = (src: string, throwIfRemote = false) => {
		const paths = getAbsolutePaths(htmlFsPath, params.rootPath, src)

		// If there are no absolute paths, that means the resource is remote
		if (!paths) {
			if (throwIfRemote) throw new Error(`Remote asset ${src} is not allowed`)
			return
		}

		assets[paths.fs] = paths.site
		return paths.site
	}

	const transformedHtml = await new HTMLRewriter()
		.on('head', {
			element(element) {
				element.append(`<script>\n${params.header}\n</script>`, { html: true })
			},
		})
		// Perform a check on every script tag
		.on('script', {
			element(element) {
				// Ignore inline scripts
				const src = element.getAttribute('src')
				if (!src) return

				// Resolve the value of the "src" attribute into the two absolute paths of the script
				const paths = getAbsolutePaths(htmlFsPath, params.rootPath, src)
				if (!paths) return // But ignore if the script not local

				// If it is not a typescript file that is referenced, just add it as an asset
				if (!paths.fs.endsWith('.ts')) {
					assets[paths.fs] = paths.site
					element.setAttribute('src', paths.site)

					return
				}

				// But if it is a ts file, rewrite the extension from .ts to .js
				const newSitePath = `${paths.site.slice(0, -3)}.js`
				// And remember this script as needing to be bundled/compiled
				scripts[paths.fs] = newSitePath
				// Change the attribute to point to the
				element.setAttribute('src', newSitePath)
			},
		})
		.on('meta', {
			async element(element) {
				const name = element.getAttribute('name')
				if (!name) return // ignore any unnamed meta tags

				if (name === 'og:image') {
					const content = element.getAttribute('content')
					if (!content) throw new Error('An open graph image should have the url to the image in a "content" attribute')

					const sitePath = addAsset(content)
					if (sitePath) element.setAttribute('content', sitePath)

					return
				}

				if (name === 'twitter:image') {
					const content = element.getAttribute('content')
					if (!content) throw new Error('A twitter card image should have the url to the image in a "content" attribute')

					const sitePath = addAsset(content)
					if (sitePath) element.setAttribute('content', sitePath)

					return
				}

				if (name === 'asset') {
					const content = element.getAttribute('content')
					if (!content)
						throw new Error('Encountered an asset meta tag. Expected to find a "content" attribute with path to asset.')

					addAsset(content, true)

					// And then we need to remove this element. It's only purpose is to notify us of assets
					element.remove()

					return
				}

				if (name === 'asset:directory') {
					const content = element.getAttribute('content')
					if (!content)
						throw new Error('Encountered an asset meta tag. Expected to find a "content" attribute with path to asset.')

					// get the absolute paths that supposedly point to a directory of assets
					const paths = getAbsolutePaths(htmlFsPath, params.rootPath, content)
					if (!paths) throw new Error('Assets cannot be local files and cannot be fetched over http')

					// Then read all the files in that directory
					// This gives us a bunch of absolute paths
					const files = await recursiveReaddir(paths.fs)

					// So we need to loop through each file, find the path relative to the html file...
					for (const file of files) {
						const relativePath = pathUtils.relative(htmlFsPath, file)

						// ... and add it as an asset
						assets[file] = relativePath
					}

					// And then we need to remove this element. It's only purpose is to notify us of assets
					element.remove()

					return
				}
			},
		})
		.on('link', {
			element(element) {
				const href = element.getAttribute('href')
				if (!href) return

				const sitePath = addAsset(href)
				if (sitePath) element.setAttribute('href', sitePath)

				return
			},
		})
		.on('img', {
			element(element) {
				const src = element.getAttribute('src')
				if (!src) return

				const sitePath = addAsset(src)
				if (sitePath) element.setAttribute('src', sitePath)

				return
			},
		})
		.transform(new Response(params.html))
		.text()

	return { assets, scripts, transformedHtml }
}

function getAbsolutePaths(htmlFsPath: string, rootPath: string, src: string) {
	if (src.startsWith('http://') || src.startsWith('https://')) return

	const path = src.startsWith('file://') ? src.slice(7) : src
	const htmlSitePath = htmlFsPath.slice(rootPath.length)
	const htmlSiteDir = pathUtils.dirname(htmlSitePath)

	const absoluteSitePath = path.startsWith('/') ? path : pathUtils.join(htmlSiteDir, path)

	return {
		fs: pathUtils.join(rootPath, absoluteSitePath),
		site: absoluteSitePath,
	}
}
