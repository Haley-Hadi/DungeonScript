import test from "node:test"
import assert from "node:assert"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"

test("analyzes a simple NPC with stats", (t) => {
  const source = `NPC "Goblin" {
    stats {
      HP: 12
    }
  }`
  const match = parse(source)
  const analyzed = analyze(match)
  assert.strictEqual(analyzed.declarations[0].name, "Goblin")
  assert.strictEqual(analyzed.declarations[0]?.fields?.HP, 12);
})

test("analyzes a location with properties and nested entities", (t) => {
  const source = `Location "TheRustyAnchor" {
    safety: 10
    NPC "Barnaby" {
      stats {
        HP: 20
      }
    }
  }`
  const match = parse(source)
  const analyzed = analyze(match)
  
  const locationNode = analyzed.declarations[0]
  assert.strictEqual(locationNode.name, "TheRustyAnchor")
  assert.strictEqual(locationNode.properties.safety, 10)
  assert.strictEqual(locationNode.items[1].name, "Barnaby")
})

test("throws an error for an NPC with HP less than or equal to 0", (t) => {
  const source = `NPC "Undead" {
    stats {
      HP: 0
    }
  }`
  const match = parse(source)
  assert.throws(
    () => analyze(match),
    /Error: Undead must have an HP value greater than 0/
  )
})

test("analyzes nested encounters", (t) => {
  const source = `Location "Dungeon" {
    Encounter "MainEncounter" {
      NPC "Goblin" {
        stats {
          HP: 10
        }
      }
    }
  }`
  const match = parse(source)
  const analyzed = analyze(match)
  
  assert.strictEqual(analyzed.declarations[0].name, "Dungeon")
  const encounter = analyzed.declarations[0].items[0]
  assert.strictEqual(encounter.name, "MainEncounter")
})

test("analyzes print statements", (t) => {
  const source = `print("Welcome to the dungeon.");`
  const match = parse(source)
  const analyzed = analyze(match)

  assert.strictEqual(analyzed.declarations[0].argument, '"Welcome to the dungeon."')
})

test("analyzes a complex NPC with all blocks", (t) => {
  const source = `NPC "Orc Warrior" {
    stats {
      HP: 25
      STR: 16
      DEX: 12
      CON: 14
      INT: 8
      WIS: 10
      CHA: 8
      AC: 15
      proficiency: 2
    }
    saving_throws {
      STR: 5
      CON: 4
    }
    action "Greataxe" {
      type: "melee"
      damage: "1d12 + STR"
    }
    action "Javelin" {
      type: "ranged"
      damage: "1d6 + STR"
    }
  }`
  const match = parse(source)
  const analyzed = analyze(match)
  const orc = analyzed.declarations[0]

  assert.strictEqual(orc.name, "Orc Warrior")
  assert.strictEqual(orc.fields.HP, 25)
  assert.strictEqual(orc.fields.STR, 16)
  assert.strictEqual(orc.fields.AC, 15)
  assert.strictEqual(orc.savingThrows.STR, 5);
  assert.strictEqual(orc.fields.proficiency, 2)
  assert.strictEqual(orc.actions.length, 2)
  assert.strictEqual(orc.actions[0].name, "Greataxe")
  assert.strictEqual(orc.actions[0].properties.type, "melee")
})

// test("analyzer.js branch coverage: cleanString without quotes", (t) => {
//   const source = `NPC UnquotedName { stats { HP: 10 } }` 
//   const match = parse(source)
//   const analyzed = analyze(match)
//   assert.strictEqual(analyzed.declarations[0].name, "UnquotedName")
// })

test("analyzer.js branch coverage: terminal fallback", (t) => {
  const match = parse(`print("Hi");`)
  const analyzed = analyze(match)
  assert.strictEqual(analyzed.declarations[0].argument, '"Hi"')
})