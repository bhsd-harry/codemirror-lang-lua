// Parses a directory of .lua files and counts the error nodes the grammar
// leaves behind. This is the measurement that decides whether the grammar is
// finished, and it is the one thing about this package that is hard to copy:
// a grammar author usually has their own test cases and nothing else.
//
//   node test/corpus.ts path/to/lua/files
//
// No corpus ships with the package. Ours is 1077 snippets from Rosetta Code,
// which are CC BY-SA and cannot be redistributed under this package's licence,
// so point the script at your own directory of Lua.

import {parser} from "../dist/index.js"
import {readdirSync, readFileSync, statSync} from "fs"
import {join} from "path"

const root = process.argv[2]
if (!root) {
  console.error("usage: node test/corpus.ts <directory of .lua files>")
  process.exit(1)
}

function luaFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(entry => {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) return luaFiles(path)
    return entry.endsWith(".lua") ? [path] : []
  })
}

interface Failure {
  file: string
  errors: number
  bytes: number
  first: string
}

const files = luaFiles(root)
const failures: Failure[] = []
let totalErrors = 0,
  totalBytes = 0,
  clean = 0

for (const file of files) {
  const source = readFileSync(file, "utf8")
  totalBytes += source.length
  const tree = parser.parse(source)
  let errors = 0,
    firstAt = -1
  tree.iterate({
    enter(node) {
      if (node.type.isError) {
        errors++
        if (firstAt < 0) firstAt = node.from
      }
    }
  })
  totalErrors += errors
  if (!errors) {
    clean++
  } else {
    const lineStart = source.lastIndexOf("\n", firstAt) + 1
    let lineEnd = source.indexOf("\n", firstAt)
    if (lineEnd < 0) lineEnd = source.length
    const line = source.slice(0, firstAt).split("\n").length
    failures.push({
      file,
      errors,
      bytes: source.length,
      first: `${line}: ${source.slice(lineStart, lineEnd).trim().slice(0, 90)}`
    })
  }
}

failures.sort((a, b) => b.errors - a.errors)

const pct = (n: number, of: number) => ((n / of) * 100).toFixed(2) + "%"

console.log(`files          ${files.length}`)
console.log(`bytes          ${totalBytes}`)
console.log(`clean parses   ${clean} (${pct(clean, files.length)})`)
console.log(`with errors    ${failures.length}`)
console.log(`error nodes    ${totalErrors}`)
console.log(`errors / 1kB   ${((totalErrors / totalBytes) * 1000).toFixed(3)}`)

if (failures.length) {
  console.log(`\nworst files, and the line the first error sits on:`)
  for (const f of failures.slice(0, 25)) {
    console.log(`  ${String(f.errors).padStart(4)}  ${f.file.split("/").pop()}  ${f.first}`)
  }
}
