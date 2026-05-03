import test from "node:test"
import assert from "node:assert"
import generate from "../src/generator.js"
import * as core from "../src/core.js"

test("generates markdown for a simple NPC", (t) => {
  const npc = new core.NPC("Goblin", [
    new core.StatBlock([
      { kind: "property", name: "HP", value: 12 },
      { kind: "property", name: "STR", value: 14 },
      { kind: "property", name: "DEX", value: 12 },
      { kind: "property", name: "CON", value: 12 },
      { kind: "property", name: "INT", value: 10 },
      { kind: "property", name: "WIS", value: 10 },
      { kind: "property", name: "CHA", value: 8 },
      { kind: "property", name: "AC", value: 13 },
      { kind: "property", name: "proficiency", value: "invalid" }
    ]),
    new core.Action("Club", [
      { kind: "property", name: "type", value: "attack" },
      { kind: "property", name: "damage", value: "1d4 + STR + PROF" }
    ]),
    new core.Action("Special Ability", [
      { kind: "property", name: "type", value: "ability" }
      // no damage
    ])
  ])

  const program = new core.Program([npc])
  const result = generate(program)

  assert(result.includes("# Goblin"))
  assert(result.includes("HP: 12"))
  assert(result.includes("AC: 13"))
  assert(result.includes("STR | 14 | +2"))
  assert(result.includes("### Club"))
  assert(result.includes("1d4 + +2 + 0"))
})

test("generates markdown for a location", (t) => {
  const location = new core.Location("TheRustyAnchor", [
    { kind: "property", name: "safety", value: 10 },
    new core.NPC("Barnaby", [])
  ])

  const program = new core.Program([location])
  const result = generate(program)

  assert(result.includes("# TheRustyAnchor"))
  assert(result.includes("**Safety Level:** 10"))
  assert(result.includes("- 🛡️ **Barnaby** (NPC)"))
})

test("generates markdown for a location with an encounter", (t) => {
  const location = new core.Location("Dungeon", [
    new core.Encounter("MainEncounter", [
      new core.NPC("Goblin", [
        new core.StatBlock([
          { kind: "property", name: "HP", value: 8 }
        ])
      ])
    ])
  ])

  const program = new core.Program([location])
  const result = generate(program)

  assert(result.includes("# Dungeon"))
  assert(result.includes("- ⚔️ **MainEncounter** (Encounter)"))
})

test("formats signed modifiers and PROF in action damage strings", (t) => {
  const npc = new core.NPC("Goblin", [
    new core.StatBlock([
      { kind: "property", name: "HP", value: 12 },
      { kind: "property", name: "STR", value: 14 },
      { kind: "property", name: "AC", value: 13 },
      { kind: "property", name: "proficiency", value: 3 }
    ]),
    new core.Action("Smash", [
      { kind: "property", name: "type", value: "attack" },
      { kind: "property", name: "damage", value: "1d6 + STR + PROF" }
    ])
  ])

  const program = new core.Program([npc])
  const result = generate(program)

  assert(result.includes("STR | 14 | +2"))
  assert(result.includes("+3"))
})

test("generates empty markdown for empty program", (t) => {
  const program = new core.Program([])
  const result = generate(program)
  assert.strictEqual(result, "")
})