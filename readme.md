# Rumble

> Bundle/compile an html file and it's dependencies into a typescript function with a tidy spice of extra features.

Enables client-side code to included within a server's module graph.

Runs on the ESM module resolution pattern.

Supports typescript (strips types without checking them).

```html
<script src="foo.ts"></script>
```

Blazing fast (via [EsBuild](https://esbuild.github.io), web assembly is used for processor-heavy operations).

You can stop using weird hacks to get environment variables in your bundle. Just tell Rumble about them.

```ts
// Some ts file that is referenced in a script tag inside index.html
Deno.env.get('API_ENDPOINT')
```

```shell
rumble index.html bundle.generated.ts --env API_ENDPOINT=http://localhost:8000,ENV=$ENV
```

Compiled typescript file exposes a simple api.

```ts
import { serve } from 'https://deno.land/std/http/mod.ts
import initBundle from './bundle.generated.ts'

const bundle = initBundle()

serve(request => {
	const url = new URL(request.url)
	const file = bundle[url.pathname]

	if (!file) return new Response('not found', { status: 404 })

	return new Response(file.content, { headers: { 'Content-Type': file.contentType }})
})
```

## Wat!? Output a TS file?

The primary use case for this is integrating client-side code into a server. Such a server is easily portable because it doesn't need to haul around a directory full of client-side code everywhere it goes.

If you are just building a static site, use a different tool. This is for servers that need the ability to serve static content.

## Usage

```shell
rumble <entryFile> [outFile] [...options]
```

`entryFile` should be an html file. Rumble searches it for css files, images (including referenced favicons and OG banners), and js/ts files.

`outFile` is optional. If not specified, bundle will be written to `./bundle.generated.ts`.

## Contributing

Go for it!

```shell
git clone https://github.com/jikno/rumble
cd rumble
deno task test # or deno task test --watch
```
