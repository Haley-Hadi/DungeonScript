import test from "node:test"
import assert from "node:assert"
import compile from "../src/compiler.js"

test("compiles to parsed output", (t) => {
  const source = `NPC "Goblin" {
    stats {
      HP: 12
    }
  }`
  const result = compile(source, "parsed")
  assert.strictEqual(result, "Syntax is ok")
})

test("compiles to analyzed output", (t) => {
  const source = `NPC "Goblin" {
    stats {
      HP: 12
    }
  }`
  const result = compile(source, "analyzed")
  assert.strictEqual(result.declarations[0].name, "Goblin")
  assert.strictEqual(result.declarations[0].fields.HP, 12)
})

test("compiles to optimized output", (t) => {
  const source = `NPC "Goblin" {
    stats {
      HP: 12
    }
  }`
  const result = compile(source, "optimized")
  assert.strictEqual(result.declarations[0].name, "Goblin")
  assert.strictEqual(result.declarations[0].fields.HP, 12)
})
test("compiles a complex program to markdown", (t) => {
  const source = `
    NPC "Hero" {
      stats {
        HP: 30
        STR: 14
        AC: 16
        proficiency: 2
      }
      action "Sword" {
        type: "melee"
        damage: "1d8 + STR"
      }
    }
    
    Location "Castle" {
      safety: 8
      NPC "Guard" {
        stats {
          HP: 20
        }
      }
    }
  `
  const result = compile(source, "js")
  assert(result.includes("# Hero"))
  assert(result.includes("# Castle"))
  assert(result.includes("**Safety Level:** 8"))
})
test("compiles to js output", (t) => {
  const source = `NPC "Goblin" {
    stats {
      HP: 12
      STR: 14
      DEX: 12
      CON: 12
      INT: 10
      WIS: 10
      CHA: 8
      AC: 13
      proficiency: 2
    }
    action "Club" {
      type: "attack"
      damage: "1d4 + STR"
    }
  }`
  const result = compile(source, "js")
  assert(typeof result === "string")
  assert(result.includes("# Goblin"))
  assert(result.includes("HP: 12"))
  assert(result.includes("STR | 14 | +2"))
})

test("throws error for unknown output type", (t) => {
  const source = `NPC "Goblin" {
    stats {
      HP: 12
    }
  }`
  assert.throws(() => compile(source, "unknown"), /Unknown output type/)
})