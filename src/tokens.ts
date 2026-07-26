import {ExternalTokenizer, InputStream} from "@lezer/lr"
import {LongString, Comment} from "./parser.terms.js"

const dash = 45, bracketL = 91, bracketR = 93, eq = 61, newline = 10, hash = 35, bang = 33

// A long bracket is `[`, then any number of `=`, then `[`. Returns how many
// `=` it carries, which is the level the closing bracket has to match, or -1
// when what starts here is an ordinary `[`.
function openingLevel(input: InputStream, offset: number): number {
  if (input.peek(offset) != bracketL) return -1
  let level = 0
  while (input.peek(offset + 1 + level) == eq) level++
  return input.peek(offset + 1 + level) == bracketL ? level : -1
}

// Consumes the opening bracket and everything up to and including the matching
// close. An unterminated one runs to the end of the file on purpose: half a
// long string is what every one of them looks like while it is being typed,
// and an editor should colour it as a string rather than as the rest of the
// program.
function consumeLong(input: InputStream, opening: number, level: number) {
  for (let i = 0; i < opening; i++) input.advance()
  for (;;) {
    if (input.next < 0) return
    if (input.next == bracketR) {
      let seen = 0
      while (input.peek(1 + seen) == eq) seen++
      if (seen == level && input.peek(1 + seen) == bracketR) {
        for (let i = 0; i < level + 2; i++) input.advance()
        return
      }
    }
    input.advance()
  }
}

function consumeLine(input: InputStream) {
  while (input.next != newline && input.next >= 0) input.advance()
}

export const longTokens = new ExternalTokenizer((input: InputStream) => {
  // `#!/usr/bin/lua`. The standalone interpreter drops a first line starting
  // with `#`, and Rosetta Code is full of scripts that rely on it.
  if (input.next == hash && input.pos == 0 && input.peek(1) == bang) {
    consumeLine(input)
    input.acceptToken(Comment)
    return
  }

  if (input.next == dash && input.peek(1) == dash) {
    let level = openingLevel(input, 2)
    if (level < 0) consumeLine(input)
    else consumeLong(input, 2 + level + 2, level)
    input.acceptToken(Comment)
    return
  }

  let level = openingLevel(input, 0)
  if (level >= 0) {
    consumeLong(input, level + 2, level)
    input.acceptToken(LongString)
  }
})
