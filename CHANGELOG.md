# Changelog

## 0.2.2 (2026-08-06)

The repository link, which npm renders as a link and a browser cannot follow
with `git+` in front of it.

## 0.2.1 (2026-07-29)

A line in the README saying what this was written for, and a link to the
platform it was written for. Nothing in the code changed.

## 0.2.0 (2026-07-26)

### Bug fixes

The type declaration no longer imports a module it does not ship. 0.1.0's
`dist/index.d.ts` opened with `import {parser} from "./parser.js"`, and no
`parser.d.ts` sat beside it, so any consumer without `skipLibCheck` got
`TS7016: Could not find a declaration file for module './parser.js'`. The
declaration is self-contained now.

### New features

The package is published as CommonJS as well as ESM. `require()` against 0.1.0
failed with `ERR_PACKAGE_PATH_NOT_EXPORTED`.

Doc comments reach the declaration file, so editors show them on hover.

### Breaking changes

`@codincod/codemirror-lang-lua/package.json` is no longer an exported subpath.
The `@codemirror/lang-*` packages do not export it either.

### Other

The layout follows the conventions the `@codemirror/lang-*` and `@lezer/*`
packages share: `src/lua.ts` is the entry point, the generated parser sits next
to the grammar in `src/`, and the build is `@codemirror/buildhelper`.

No grammar changes. The parser is byte for byte what 0.1.0 shipped, and the
corpus figure is still 97.57% of 1070 snippets.

## 0.1.0 (2026-07-26)

First release.

A Lezer grammar for Lua 5.4. 97.57% of the 1070 Rosetta Code snippets it was
developed against parse with no error node, and all 26 that do not were read:
14 are not Lua, 5 do not compile, 4 are fragments, and 3 were damaged upstream.

Ships `lua()`, `luaLanguage`, `luaCompletion` and the raw `parser`.
