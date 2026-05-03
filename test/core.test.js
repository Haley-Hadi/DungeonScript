import test from "node:test"
import assert from "node:assert"
import * as core from "../src/core.js"

test("NPC constructor and getters", (t) => {
  const npc = new core.NPC("TestNPC", [
    new core.StatBlock([
      { kind: "property", name: "HP", value: 15 },
      { kind: "property", name: "STR", value: 13 },
      { kind: "property", name: "proficiency", value: 2 }
    ]),
    new core.Action("TestAction", [
      { kind: "property", name: "damage", value: "1d6" }
    ])
  ])

  assert.strictEqual(npc.name, "TestNPC")
  assert.strictEqual(npc.kind, "NPC")
  assert.strictEqual(npc.fields.HP, 15)
  assert.strictEqual(npc.fields.STR, 13)
  assert.strictEqual(npc.stats.HP, 15)
  assert.strictEqual(npc.actions.length, 1)
  assert.strictEqual(npc.actions[0].name, "TestAction")
  assert.strictEqual(npc.proficiency, 2)
  assert.strictEqual(npc.statMod("STR"), 1) // (13-10)/2 = 1
})

test("Location constructor and getters", (t) => {
  const location = new core.Location("TestLocation", [
    { kind: "property", name: "safety", value: 10 },
    new core.NPC("Guard", [])
  ])

  assert.strictEqual(location.name, "TestLocation")
  assert.strictEqual(location.kind, "Location")
  assert.strictEqual(location.properties.safety, 10)
  assert.strictEqual(location.items.length, 2) // property and NPC
})

test("Encounter constructor", (t) => {
  const encounter = new core.Encounter("TestEncounter", [
    new core.NPC("Monster", [])
  ])

  assert.strictEqual(encounter.name, "TestEncounter")
  assert.strictEqual(encounter.kind, "Encounter")
  assert.strictEqual(encounter.items.length, 1)
})

test("StatBlock constructor", (t) => {
  const statBlock = new core.StatBlock([
    { kind: "property", name: "HP", value: 20 }
  ])

  assert.strictEqual(statBlock.kind, "StatBlock")
  assert.strictEqual(statBlock.items.length, 1)
})

test("Action constructor", (t) => {
  const action = new core.Action("TestAction", [
    { kind: "property", name: "type", value: "attack" }
  ])

  assert.strictEqual(action.name, "TestAction")
  assert.strictEqual(action.kind, "Action")
  assert.strictEqual(action.properties.type, "attack")
})

test("PrintStmt constructor", (t) => {
  const printStmt = new core.PrintStmt('"Hello"')

  assert.strictEqual(printStmt.argument, '"Hello"')
  assert.strictEqual(printStmt.kind, undefined)
})

test("Program constructor", (t) => {
  const program = new core.Program([
    new core.NPC("NPC1", []),
    new core.Location("Loc1", [])
  ])

  assert.strictEqual(program.declarations.length, 2)
})

test("extractFields handles nested arrays", (t) => {
  const nestedItems = [
    { kind: "property", name: "Level", value: 5 },
    [
      { kind: "property", name: "SubZone", value: "Cellar" },
      { kind: "property", name: "Light", value: "Dim" }
    ]
  ];
  
  const fields = core.extractFields(nestedItems);
  
  assert.strictEqual(fields.Level, 5);
  assert.strictEqual(fields.SubZone, "Cellar");
  assert.strictEqual(fields.Light, "Dim");
})

test("core.js branch coverage: extractFields edge cases", (t) => {
  assert.deepStrictEqual(core.extractFields(null), {})
  assert.deepStrictEqual(core.extractFields(undefined), {})
  assert.deepStrictEqual(core.extractFields([]), {})

  const sparse = [{ kind: "property", name: "HP", value: 10 }, null]
  assert.strictEqual(core.extractFields(sparse).HP, 10)
})

test("core.js branch coverage: NPC defaults", (t) => {
  const npc = new core.NPC("Ghost", [])
  
  assert.strictEqual(npc.proficiency, 2)
  
  assert.strictEqual(npc.statMod("LUCK"), 0)
})

test("core.js branch coverage: NPC actions fallback", (t) => {
  const npc = new core.NPC("Broken", null)
  assert.deepStrictEqual(npc.actions, [])
})

test("NPC savingThrows fallback coverage", (t) => {
  const npc = new core.NPC("Commoner", [])
  
  assert.deepStrictEqual(npc.savingThrows, {})
})