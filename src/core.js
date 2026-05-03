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
    this.name = name
    this.items = items
  }

  get fields() {
    return extractFields(this.items)
  }
}

export class Location {
  constructor(name, items) {
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

export class PrintStmt {
  constructor(argument) {
    this.argument = argument
  }
}

export class StatBlock {
  constructor(items) {
    this.items = items
  }

  get fields() {
    return extractFields(this.items)
  }
}

export class SavingThrowBlock {
  constructor(items) {
    this.items = items
  }

  get fields() {
    return extractFields(this.items)
  }
}

export class Action {
  constructor(name, body) {
    this.name = name
    this.body = body
  }
}