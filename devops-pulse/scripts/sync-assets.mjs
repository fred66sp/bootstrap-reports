import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const vendor = join(root, 'web', 'static', 'vendor')
mkdirSync(vendor, { recursive: true })

const files = [
  ['bootstrap/dist/css/bootstrap.min.css', 'bootstrap.min.css'],
  ['bootstrap/dist/js/bootstrap.bundle.min.js', 'bootstrap.bundle.min.js'],
  ['htmx.org/dist/htmx.min.js', 'htmx.min.js'],
]
const sseDir = join(root, 'node_modules', 'htmx-ext-sse', 'dist')
const sseFile = readdirSync(sseDir).find(name => name.endsWith('.min.js'))
if (!sseFile) throw new Error(`No minified SSE extension found in ${sseDir}`)
files.push([join('htmx-ext-sse', 'dist', sseFile), 'htmx-ext-sse.min.js'])
files.push(['alpinejs/dist/module.esm.js', 'alpine.module.esm.js'])

for (const [source, destination] of files) {
  const sourcePath = source.startsWith('/') ? join(root, 'node_modules', source) : join(root, 'node_modules', source)
  if (!existsSync(sourcePath)) throw new Error(`Missing asset: ${sourcePath}`)
  const destinationPath = join(vendor, destination)
  copyFileSync(sourcePath, destinationPath)
  console.log(`${destination}: ${sourcePath}`)
}
