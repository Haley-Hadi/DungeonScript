import * as core from "./core.js"

export function convertMonsterToAST(monster) {
  const items = []

  // StatBlock
  const statItems = []
  if (monster.str) statItems.push({kind: "property", name: "STR", value: monster.str})
  if (monster.dex) statItems.push({kind: "property", name: "DEX", value: monster.dex})
  if (monster.con) statItems.push({kind: "property", name: "CON", value: monster.con})
  if (monster.int) statItems.push({kind: "property", name: "INT", value: monster.int})
  if (monster.wis) statItems.push({kind: "property", name: "WIS", value: monster.wis})
  if (monster.cha) statItems.push({kind: "property", name: "CHA", value: monster.cha})
  if (statItems.length) items.push({kind: "StatBlock", items: statItems})

  // HP
  if (monster.hp) {
    const hp = typeof monster.hp === 'object' ? monster.hp.average : monster.hp
    items.push({kind: "property", name: "HP", value: hp})
  }

  // AC
  if (monster.ac) {
    const ac = Array.isArray(monster.ac) ? monster.ac[0] : monster.ac
    items.push({kind: "property", name: "AC", value: ac})
  }

  // Traits
  if (monster.trait) {
    for (const trait of monster.trait) {
      const desc = Array.isArray(trait.entries) ? trait.entries.map(e => typeof e === 'string' ? e : e.entry || JSON.stringify(e)).join(' ') : trait.entries
      items.push({kind: "property", name: trait.name, value: desc})
    }
  }

  // Actions
  if (monster.action) {
    for (const act of monster.action) {
      const body = []
      if (act.entries) {
        const desc = Array.isArray(act.entries) ? act.entries.map(e => typeof e === 'string' ? e : JSON.stringify(e)).join(' ') : act.entries
        body.push({kind: "property", name: "description", value: desc})
      }
      items.push({kind: "Action", name: act.name, body})
    }
  }

  // Other properties
  if (monster.speed) {
    const speed = monster.speed.walk || monster.speed
    items.push({kind: "property", name: "speed", value: speed})
  }

  if (monster.languages) {
    items.push({kind: "property", name: "languages", value: Array.isArray(monster.languages) ? monster.languages.join(', ') : monster.languages})
  }

  if (monster.cr) items.push({kind: "property", name: "CR", value: monster.cr})

  return {
    kind: "NPC",
    name: monster.name,
    items
  }
}

export default function generateDS(node, indent = "") {
  if (node.kind === "Program") {
    return node.declarations.map(d => generateDS(d)).join("\n\n")
  } else if (node.kind === "NPC") {
    return `${indent}NPC "${node.name}" {\n${generateItems(node.items, indent + "  ")}\n${indent}}`
  } else if (node.kind === "Location") {
    return `${indent}Location "${node.name}" {\n${generateItems(node.items, indent + "  ")}\n${indent}}`
  } else if (node.kind === "Encounter") {
    return `${indent}Encounter "${node.name}" {\n${generateItems(node.items, indent + "  ")}\n${indent}}`
  } else if (node.kind === "StatBlock") {
    return `${indent}stats {\n${generateItems(node.items, indent + "  ")}\n${indent}}`
  } else if (node.kind === "SavingThrowBlock") {
    return `${indent}savingThrows {\n${generateItems(node.items, indent + "  ")}\n${indent}}`
  } else if (node.kind === "Action") {
    return `${indent}action "${node.name}" {\n${generateItems(node.body, indent + "  ")}\n${indent}}`
  } else if (node.kind === "property") {
    const value = typeof node.value === "string" ? `"${node.value.replace(/"/g, '\\"')}"` : node.value
    return `${indent}${node.name}: ${value}`
  } else if (node.kind === "PrintStmt") {
    return `${indent}print(${node.argument})`
  }
  return ""
}

function generateItems(items, indent) {
  if (!Array.isArray(items)) return ""
  return items.map(item => generateDS(item, indent)).filter(s => s).join("\n")
}