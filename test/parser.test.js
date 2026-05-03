import test from "node:test"
import assert from "node:assert"
import parse from "../src/parser.js"

test("parses a simple NPC", (t) => {
  const source = `NPC "Goblin" {
    stats {
      HP: 12
    }
  }`
  assert.ok(parse(source))
})

test("parses a location with nested encounters", (t) => {
  const source = `Location "Dungeon" {
    Encounter "MainEncounter" {
      NPC "Goblin" {
        stats {
          HP: 10
        }
      }
    }
  }`
  assert.ok(parse(source))
})

test("parses an NPC with saving throws and actions", (t) => {
  const source = `NPC "Bandit" {
    stats {
      STR: 14,
      DEX: 12
    }
    saving_throws {
      STR: 2,
      DEX: 3
    }
    action "Multiattack" {
      damage: 10
    }
  }`
  assert.ok(parse(source))
})

test("parses print statements", (t) => {
  const source = `print("Welcome to the dungeon.");`
  assert.ok(parse(source))
})

test("throws on string lit with code point too long", (t) => {
assert.throws(
    () => parse('print("\\u{1111111}");'),
    /Expected/ // Matches any parse error from Ohm
  )
})

test("throws on unterminated string literal", (t) => {
  assert.throws(
    () => parse('print("hello);'),
    /Expected/
  )
})

test("throws on invalid characters in identifier", (t) => {
  assert.throws(
    () => parse('NPC Goblin { }'),
    /Expected/
  )
})