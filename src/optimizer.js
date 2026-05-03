import * as core from "./core.js"

export default function optimize(program) {
  const optimizedProgram = new core.Program(
    (Array.isArray(program.declarations) ? program.declarations : [])
      .map(optimizeDeclaration)
      .filter(Boolean)
  )

  return optimizedProgram
}

function optimizeDeclaration(node) {
  if (!node || typeof node !== "object") return node

  switch (node.kind) {
    case "NPC":
      return optimizeNPC(node)
    case "Location":
      return optimizeLocation(node)
    case "Encounter":
      return optimizeEncounter(node)
    default:
      return node
  }
}

function optimizeNPC(npc) {
  return new core.NPC(npc.name, optimizeItems(npc.items))
}

function optimizeLocation(location) {
  return new core.Location(location.name, optimizeItems(location.items))
}

function optimizeEncounter(encounter) {
  return new core.Encounter(encounter.name, optimizeItems(encounter.items))
}

function optimizeItems(items) {
  if (!Array.isArray(items)) return items

  const optimized = items
    .map(item => {
      if (!item || typeof item !== "object") return item
      switch (item.kind) {
        case "NPC":
          return optimizeNPC(item)
        case "Location":
          return optimizeLocation(item)
        case "Encounter":
          return optimizeEncounter(item)
        case "Action":
          return optimizeAction(item)
        case "StatBlock":
          return optimizeStatBlock(item)
        case "SavingThrowBlock":
          return optimizeSavingThrowBlock(item)
        default:
          return item
      }
    })
    .filter(Boolean)

  return mergeDuplicateProperties(optimized)
}

function optimizeAction(action) {
  return new core.Action(action.name, optimizeItems(action.body))
}

function optimizeStatBlock(block) {
  const items = optimizeItems(block.items)
  const filtered = items.filter(item => item && item.kind !== "StatBlock" && item.kind !== "SavingThrowBlock")
  return filtered.length ? new core.StatBlock(filtered) : undefined
}

function optimizeSavingThrowBlock(block) {
  const items = optimizeItems(block.items)
  const filtered = items.filter(item => item && item.kind !== "StatBlock" && item.kind !== "SavingThrowBlock")
  return filtered.length ? new core.SavingThrowBlock(filtered) : undefined
}

function mergeDuplicateProperties(items) {
  const properties = new Map()
  const result = []

  for (const item of items) {
    if (!item || typeof item !== "object") {
      result.push(item)
      continue
    }

    if (item.kind === "property") {
      properties.set(item.name, item)
      continue
    }

    result.push(item)
  }

  return [...result, ...properties.values()]
}
