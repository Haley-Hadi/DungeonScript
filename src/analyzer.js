import { grammar } from "./parser.js"
import * as core from "./core.js"

function cleanString(str) {
  const s = str.trim()
  if (s.startsWith('"') && s.endsWith('"')) {
    return s.slice(1, -1)
  }
  return s
}

const semantics = grammar.createSemantics()

semantics.addOperation("analyze", {
  Program(declarations) {
    return new core.Program(
      declarations.analyze()
        .flat(Infinity)
        .filter(d => d !== undefined && !(typeof d === 'string' && d.trim() === ""))
    )
  },

  Declaration(item) {
    return item.analyze()
  },

  NPC(kind, name, openBrace, body, closeBrace) {
    const nodeName = cleanString(name.sourceString)

    const analyzedBody = body.analyze()
      .flat(Infinity)
      .filter(item => item !== undefined && !(typeof item === 'string' && item.trim() === ""))

    const npc = new core.NPC(
      nodeName,
      analyzedBody
    )

    if (npc.fields.HP !== undefined && npc.fields.HP <= 0) {
      throw new Error(`${nodeName} must have an HP value greater than 0`)
    }

    return npc
  },

Location(kind, name, openBrace, body, closeBrace) {
    const nodeName = cleanString(name.sourceString)

    const analyzedBody = body.analyze()
      .flat(Infinity)
      .filter(item => item !== undefined && !(typeof item === 'string' && item.trim() === ""))

    const location = new core.Location(
      nodeName,
      analyzedBody
    )

    return location
  },

  property(identifier, colon, spaces, value) {
    const v = value.sourceString.trim()
    const num = Number(v)
    let finalValue = isNaN(num) ? v : num

    if (typeof finalValue === 'string' && finalValue.startsWith('"') && finalValue.endsWith('"')) {
      finalValue = finalValue.slice(1, -1)
    }

    return {
      kind: "property",
      name: identifier.sourceString.trim(),
      value: finalValue,
    }
  },

  Encounter(kind, name, openBrace, body, closeBrace) {
    const analyzedBody = body.analyze()
      .flat(Infinity)
      .filter(item => item !== undefined && !(typeof item === 'string' && item.trim() === ""))

    const encounter = new core.Encounter(
      name.sourceString.slice(1, -1),
      analyzedBody
    )

    return encounter
  },

  PrintStmt(print, openParen, argument, closeParen, semicolon) {
    return new core.PrintStmt(argument.sourceString)
  },

  StatBlock(statsToken, openBrace, stats, closeBrace) {
    const analyzedStats = stats.analyze()
      .flat(Infinity)
      .filter(item => item !== undefined && !(typeof item === 'string' && item.trim() === ""))
    
    const block = new core.StatBlock(analyzedStats)
    block.stats = analyzedStats
    return block
  },

  SavingThrowBlock(savingThrowsToken, openBrace, stats, closeBrace) {
    const analyzedStats = stats.analyze()
      .flat(Infinity)
      .filter(item => item !== undefined && !(typeof item === 'string' && item.trim() === ""))
    
    const block = new core.SavingThrowBlock(analyzedStats)
    block.stats = analyzedStats
    return block
  },

  Action(actionToken, name, openBrace, body, closeBrace) {
    return new core.Action(
      name.sourceString.slice(1, -1),
      body.analyze()
        .flat(Infinity)
        .filter(item => item !== undefined && !(typeof item === 'string' && item.trim() === ""))
    )
  },

  Stat(identifier, colon, number) {
    return {
      kind: "property",
      name: identifier.sourceString.trim(),
      value: Number(number.sourceString.trim()),
    }
  },

  Stats(openBlock, statsList, closeBlock) {
    return statsList.analyze()
  },

  _iter(...children) {
    return children.map((c) => c.analyze())
  },

  _terminal() {
    return this.sourceString
  },
})

export default function analyze(match) {
  return semantics(match).analyze()
}