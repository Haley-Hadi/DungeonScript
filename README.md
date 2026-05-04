![DungeonScript Logo](docs/DungeonScript_Logo.png)
# DungeonScript 
### Authors: Haley Hadiwidjojo 
---

## Description 
DungeonScript is a domain-specific scripting language designed for Game Masters. It allows for the rapid creation of TTRPG entities: NPCs, Locations, and Encounters in a clean, readable format that can be compiled into structured data for Virtual Tabletops (VTT) or Markdown for note-taking apps like Obsidian.


## Language Specifications
The language specifications can be found on this [companion site](https://haley-hadi.github.io/DungeonScript_LanguageSpecs/).

DungeonScript focuses on structure and readability for storytelling. Features include:  
* Entity Declaration: Specialized blocks for NPC, Location, and Encounter.
* Stat Blocks: Dedicated syntax for standard TTRPG attributes (STR, DEX, etc.) with automatic modifier calculation.
* Dynamic Properties: Support for custom key-value pairs (e.g., safety, environment).
* Nesting: Place NPCs and Encounters directly inside Locations to build a world hierarchy.
* Action System: Define custom attacks or abilities with modifier-aware damage strings.
* Null-Safety: Robust fallbacks for missing stats or incorrectly formatted properties.
* JSON Converter: A stat block JSON-to-DungeonScript conversion via `src/ds-generator.js`
* Markdown output generation for notes and VTT import

## Repository Structure
- `src/`
  - `parser.js` — loads grammar and validates source code
  - `analyzer.js` — converts parse matches into semantic AST nodes
  - `optimizer.js` — normalizes declarations and merges duplicate properties
  - `generator.js` — renders compiled output as Markdown
  - `compiler.js` — top-level pipeline entry point
  - `core.js` — AST classes and helpers
  - `ds-generator.js` — converts JSON monster data into DungeonScript
  - `dungeonscript.ohm` — language grammar
- `examples/` — sample DungeonScript files and JSON sources
- `test/` — unit tests for parser, analyzer, compiler, and generators

## Building
Node.js is required to build and run this project.

First clone the repo, then run
```bash
npm install
```.

Finally, run
```bash
npm test
```.

## Compiler Usage
DungeonScript exposes a simple programmatic compiler pipeline in `src/compiler.js`.

```js
import compile from "./src/compiler.js"

const source = `NPC "Goblin" {
  stats {
    HP: 12
    STR: 14
    AC: 13
  }
  action "Club" {
    type: "attack"
    damage: "1d4 + STR"
  }
}`

const syntax = compile(source, "parsed")
const analyzed = compile(source, "analyzed")
const optimized = compile(source, "optimized")
const markdown = compile(source, "js")
```

### Output modes
- `parsed` — validates source syntax and returns `"Syntax is ok"`
- `analyzed` — returns the semantic AST with `Program`, `NPC`, `Location`, and `Encounter` objects
- `optimized` — returns the normalized AST after merging duplicates and removing redundant nested blocks
- `js` — generates Markdown output from the optimized AST

> Note: the output mode name `js` is the generator entry point and currently emits Markdown-friendly content.

## Language Syntax
DungeonScript source is built from a small, readable DSL defined in `src/dungeonscript.ohm`.

### NPC
```text
NPC "Goblin" {
  stats {
    STR: 8
    DEX: 14
    CON: 10
    INT: 10
    WIS: 8
    CHA: 8
    HP: 7
    AC: 15
    proficiency: 2
  }

  saving_throws {
    STR: -1
    DEX: 2
  }

  action "Scimitar" {
    type: "melee"
    damage: "1d6 + STR + PROF"
  }
}
```

### Location
```text
Location "Castle" {
  safety: 8
  NPC "Guard" {
    stats {
      HP: 20
    }
  }
  Encounter "Ambush" {
    difficulty: "medium"
  }
}
```

### Encounter
```text
Encounter "Ambush" {
  type: "trap"
  description: "A hidden pit in the corridor."
}
```

### Print statement
```text
print("The party hears distant footsteps.");
```

## Generated Markdown Output
The compiler renders NPC and Location declarations into Markdown suitable for notes and VTT workflows.

For example, `compile(source, "js")` can produce output containing:
- YAML-style frontmatter for `npc` metadata
- stat tables with computed ability modifiers
- action summaries
- location summaries with safety levels and nested entities

## JSON to DungeonScript Conversion
A helper script exists in `src/ds-generator.js` to convert JSON monster objects into DungeonScript AST and source text.

Example command:
```bash
npm run generate-ds ./examples/goblin.json
```

This script reads JSON from the provided file path and prints equivalent DungeonScript source.

## Common Workflows
### Validate syntax only
```js
const result = compile(source, "parsed")
console.log(result) // Syntax is ok
```

### Inspect the semantic AST
```js
const program = compile(source, "analyzed")
console.log(JSON.stringify(program, null, 2))
```

### Produce Markdown output for notes
```js
const markdown = compile(source, "js")
console.log(markdown)
```

## Notes
- `proficiency` defaults to `2` if not specified
- Ability modifiers are calculated as `Math.floor((score - 10) / 2)`
- Duplicate properties inside a declaration are merged during optimization
- The grammar supports both quoted strings and bare identifiers for names