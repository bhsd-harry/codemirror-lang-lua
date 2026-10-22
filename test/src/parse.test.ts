import {parser} from "../../dist/parser.js"
import {fileTests} from "@lezer/generator/test"
import {readdirSync, readFileSync} from "fs"
import {join} from "path"
import {describe, it as test} from "@bhsd/test-util/mocha"

const here = "test/fixtures"

describe("Parser tests", () => {
  for (const file of readdirSync(here).filter(f => f.endsWith(".txt"))) {
    const contents = readFileSync(join(here, file), "utf8")
    // eslint-disable-next-line @typescript-eslint/unbound-method
    for (const {name, run} of fileTests(contents, file)) {
      test(`${file}: ${name}`, () => run(parser))
    }
  }
})
