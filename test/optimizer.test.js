import test from "node:test"
import assert from "node:assert"
import * as core from "../src/core.js"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import optimize from "../src/optimizer.js"

test("optimizes duplicate stat properties in NPCs", (t) => {
  const source = `NPC "Goblin" {
    stats {
      HP: 10
      STR: 12
      STR: 14
      HP: 12
    }
  }`

  const analyzed = analyze(parse(source))
  const optimized = optimize(analyzed)
  const goblin = optimized.declarations[0]

  assert.strictEqual(goblin.fields.HP, 12)
  assert.strictEqual(goblin.fields.STR, 14)
  assert.strictEqual(optimized.declarations.length, 1)
})

test("drops empty stat blocks and empty saving throw blocks", (t) => {
  const source = `NPC "Skeleton" {
    stats {
    }
    saving_throws {
    }
  }`

  const analyzed = analyze(parse(source))
  const optimized = optimize(analyzed)
  const skeleton = optimized.declarations[0]

  assert.ok(skeleton.items.every(item => item.kind !== "StatBlock" && item.kind !== "SavingThrowBlock"))
})

test("optimizes nested locations and encounters", (t) => {
  const source = `Location "Dungeon" {
    Encounter "MainEncounter" {
      NPC "Goblin" {
        stats {
          HP: 8
          STR: 10
        }
      }
    }
  }`

  const analyzed = analyze(parse(source))
  const optimized = optimize(analyzed)
  const location = optimized.declarations[0]

  assert.strictEqual(location.kind, "Location")
  assert.strictEqual(location.items[0].kind, "Encounter")
  assert.strictEqual(location.items[0].items[0].kind, "NPC")
})

test("optimizes programs with print statements", (t) => {
  const source = `print("Hello"); NPC "Test" { stats { HP: 10 } }`

  const analyzed = analyze(parse(source))
  const optimized = optimize(analyzed)

  assert.strictEqual(optimized.declarations.length, 2)
  assert.strictEqual(optimized.declarations[0].kind, undefined) // PrintStmt has no kind
  assert.strictEqual(optimized.declarations[1].kind, "NPC")
})

test("optimizes a complex program with multiple optimizations", (t) => {
  const source = `
    NPC "Goblin" {
      stats {
        HP: 10
        HP: 12
        STR: 14
        STR: 16
      }
      saving_throws {
      }
      action "Attack" {
        type: "melee"
      }
    }
    
    Location "Dungeon" {
      safety: 5
      safety: 7
      NPC "Orc" {
        stats {
          HP: 20
        }
      }
    }
  `

  const analyzed = analyze(parse(source))
  const optimized = optimize(analyzed)

  const goblin = optimized.declarations[0]
  const dungeon = optimized.declarations[1]

  assert.strictEqual(goblin.fields.HP, 12)
  assert.strictEqual(goblin.fields.STR, 16)
  assert.strictEqual(dungeon.properties.safety, 7)
  assert.strictEqual(dungeon.items.length, 2) // property and NPC
})

test("optimizer.js branch coverage: unknown nodes and non-objects", (t) => {
  const mysteryNode = { kind: "UnknownType", data: "secret" }
  const program = new core.Program([mysteryNode])
  const optimized = optimize(program)
  
  assert.deepStrictEqual(optimized.declarations[0], mysteryNode)

  const npc = new core.NPC("Mixed", ["just a string", { kind: "property", name: "HP", value: 10 }])
  const optimizedNpc = optimize(new core.Program([npc])).declarations[0]
  assert.strictEqual(optimizedNpc.items[0], "just a string")
})