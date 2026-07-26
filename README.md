# @codincod/codemirror-lang-lua

Lua language support for [CodeMirror 6](https://codemirror.net/), built on a
[Lezer](https://lezer.codemirror.net/) grammar.

CodeMirror ships Lua as a CodeMirror 5 stream mode. That colours tokens and
stops there: no syntax tree, so no structural folding, no indentation that
knows what a block is, no node-aware selection or completion. This package is
a real grammar, so the editor gets a tree.

```
npm install @codincod/codemirror-lang-lua
```

```js
import {EditorView, basicSetup} from "codemirror"
import {lua} from "@codincod/codemirror-lang-lua"

new EditorView({
  doc: "print('hello')\n",
  extensions: [basicSetup, lua()],
  parent: document.body
})
```

`lua()` returns a `LanguageSupport` with highlighting, folding, indentation and
completion for the standard library. `luaLanguage` is the bare `LRLanguage` if
you want to assemble the extensions yourself, and `parser` is the Lezer parser
if you want the tree without an editor around it.

## What it covers

Lua 5.4, which is a superset of what 5.1 through 5.3 accept, so older code
parses too:

- integer division `//`, the bitwise operators and their precedence levels
- `goto` and `::labels::`
- `local x <const>` and `local f <close>` attributes
- long brackets at any level, `[[...]]` through `[=====[...]=====]`, for both
  strings and comments, including the case where a long string is being typed
  and has no closing bracket yet
- `\z` line continuations and the rest of Lua's escapes
- calls without parentheses, `f"string"` and `f{table}`
- hex floats, `0xA23p-4`

Two deliberate departures from the reference manual, both because this parses
code in an editor rather than compiling it:

**Identifiers may contain characters above U+007F.** Lua's own lexer asks the C
library whether a byte is a letter, so whether `local α = 1` compiles depends on
the locale the interpreter was built against, and code in the wild uses it.
Painting working code as broken is the worse failure.

**A statement is never ended by a newline.** `f\n(x)` is one call, which is what
Lua does. Lua 5.1 called this "ambiguous syntax" and 5.2 dropped the complaint.

Luau's extensions (type annotations, compound assignment, `continue`) are not
supported yet.

## How correct is it

Grammar authors usually have their own test cases and no way to know what they
missed. This one was measured against 1077 real Lua programs, the Lua half of
the [Rosetta Code](https://rosettacode.org/) corpus behind
[CodinCod](https://codincod.com/)'s language-guessing game, by counting the
error nodes the parser leaves behind:

```
files          1070
bytes          836785
clean parses   1044 (97.57%)
error nodes    604
```

All 26 files that did not parse cleanly were read. **None is a gap in the
grammar:**

| | |
| --: | --- |
| 14 | are not Lua at all: C source, HTML output, shell command lines, REPL transcripts and program output, filed under Lua on the wiki |
| 5 | are Lua that genuinely does not compile: a missing `do`, a missing `then`, an unclosed `print(` |
| 4 | are fragments rather than chunks, like a bare `3.14159` or an anonymous function header |
| 3 | were damaged before the parser saw them, by a corpus pipeline that masks the language's own name and decodes HTML entities inside string literals |

The measurement paid for itself on the first run. It found a bug in the corpus
pipeline rather than in the grammar: the comment stripper read `--[==[` as an
ordinary `--` line comment, so a levelled long comment left its body and its
closer behind as code, and one snippet had been reduced to nothing but `]====]`.
Those numbers are from the corpus rebuilt after that was fixed.

Run it against your own Lua:

```
npm run build
node test/corpus.ts path/to/lua/files
```

No corpus ships with this package. Rosetta Code's content is CC BY-SA and
cannot be redistributed under an MIT licence, so the script takes a directory.

## Development

```
npm install
npm test          # builds, then runs the grammar tests in test/*.txt
npm run build     # lezer-generator, then tsc
```

The grammar is `src/lua.grammar`, the external tokenizer that reads long
brackets is `src/tokens.ts`, and the CodeMirror integration is `src/index.ts`.
Tests are in Lezer's own test format: source, `==>`, expected tree.

## Licence

MIT.
