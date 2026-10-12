#!/usr/bin/env node
// Mechanical checks for the documentation rules that can be verified:
//
//   R1  a cited path that does not exist: markdown links (always) and
//       root-anchored inline paths such as `docs/foo.md` or `devops-pulse/bar.go`
//   R2  a reference to a section by its title inside docs/, which rots as soon as
//       the section is renamed or moved
//   R3  a recovery recipe for a retired document inside docs/ (git show ...)
//
// What this cannot check: prose that states what another document says. That is
// the job of the one-primary-home rule, not of a script.
//
// Scope, and why it is narrower than "every markdown file":
//   - odd/tasks/ holds historical records. They cite paths that no longer exist
//     on purpose, because that is what happened; the retired document and the
//     retired skill must still be nameable there.
//   - .agents/skills/bootstrap-*/ are copies restored from skills-lock.json.
//     They are not ours to edit, and they use Bootstrap's own template syntax.
//
// Inline paths that are not anchored at the repository root (bare file names,
// paths relative to an application directory, anything under node_modules,
// globs, command fragments) are counted and reported as a number, because
// flagging them would be noise.
//
// Usage: node scripts/check-docs.mjs

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const skipDirs = new Set(['node_modules', '.git', '.codegraph', '.engram', '.atl', 'dist', 'bin'])
const rootEntries = new Set(readdirSync(repoRoot))

function relative(file) {
  return file.slice(repoRoot.length + 1)
}

function isHistoricalRecord(file) {
  return relative(file).startsWith('odd/tasks/')
}

function isRestoredSkillCopy(file) {
  return relative(file).startsWith('.agents/skills/bootstrap-')
}

function markdownFiles(dir) {
  const found = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) found.push(...markdownFiles(full))
    else if (entry.name.endsWith('.md')) found.push(full)
  }
  return found
}

function lineAt(text, index) {
  return text.slice(0, index).split('\n').length
}

function resolves(file, target) {
  return existsSync(resolve(dirname(file), target)) || existsSync(resolve(repoRoot, target))
}

const linkPattern = /\]\(([^)\s]+)\)/g
const codePattern = /`([^`\n]+)`/g
const looksLikePath = /^[\w.@][\w.@/-]*\.[a-z]{2,4}$/

const failures = []
let checked = 0
let unresolved = 0

for (const file of markdownFiles(repoRoot)) {
  const text = readFileSync(file, 'utf8')
  const shown = relative(file)
  const inDocs = shown.startsWith('docs/')
  const checkPaths = !isHistoricalRecord(file) && !isRestoredSkillCopy(file)

  if (checkPaths) {
    for (const match of text.matchAll(linkPattern)) {
      const target = match[1]
      if (/^(https?:|mailto:)/.test(target) || target.includes('#')) continue
      checked++
      if (!resolves(file, target)) {
        failures.push(`R1 ${shown}:${lineAt(text, match.index)} link does not resolve: ${target}`)
      }
    }

    for (const match of text.matchAll(codePattern)) {
      const candidate = match[1]
      if (!looksLikePath.test(candidate) || candidate.includes('..')) continue
      if (!rootEntries.has(candidate.split('/')[0])) {
        unresolved++
        continue
      }
      checked++
      if (!resolves(file, candidate)) {
        failures.push(`R1 ${shown}:${lineAt(text, match.index)} path does not exist: ${candidate}`)
      }
    }
  }

  if (!inDocs) continue

  for (const match of text.matchAll(/secci[oó]n(?:es)? «/g)) {
    failures.push(`R2 ${shown}:${lineAt(text, match.index)} a section is cited by its title`)
  }
  for (const match of text.matchAll(/\bgit show\b/g)) {
    failures.push(`R3 ${shown}:${lineAt(text, match.index)} a recovery recipe for a retired document`)
  }
}

if (failures.length > 0) {
  console.error(`check-docs: ${failures.length} failure(s)\n`)
  for (const failure of failures) console.error(`  ${failure}`)
  console.error('\nFix the reference or remove it; a fact that matters lives in the tree.')
  process.exit(1)
}

console.log(`check-docs: ok — ${checked} reference(s) resolved in living documentation`)
console.log(`check-docs: ${unresolved} inline path(s) not anchored at the repository root (not checked)`)
console.log('check-docs: out of scope — odd/tasks/ (historical records) and .agents/skills/bootstrap-*/ (restored copies)')
console.log('check-docs: prose that states what another document says is not checked here (one primary home per fact).')
