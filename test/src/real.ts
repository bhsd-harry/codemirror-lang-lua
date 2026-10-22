import * as fs from "fs"
import * as path from "path"
import {yellow, red, refreshStdout} from "@bhsd/nodejs"
import {execute} from "@bhsd/test-util"
import {parser} from "../../dist/parser.js"

parser.configure({strict: true})

const failed: string[] = []

const singleScript = (content: string, title: string): void => {
  try {
    parser.parse(content)
  } catch {
    failed.push(title)
  }
}

(async () => {
  console.log("开始检查本地文件：")
  let i = 0
  for (const f of fs.globSync("../**/*.lua", {exclude: ["../node_modules/**"]})) {
    const file = path.relative("..", f)
    refreshStdout(`${++i} ${file}`)
    try {
      singleScript(fs.readFileSync(f, "utf8"), file)
    } catch (e) {
      console.error(red(`\n解析 ${file} 文件时出错！`))
      console.error(e)
    }
  }
  console.log()

  await execute(singleScript, {grcnamespace: "828", contentmodel: "Scribunto"})

  if (failed.length > 0) {
    console.warn(yellow("Failed to fully parse the following files:"))
    console.warn(failed)
  }
})()
