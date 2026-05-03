import * as fs from "node:fs/promises"
import stringify from "graph-stringify"
import compile from "./compiler.js"

const help = `DungeonScript compiler
Syntax: dungeonscript <filename> <outputType>
Prints to stdout according to <outputType>, which must be one of:
  parsed    a message that the program was matched ok by the grammar
  analyzed  the statically analyzed representation
  optimized the optimized semantically analyzed representation
  js        the translation to JavaScript
  md        generates Obsidian-ready markdown`

async function compileFromFile(filename, outputType) {
  try {
    const buffer = await fs.readFile(filename)
    const sourceCode = buffer.toString()
    const compiled = compile(sourceCode, outputType)

    if (typeof compiled === "string") {
      console.log(compiled)
    } else {
      console.log(stringify(compiled, "kind") || compiled)
    }
  } catch (e) {
    console.error(`\u001b[31m${e.message}\u001b[39m`)
    process.exitCode = 1
  }
}

if (process.argv.length === 4) {
  await compileFromFile(process.argv[2], process.argv[3])
} else {
  console.log(help)
  process.exitCode = 2
}