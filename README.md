# @bhsd/codemirror-lang-lua

[![NPM version](https://badge.fury.io/js/@bhsd%2Fcodemirror-lang-lua.svg)](https://www.npmjs.org/package/@bhsd/codemirror-lang-lua)
[![CodeQL](https://github.com/bhsd-harry/codemirror-lang-lua/actions/workflows/codeql.yml/badge.svg)](https://github.com/bhsd-harry/codemirror-lang-lua/actions/workflows/codeql.yml)

This is a fork of [@codincod/codemirror-lang-lua](https://codeberg.org/reeven/codemirror-lang-lua).

This package implements Lua language support for the
[CodeMirror](https://codemirror.net/) code editor, using a
[Lezer](https://lezer.codemirror.net/) grammar written for this package.

CodeMirror ships Lua as a CodeMirror 5 stream mode. A stream mode colours
tokens and stops there. Without a tree there is no structural folding, no
indentation that knows what a block is, and no node-aware selection.

Written in part for [CodinCod](https://codincod.com/), a competitive coding
platform, where it colours the editor people solve puzzles in.

This code is released under an
[MIT license](https://codeberg.org/reeven/codemirror-lang-lua/src/branch/master/LICENSE).

## Usage

```javascript
import {EditorView, basicSetup} from "codemirror"
import {lua} from "@bhsd/codemirror-lang-lua"

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

One departure from the reference manual because this parses code in an
editor instead of compiling it.

A newline never ends a statement, so `f\n(x)` is one call, which is what Lua
does. Lua 5.1 called this ambiguous syntax and 5.2 dropped the complaint.

Luau's extensions, meaning type annotations, compound assignment and
`continue`, are not supported.

## API Reference

**`lua`**`() → LanguageSupport`

Lua language support, with completion for the standard library.

**`luaLanguage`**`: LRLanguage`

A language provider based on the Lezer Lua parser in this package, extended
with highlighting, folding and indentation information.

**`luaCompletion`**`: CompletionSource`

Autocompletion for Lua's keywords, globals and standard library tables.
