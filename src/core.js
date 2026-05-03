export function extractFields(items) {
  const fieldMap = {}
  if (!Array.isArray(items)) return fieldMap
  
  for (const item of items) {
    if (!item) continue
    
    if (item.kind === "property") {
      fieldMap[item.name] = item.value
      fieldMap[item.name.toLowerCase()] = item.value
    } else if (item.kind !== "StatBlock" && item.kind !== "SavingThrowBlock" && item.fields) {
      Object.assign(fieldMap, item.fields)
    } else if (Array.isArray(item)) {
      Object.assign(fieldMap, extractFields(item))
    }
  }
  
  return fieldMap
}

export class Program {
  constructor(declarations) {
    this.declarations = declarations
  }
}

export class NPC {
  constructor(name, items) {
    this.kind = "NPC"
    this.name = name
    this.items = items
  }

  get stats() {
    const block = this.items.find(i => i.kind === "StatBlock")
    const baseFields = extractFields(this.items)
    // Merge top-level properties (like AC/HP) with the stats block
    return Object.assign({}, baseFields, block ? block.fields : {})
  }

  get savingThrows() {
    const block = this.items.find(i => i.kind === "SavingThrowBlock")
    return block ? block.fields : {}
  }

  get fields() {
    return this.stats
  }

  get proficiency() {
    return this.stats.proficiency || 2
  }

  get actions() {
    return Array.isArray(this.items)
      ? this.items.filter(item => item?.kind === "Action")
      : []
  }

  statMod(stat) {
    const value = this.stats[stat]
    return typeof value === "number" ? Math.floor((value - 10) / 2) : 0
  }
}

export class Location {
  constructor(name, items) {
    this.kind = "Location"
    this.name = name
    this.items = items
  }
  get fields() { return extractFields(this.items) }
  get properties() { return this.fields }
}

export class Encounter {
  constructor(name, items) {
    this.kind = "Encounter"
    this.name = name
    this.items = items
  }
  get fields() { return extractFields(this.items) }
  get properties() { return this.fields }
}

export class PrintStmt {
  constructor(argument) { this.argument = argument }
}

export class StatBlock {
  constructor(items) {
    this.kind = "StatBlock"
    this.items = items
  }
  get fields() { return extractFields(this.items) }
}

export class SavingThrowBlock {
  constructor(items) {
    this.kind = "SavingThrowBlock"
    this.items = items
  }
  get fields() { return extractFields(this.items) }
}

export class Action {
  constructor(name, body) {
    this.kind = "Action"
    this.name = name
    this.body = body
  }
  get fields() { return extractFields(this.body) }
  get properties() { return this.fields }
}