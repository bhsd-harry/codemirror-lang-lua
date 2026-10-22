// The grammar tests prove the tree is right. These prove the things a tree is
// for: that the highlighter attaches tags to it, and that the indenter can
// work out where a block body sits. A styleTags entry naming a node that does
// not exist is the classic silent failure here, so it is worth a test that
// looks at the classes rather than at the tree.

import {describe, it as test} from "@bhsd/test-util/mocha"
import assert from "node:assert"
import {lua, luaLanguage} from "../../dist/index.js"
import {highlightTree, tagHighlighter, tags as t} from "@lezer/highlight"
import {EditorState} from "@codemirror/state"
import {getIndentation} from "@codemirror/language"

// The shipped `classHighlighter` collapses tags to a small vocabulary; it has
// no class at all for a called name, so testing against it would only measure
// what it knows. This names the tags this package claims to emit, so a rule
// that silently stops matching fails a test.
const probe = tagHighlighter([
  {tag: t.keyword, class: "keyword"},
  {tag: t.definitionKeyword, class: "definitionKeyword"},
  {tag: t.controlKeyword, class: "controlKeyword"},
  {tag: t.logicOperator, class: "logicOperator"},
  {tag: t.arithmeticOperator, class: "arithmeticOperator"},
  {tag: t.bitwiseOperator, class: "bitwiseOperator"},
  {tag: t.compareOperator, class: "compareOperator"},
  {tag: t.definitionOperator, class: "definitionOperator"},
  {tag: t.derefOperator, class: "derefOperator"},
  {tag: t.operator, class: "operator"},
  {tag: t.paren, class: "paren"},
  {tag: t.squareBracket, class: "squareBracket"},
  {tag: t.brace, class: "brace"},
  {tag: t.punctuation, class: "punctuation"},
  {tag: t.separator, class: "separator"},
  {tag: t.string, class: "string"},
  {tag: t.number, class: "number"},
  {tag: t.comment, class: "comment"},
  {tag: t.null, class: "null"},
  {tag: t.bool, class: "bool"},
  {tag: t.function(t.definition(t.variableName)), class: "functionDefinition"},
  {tag: t.function(t.definition(t.propertyName)), class: "methodDefinition"},
  {tag: t.function(t.variableName), class: "functionCall"},
  {tag: t.definition(t.variableName), class: "definition"},
  {tag: t.variableName, class: "variableName"},
  {tag: t.function(t.propertyName), class: "method"},
  {tag: t.propertyName, class: "propertyName"},
  {tag: t.modifier, class: "modifier"},
  {tag: t.labelName, class: "labelName"}
])

function classesFor(code: string) {
  const tree = luaLanguage.parser.parse(code)
  const found: Array<[string, string]> = []
  highlightTree(tree, probe, (from, to, classes) => {
    found.push([code.slice(from, to), classes])
  })
  return found
}

function has(code: string, text: string, cls: string) {
  const found = classesFor(code)
  const hit = found.find(([slice]) => slice === text)
  assert.ok(hit, `nothing highlighted for ${JSON.stringify(text)} in ${JSON.stringify(code)}`)
  assert.ok(
    hit![1].split(" ").includes(cls),
    `${JSON.stringify(text)} got ${hit![1]}, expected to include ${cls}`
  )
}

describe("Syntax highlight tests", () => {
  test("keywords, strings, numbers and comments carry tags", () => {
    has("local x = 1", "local", "definitionKeyword")
    has("local x = 1", "x", "definition")
    has('s = "hi"', '"hi"', "string")
    has("n = 42", "42", "number")
    has("-- note", "-- note", "comment")
    has("if a then end", "if", "controlKeyword")
    has("if a then end", "then", "controlKeyword")
    has("if a then end", "end", "controlKeyword")
    has("while a do break end", "while", "controlKeyword")
    has("while a do break end", "do", "controlKeyword")
    has("while a do break end", "break", "controlKeyword")
    has("repeat a until b", "repeat", "controlKeyword")
    has("repeat a until b", "until", "controlKeyword")
    has("for v in iter do return end", "for", "controlKeyword")
    has("for v in iter do return end", "in", "controlKeyword")
    has("for v in iter do return end", "return", "controlKeyword")
    has("goto label", "goto", "controlKeyword")
    has("x = a and b", "=", "definitionOperator")
    has("x = a and b", "and", "logicOperator")
    has("x = not a", "not", "logicOperator")
    has("x = a + b", "+", "arithmeticOperator")
    has("x = a & b", "&", "bitwiseOperator")
    has("x = a == b", "==", "compareOperator")
    has("x = a .. b", "..", "operator")
    has("x = #t", "#", "operator")
    has("x = nil", "nil", "null")
    has("x = true", "true", "bool")
    has("local x <const> = 1", "const", "modifier")
    has("::top::", "::", "punctuation")
    has("::top::", "top", "labelName")
    has("function f(...) end", "(", "paren")
    has("function f(...) end", "...", "keyword")
    has("x = [a, b]", "[", "squareBracket")
    has("x = [a, b]", ",", "separator")
    has("x = {a; b}", "{", "brace")
    has("x = {a; b}", ";", "separator")
  })

  test("a called name is highlighted as a function, a plain one is not", () => {
    has("print(1)", "print", "functionCall")
    has("x = value", "value", "variableName")
    has("function greet() end", "function", "definitionKeyword")
    has("function greet() end", "greet", "functionDefinition")
    has("function t.greet() end", ".", "derefOperator")
    has("function t.greet() end", "greet", "methodDefinition")
    has("function t:greet() end", ":", "derefOperator")
    has("function t:greet() end", "greet", "methodDefinition")
    has("t.f(1)", "f", "method")
    has("x = t.field", "field", "propertyName")
  })

  test("a long string is a string, not a bracket", () => {
    has("s = [[text]]", "[[text]]", "string")
    has("--[[ note ]]", "--[[ note ]]", "comment")
  })
})

function indentAt(code: string, pos: number) {
  const state = EditorState.create({doc: code, extensions: [lua()]})
  return getIndentation(state, pos)
}

describe("Indentation tests", () => {
  test("a block body indents by one unit", () => {
    const code = "if a then\n\nend"
    assert.equal(indentAt(code, 10), 2)
  })

  test("the line that closes a block comes back out", () => {
    const code = "if a then\n  f()\nend"
    assert.equal(indentAt(code, 16), 0)
  })

  test("else and elseif sit with their if", () => {
    const code = "if a then\n  f()\nelse\n  g()\nend"
    assert.equal(indentAt(code, 16), 0)
  })

  test("a function body indents, and until closes a repeat", () => {
    assert.equal(indentAt("function f()\n\nend", 13), 2)
    assert.equal(indentAt("repeat\n  f()\nuntil x", 13), 0)
  })

  test("a table constructor indents to its brace", () => {
    const code = "t = {\n\n}"
    assert.equal(indentAt(code, 6), 2)
  })

  test("an argument list indents to its parenthesis", () => {
    const code = "f(\n\n)"
    assert.equal(indentAt(code, 3), 2)
  })

  test("an argument list indents to its parenthesis", () => {
    const code = "f(\n\n)"
    assert.equal(indentAt(code, 3), 2)
  })

  test("a parameter list indents to its parenthesis", () => {
    const code = "function f(\n\n)"
    assert.equal(indentAt(code, 12), 2)
  })
})
