# @codincod/codemirror-lang-lua [![NPM version](https://img.shields.io/npm/v/@codincod/codemirror-lang-lua.svg)](https://www.npmjs.org/package/@codincod/codemirror-lang-lua)

[ [**CHANGELOG**](https://codeberg.org/reeven/codemirror-lang-lua/src/branch/master/CHANGELOG.md) ]

This package implements Lua language support for the
[CodeMirror](https://codemirror.net/) code editor, using a
[Lezer](https://lezer.codemirror.net/) grammar written for this package.

CodeMirror ships Lua as a CodeMirror 5 stream mode. A stream mode colours
tokens and stops there. Without a tree there is no structural folding, no
indentation that knows what a block is, and no node-aware selection.

This code is released under an
[MIT license](https://codeberg.org/reeven/codemirror-lang-lua/src/branch/master/LICENSE).

## Usage

```javascript
import {EditorView, basicSetup} from "codemirror"
import {lua} from "@codincod/codemirror-lang-lua"

const view = new EditorView({
  parent: document.body,
  doc: `print("Hello World!")`,
  extensions: [basicSetup, lua()]
})
```

## Coverage

Lua 5.4, which accepts everything 5.1 through 5.3 do, so older code parses too.
That includes integer division `//` and the bitwise operators with their own
precedence levels, `goto` and `::labels::`, the `<const>` and `<close>`
attributes, `\z` line continuations, calls written without parentheses as
`f"string"` and `f{table}`, and hex floats like `0xA23p-4`.

Long brackets carry a level. `[[...]]` through `[=====[...]=====]` are read for
both strings and comments, including the half-typed case where the closer is
not there yet.

Two departures from the reference manual, both because this parses code in an
editor instead of compiling it.

Identifiers may hold characters above U+007F. Lua's own lexer asks the C
library whether a byte is a letter, so whether `local α = 1` compiles depends
on the locale the interpreter was built against, and code in the wild uses it.
Painting working code as broken is the worse failure.

A newline never ends a statement, so `f\n(x)` is one call, which is what Lua
does. Lua 5.1 called this ambiguous syntax and 5.2 dropped the complaint.

Luau's extensions, meaning type annotations, compound assignment and
`continue`, are not supported.

## Accuracy

Measured against 1070 Lua programs, the Lua half of the
[Rosetta Code](https://rosettacode.org/) corpus behind
[CodinCod](https://codincod.com/)'s language-guessing game. A file counts as
clean only when the parse leaves no error node anywhere.

```
files          1070
clean parses   1044 (97.57%)
error nodes    604
```

All 26 files that are not clean were read, and none is a gap in the grammar.

| | |
| --: | --- |
| 14 | are not Lua: C source, HTML output, shell command lines, REPL transcripts and program output, filed under Lua on the wiki |
| 5 | are Lua that does not compile: a missing `do`, a missing `then`, an unclosed `print(` |
| 4 | are fragments instead of chunks, like a bare `3.14159` or an anonymous function header |
| 3 | were damaged before the parser saw them, by a corpus pipeline that masks the language's own name and decodes HTML entities inside string literals |

The measurement paid for itself on its first run by finding a bug in that
pipeline instead of in the grammar. The comment stripper read `--[==[` as an
ordinary `--` line comment, so a levelled long comment left its body and its
closer behind as code, and one snippet had been reduced to nothing but
`]====]`. These numbers are from the corpus rebuilt after that was fixed.

`npm run corpus -- path/to/files` runs the measurement over your own directory.
No corpus ships here. Rosetta Code is CC BY-SA and cannot be redistributed
under this licence.

## API Reference

**`lua`**`() → LanguageSupport`

Lua language support, with completion for the standard library.

**`luaLanguage`**`: LRLanguage`

A language provider based on the Lezer Lua parser in this package, extended
with highlighting, folding and indentation information.

**`luaCompletion`**`: CompletionSource`

Autocompletion for Lua's keywords, globals and standard library tables.

**`parser`**`: LRParser`

The raw Lezer parser, for tooling that wants the tree without an editor.
