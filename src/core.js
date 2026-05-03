export function extractFields(items) {
  const fieldMap = {}
  if (!Array.isArray(items)) return fieldMap
  
  for (const item of items) {
    if (!item) continue
    
    if (item.kind === "property") {
      fieldMap[item.name] = item.value
      fieldMap[item.name.toLowerCase()] = item.value
    } else if (item.fields) {
      Object.assign(fieldMap, item.fields || {})
    } else if (Array.isArray(item)) {
      Object.assign(fieldMap, extractFields(item))
    } else if (item.items && Array.isArray(item.items)) {
      Object.assign(fieldMap, extractFields(item.items))
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

  get fields() {
    return extractFields(this.items)
  }

  get stats() {
    return this.fields
  }

  get proficiency() {
    return this.fields.proficiency || 2
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

  get fields() {
    return extractFields(this.items)
  }

  // Add this getter to map properties to fields
  get properties() {
    return this.fields
  }
}

export class Encounter {
  constructor(name, items) {
    this.kind = "Encounter"
    this.name = name
    this.items = items
  }

  get fields() {
    return extractFields(this.items)
  }

  get properties() {
    return this.fields
  }
}

export class PrintStmt {
  constructor(argument) {
    this.argument = argument
  }
}

export class StatBlock {
  constructor(items) {
    this.kind = "StatBlock"
    this.items = items
  }

  get fields() {
    return extractFields(this.items)
  }
}

export class SavingThrowBlock {
  constructor(items) {
    this.kind = "SavingThrowBlock"
    this.items = items
  }

  get fields() {
    return extractFields(this.items)
  }
}

export class Action {
  constructor(name, body) {
    this.kind = "Action"
    this.name = name
    this.body = body
  }

  get fields() {
    return extractFields(this.body)
  }

  get properties() {
    return this.fields
  }
}