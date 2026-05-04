import test from "node:test"
import assert from "node:assert"
import * as core from "../src/core.js"
import { convertMonsterToAST, default as generateDS } from "../src/ds-generator.js"

const goblinJson = {
  "name": "Goblin",
  "ac": [{ "ac": 15 }],
  "hp": { "average": 7 },
  "speed": { "walk": 30 },
  "str": 8,
  "dex": 14,
  "languages": ["Common", "Goblin"],
  "trait": [{
    "name": "Nimble Escape",
    "entries": ["The goblin can take the {@action Disengage} or {@action Hide} action as a bonus action on each of its turns."]
  }],
  "action": [{
    "name": "Scimitar",
    "entries": ["Slashing damage."]
  }]
}

test("convertMonsterToAST correctly maps nested JSON structures", (t) => {
  const ast = convertMonsterToAST(goblinJson)

  // Test HP object flattening
  const hpProperty = ast.items.find(i => i.name === "HP")
  assert.strictEqual(hpProperty.value, 7)

  // Test AC array flattening
  const acProperty = ast.items.find(i => i.name === "AC")
  assert.deepEqual(acProperty.value, { ac: 15 })

  // Test StatBlock grouping
  const statBlock = ast.items.find(i => i.kind === "StatBlock")
  assert.strictEqual(statBlock.items.length, 2) // STR and DEX
})

test("generateDS produces valid DungeonScript syntax", (t) => {
  const ast = convertMonsterToAST(goblinJson)
  const dsOutput = generateDS(ast)

  // Verify NPC structure
  assert.ok(dsOutput.includes('NPC "Goblin" {'))
  
  // Verify stats block
  assert.ok(dsOutput.includes('stats {'))
  assert.ok(dsOutput.includes('STR: 8'))
  
  // Verify action formatting
  assert.ok(dsOutput.includes('action "Scimitar" {'))
  assert.ok(dsOutput.includes('description: "Slashing damage."'))

  // Verify language array join
  assert.ok(dsOutput.includes('languages: "Common, Goblin"'))
})

test("convertMonsterToAST handles missing optional fields", (t) => {
  const minimalMonster = { name: "Slime", hp: 10 }
  const ast = convertMonsterToAST(minimalMonster)
  
  assert.strictEqual(ast.name, "Slime")
  assert.strictEqual(ast.items.length, 1) // Only HP
  assert.strictEqual(ast.items[0].name, "HP")
})

test("ds-generator: branch coverage for speed, languages, and node types", (t) => {
  const monster = { 
    name: "Simpleton", 
    speed: "20 ft.", 
    languages: "None" 
  }
  const ast = convertMonsterToAST(monster)
  const ds = generateDS(ast)
  
  assert.ok(ds.includes('speed: "20 ft."'))
  assert.ok(ds.includes('languages: "None"'))

  const loc = new core.Location("The Void", [])
  assert.ok(generateDS(loc).includes('Location "The Void"'))

  const enc = new core.Encounter("Ambush", [])
  enc.kind = "Encounter" 
  assert.ok(generateDS(enc).includes('Encounter "Ambush"'))

  const prn = new core.PrintStmt('"System Log"')
  prn.kind = "PrintStmt"
  assert.ok(generateDS(prn).includes('print("System Log")'))
})

test("ds-generator: specific coverage for fallback branches", (t) => {
  const simpleMonster = { 
    name: "Slime", 
    speed: "20ft (swim)" 
  }
  const ast = convertMonsterToAST(simpleMonster)
  const dsFromMonster = generateDS(ast)
  assert.ok(dsFromMonster.includes('speed: "20ft (swim)"'))

  const encounterNode = new core.Encounter("Ambush", [])
  encounterNode.kind = "Encounter"
  const dsEncounter = generateDS(encounterNode)
  assert.ok(dsEncounter.includes('Encounter "Ambush"'))

  const printNode = new core.PrintStmt('"System Alert"')
  printNode.kind = "PrintStmt"
  const dsPrint = generateDS(printNode)
  assert.strictEqual(dsPrint.trim(), 'print("System Alert")')
})

test("ds-generator: line 69 coverage (Program with multiple declarations)", (t) => {
  const program = new core.Program([
    new core.PrintStmt('"First"'),
    new core.PrintStmt('"Second"')
  ])
  program.kind = "Program"
  program.declarations[0].kind = "PrintStmt"
  program.declarations[1].kind = "PrintStmt"

  const result = generateDS(program)
  
  assert.strictEqual(result, 'print("First")\n\nprint("Second")')
})

test("ds-generator: line 79 coverage (Encounter node)", (t) => {
  const enc = new core.Encounter("Ambush", [])
  enc.kind = "Encounter"
  
  const result = generateDS(enc)
  assert.ok(result.includes('Encounter "Ambush" {'))
})

test("ds-generator: line 88 coverage (Final fallback)", (t) => {
  const unknownNode = { kind: "UnknownType" }
  const result = generateDS(unknownNode)
  
  assert.strictEqual(result, "")
})

test("ds-generator: line 79 coverage (SavingThrowBlock)", (t) => {
  const stItems = [
    { kind: "property", name: "STR", value: 5 },
    { kind: "property", name: "DEX", value: 2 }
  ]
  const stBlock = new core.SavingThrowBlock(stItems)
  
  const result = generateDS(stBlock)
  
  assert.ok(result.includes("savingThrows {"))
  assert.ok(result.includes("STR: 5"))
  assert.ok(result.includes("DEX: 2"))
})

test("ds-generator: line 79 coverage with indentation", (t) => {
  const stBlock = new core.SavingThrowBlock([])
  
  const result = generateDS(stBlock, "  ")
  
  assert.strictEqual(result, '  savingThrows {\n\n  }')
})


test("ds-generator: branch coverage for lines 10-13, 24, 31, 41, 58, 92", (t) => {
  const monsterJson = {
    name: "Elite Guard",
    str: 10, dex: 10, con: 12, int: 14, wis: 11, cha: 13,
    ac: [18],
    speed: { walk: 30 },
    trait: [{
      name: "Brave",
      entries: "The guard has advantage on saving throws."
    }],
    action: [{
      name: "Longsword",
      entries: "Slashing damage."
    }]
  }

  const ast = convertMonsterToAST(monsterJson)
  const ds = generateDS(ast)

  assert.ok(ds.includes("CON: 12"))
  assert.ok(ds.includes("INT: 14"))
  assert.ok(ds.includes('AC: 18'))
  assert.ok(ds.includes('description: "Slashing damage."'))

  const emptyNPC = { kind: "NPC", name: "Ghost", items: null }
  const emptyResult = generateDS(emptyNPC)
  assert.ok(emptyResult.includes('NPC "Ghost" {\n\n}'))
})