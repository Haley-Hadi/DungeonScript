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
  assert.strictEqual(locationNode.items[0].name, "Barnaby")
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