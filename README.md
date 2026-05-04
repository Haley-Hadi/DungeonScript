![DungeonScript Logo](docs/DungeonScript_Logo.png)
# DungeonScript 
### Authors: Haley Hadiwidjojo 
---

## Description 
DungeonScript is a domain-specific scripting language designed for Game Masters. It allows for the rapid creation of TTRPG entities—NPCs, Locations, and Encounters—in a clean, readable format that can be compiled into structured data for Virtual Tabletops (VTT) or Markdown for note-taking apps like Obsidian.


## Language Specifications
The language specifications can be found on this [companion site](https://haley-hadi.github.io/DungeonScript_LanguageSpecs/).

* DungeonScript focuses on structure and readability for storytelling. Features include:  
* Entity Declaration: Specialized blocks for NPC, Location, and Encounter.
* Stat Blocks: Dedicated syntax for standard TTRPG attributes (STR, DEX, etc.) with automatic modifier calculation.
* Dynamic Properties: Support for custom key-value pairs (e.g., safety, environment).
* Nesting: Place NPCs and Encounters directly inside Locations to build a world hierarchy.
* Action System: Define custom attacks or abilities with modifier-aware damage strings.
* Null-Safety: Robust fallbacks for missing stats or incorrectly formatted properties.

