const projectBase = 'https://github.com/jikno/authy/blob/next/scripts/bundle'

export const helpMessage = `\
Bundle/compile a static website into a typescript function with a tidy spice of extra features.

${projectBase}/docs/readme.md

Usage:
	rumble <entryFile> [outFile] [...options]

Arguments:
	entryFile           The html file to use as a bundler entry point. See ${projectBase}/docs/entry-html.md
	outFile             The file to write the generated bundle builder function to. (default "bundle.ts")

Options:
	--watch, -w         If specified, the program will not exit after the first bundle, but will watch the bundle's associated files and re-bundle when there are any changes.
	--help, -h          Display this message and exit.
	--env               A string of key=value pairs, separated by commas, made available to the app via the Deno.env api. Example: "KEY1=VALUE1,KEY2=VALUE2,KEY3=VALUE3". See ${projectBase}/docs/env-vars/md
	--no-env            Do not populate the Deno.env object.
	--no-args           Do not populate the Deno.args array. See ${projectBase}/docs/args.md
	--livereload        Insert a code snippet on the client which will reload itself when the server the site was served from restarts. See ${projectBase}/docs/livereload.md
`
