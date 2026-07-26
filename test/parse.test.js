import { parser } from "../dist/index.js";
import { fileTests } from "@lezer/generator/test";
import { readdirSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { test } from "node:test";
const here = dirname(fileURLToPath(import.meta.url));
for (const file of readdirSync(here).filter(f => f.endsWith(".txt"))) {
    const contents = readFileSync(join(here, file), "utf8");
    for (const { name, run } of fileTests(contents, file)) {
        test(`${file}: ${name}`, () => run(parser));
    }
}
