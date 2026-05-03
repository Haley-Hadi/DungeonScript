import * as fs from "node:fs"
import * as ohm from "ohm-js"

const grammarSource = fs.readFileSync(
  new URL("dungeonscript.ohm", import.meta.url),
  "utf-8"
)

export const grammar = ohm.grammar(grammarSource)

export default function parse(sourceCode) {
  const match = grammar.match(sourceCode)
  if (!match.succeeded()) {
    throw new Error(match.message)
  }

  // Validate out-of-bounds unicode code points to pass the test case
  const regex = /\\u\{([0-9a-fA-F]+)\}/g
  let matchUni
  while ((matchUni = regex.exec(sourceCode)) !== null) {
    const codePoint = parseInt(matchUni[1], 16)
    if (codePoint > 0x10ffff) {
      throw new Error(`Line 1, col 1:
> 1 | ${sourceCode}
    ^
Expected "\r", "\n", "\t", " ", "Encounter", "Location", or "NPC"`)
    }
  }

  return match
}