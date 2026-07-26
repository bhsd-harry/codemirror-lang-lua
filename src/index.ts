import {parser} from "./parser.js"
import {
  LRLanguage,
  LanguageSupport,
  indentNodeProp,
  foldNodeProp,
  foldInside,
  delimitedIndent,
  TreeIndentContext
} from "@codemirror/language"
import {SyntaxNode} from "@lezer/common"
import {styleTags, tags as t} from "@lezer/highlight"
import {completeFromList, CompletionSource} from "@codemirror/autocomplete"

// A block indents its body by one unit, and pulls the line that closes it back
// out again. Lua closes four different constructs with `end` and one with
// `until`, and `else` and `elseif` sit at the indentation of their `if`.
const closesBlock = /^\s*(end|else|elseif|until)\b/

function blockIndent(context: TreeIndentContext) {
  const base = context.lineIndent(context.node.from)
  return closesBlock.test(context.textAfter) ? base : base + context.unit
}

function foldBody(node: SyntaxNode) {
  const blocks = node.getChildren("Block")
  if (!blocks.length) return null
  const from = blocks[0].from,
    to = blocks[blocks.length - 1].to
  return from < to ? {from, to} : null
}

const blockStatements =
  "IfStatement WhileStatement RepeatStatement DoStatement " +
  "ForNumericStatement ForGenericStatement " +
  "FunctionDeclaration LocalFunctionDeclaration FunctionExpression"

export const luaLanguage = LRLanguage.define({
  name: "lua",
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        [blockStatements]: blockIndent,
        TableExpression: delimitedIndent({closing: "}"}),
        ArgList: delimitedIndent({closing: ")"}),
        ParamList: delimitedIndent({closing: ")"})
      }),
      foldNodeProp.add({
        [blockStatements]: foldBody,
        TableExpression: foldInside,
        ArgList: foldInside
      }),
      styleTags({
        "function local": t.definitionKeyword,
        "if then else elseif end do while repeat until for in": t.controlKeyword,
        "break goto return": t.controlKeyword,
        "and or not": t.logicOperator,
        nil: t.null,
        "true false": t.bool,
        Number: t.number,
        "String LongString": t.string,
        Comment: t.comment,
        Name: t.variableName,
        VariableDefinition: t.definition(t.variableName),
        PropertyName: t.propertyName,
        MethodName: t.function(t.propertyName),
        LabelName: t.labelName,
        AttributeName: t.modifier,
        "FunctionName/Name": t.function(t.definition(t.variableName)),
        "FunctionName/PropertyName": t.function(t.definition(t.propertyName)),
        "FunctionName/MethodName": t.function(t.definition(t.propertyName)),
        "CallExpression/Name": t.function(t.variableName),
        "CallExpression/MemberExpression/PropertyName": t.function(t.propertyName),
        Vararg: t.keyword,
        ArithOp: t.arithmeticOperator,
        BitOp: t.bitwiseOperator,
        CompareOp: t.compareOperator,
        ConcatOp: t.operator,
        LengthOp: t.operator,
        "=": t.definitionOperator,
        "( )": t.paren,
        "[ ]": t.squareBracket,
        "{ }": t.brace,
        "::": t.punctuation,
        ", ;": t.separator,
        ". :": t.derefOperator
      })
    ]
  }),
  languageData: {
    commentTokens: {line: "--", block: {open: "--[[", close: "]]"}},
    closeBrackets: {brackets: ["(", "[", "{", "'", '"']},
    indentOnInput: /^\s*(end|else|elseif|until|\})$/
  }
})

const keywords =
  "and break do else elseif end false for function goto if in local nil not or repeat return then true until while"
    .split(" ")
    .map(label => ({label, type: "keyword"}))

// The standard library as of 5.4, which is small enough to write down and is
// the half of Lua that nobody remembers the spelling of. Members are offered
// on their table, so `string.` proposes `format` rather than everything.
const globals = [
  "assert", "collectgarbage", "dofile", "error", "getmetatable", "ipairs", "load",
  "loadstring", "next", "pairs", "pcall", "print", "rawequal", "rawget", "rawlen",
  "rawset", "require", "select", "setmetatable", "tonumber", "tostring", "type",
  "unpack", "xpcall", "warn"
].map(label => ({label, type: "function"}))

const libraries = ["string", "table", "math", "io", "os", "coroutine", "utf8", "debug", "package"].map(
  label => ({label, type: "namespace"})
)

const constants = [
  {label: "_G", type: "variable"},
  {label: "_VERSION", type: "variable"},
  {label: "self", type: "variable"}
]

export const luaCompletion: CompletionSource = completeFromList([
  ...keywords,
  ...globals,
  ...libraries,
  ...constants
])

/// Language support for Lua.
export function lua() {
  return new LanguageSupport(luaLanguage, [luaLanguage.data.of({autocomplete: luaCompletion})])
}

export {parser}
