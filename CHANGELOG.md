# Changelog

## 0.2.0 (2026-07-26)

The package is now published as both ESM and CJS, and its layout follows the
conventions the `@codemirror/lang-*` and `@lezer/*` packages use: the entry
point is `src/lua.ts`, the generated parser sits next to the grammar in `src/`,
and rollup builds `dist/index.js` and `dist/index.cjs`.

No grammar changes. The parser is byte for byte what 0.1.0 shipped.

## 0.1.0 (2026-07-26)

First release.

A Lezer grammar for Lua 5.4. 97.57% of the 1070 Rosetta Code snippets it was
developed against parse with no error node, and all 26 that do not were read:
14 are not Lua, 5 do not compile, 4 are fragments, and 3 were damaged upstream.

Ships `lua()`, `luaLanguage`, `luaCompletion` and the raw `parser`.
