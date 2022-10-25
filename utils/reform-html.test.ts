import { assertEquals } from 'https://deno.land/std@0.134.0/testing/asserts.ts'
import { reformHtml } from './reform-html.ts'

Deno.test({
	name: 'should really reform the html',
	async fn() {
		const html = `\
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8" />
					<meta http-equiv="X-UA-Compatible" content="IE=edge" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />

					<title>Document</title>

					<meta name="asset" content="/settings.json" />

					<link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png" />
					<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
					<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
					<link rel="manifest" href="/site.webmanifest" />
					<meta name="msapplication-TileColor" content="#da532c" />
					<meta name="theme-color" content="#ffffff" />
					<meta name="og:image" content="/og-image.png" />

					<script>
						console.log('I should be left alone')
					</script>

					<script src="https://example.com/i-am-not-an-asset.js"></script>
					<script src="/analytics.js"></script>
					<script src="/main.ts"></script>
				</head>
				<body>
					<img src="/custom-image.png" />
					<img src="https://example.com/example-image.png" />
				</body>
			</html>`

		const expectedHtml = `\
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8" />
					<meta http-equiv="X-UA-Compatible" content="IE=edge" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />

					<title>Document</title>

\t\t\t\t\t

					<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
					<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
					<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
					<link rel="manifest" href="/site.webmanifest" />
					<meta name="msapplication-TileColor" content="#da532c" />
					<meta name="theme-color" content="#ffffff" />
					<meta name="og:image" content="/og-image.png" />

					<script>
						console.log('I should be left alone')
					</script>

					<script src="https://example.com/i-am-not-an-asset.js"></script>
					<script src="/analytics.js"></script>
					<script src="/main.js"></script>
				<script>
ho
</script></head>
				<body>
					<img src="/custom-image.png" />
					<img src="https://example.com/example-image.png" />
				</body>
			</html>`

		const result = await reformHtml({ html, htmlLocalPath: '/templates/index.html', rootPath: '/www', header: 'ho' })

		console.log('actual', result.transformedHtml)
		console.log('expected', expectedHtml)

		assertEquals(result, {
			scripts: { '/www/main.ts': '/main.js' },
			assets: {
				'/www/analytics.js': '/analytics.js',
				'/www/assets/apple-touch-icon.png': '/assets/apple-touch-icon.png',
				'/www/custom-image.png': '/custom-image.png',
				'/www/favicon-16x16.png': '/favicon-16x16.png',
				'/www/favicon-32x32.png': '/favicon-32x32.png',
				'/www/og-image.png': '/og-image.png',
				'/www/site.webmanifest': '/site.webmanifest',
				'/www/settings.json': '/settings.json',
			},
			transformedHtml: expectedHtml,
		})
	},
})
