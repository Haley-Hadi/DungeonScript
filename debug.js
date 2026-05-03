import parse from "./src/parser.js"
import analyze from "./src/analyzer.js"

const source = `NPC "Goblin" {
  stats {
    HP: 12
  }
}`
console.log("Source:", source)
const match = parse(source)
console.log("Match:", match)
if (match) {
  const analyzed = analyze(match)
  console.log("Analyzed:", JSON.stringify(analyzed, null, 2))
} else {
  console.log("Parse failed")
}