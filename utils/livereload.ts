export const livereloadSnippet = `\
	;(function() {
		const isSecure = location.protocol === 'https:'
		const socket = new WebSocket(\\\`\\\${isSecure ? 'wss' : 'ws'}:\\\${location.host}/_livereload.ws\\\`)

		socket.onclose = () => {
			console.log('[livereload] server closed, checking status in 1 second...')

			call()
			async function call() {
				try {
					await fetch('/')
					location.reload()
				} catch (_) {
					console.log('[livereload] server closed, rechecking status in 1 second...')
					setTimeout(() => call(), 1000)
				}
			}
		}
	})()
`
