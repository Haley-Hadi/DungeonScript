import { getModifier } from "./core.js"

export default function generate(program) {
  return generateMarkdown(program)
}

function generateMarkdown(program) {
  let markdownOutput = ""
  program.declarations.forEach(decl => {
    if (decl.kind === "NPC") {
      markdownOutput += generateNpcMarkdown(decl)
    }
  })
  return markdownOutput
}

function generateNpcMarkdown(npc) {
  // Evaluates strings like "1d6 + STR + PROF"
  function resolveDamageString(damageStr) {
    if (!damageStr) return ""
    
    return damageStr
      .replace(/\b(STR|DEX|CON|INT|WIS|CHA)\b/g, (match) => {
        const mod = npc.statMod(match)
        return mod >= 0 ? `+${mod}` : `${mod}`
      })
      .replace(/\bPROF\b/g, () => {
        return npc.proficiency >= 0 ? `+${npc.proficiency}` : `${npc.proficiency}`
      })
  }

  return `---
type: npc
name: ${npc.name}
HP: ${npc.stats.HP}
AC: ${npc.stats.AC}
---

# ${npc.name}

**Proficiency Bonus:** +${npc.proficiency}

## Stats
| Stat | Value | Modifier |
| :--- | :--- | :--- |
| STR | ${npc.stats.STR} | ${npc.statMod("STR")} |
| DEX | ${npc.stats.DEX} | ${npc.statMod("DEX")} |
| CON | ${npc.stats.CON} | ${npc.statMod("CON")} |
| INT | ${npc.stats.INT} | ${npc.statMod("INT")} |
| WIS | ${npc.stats.WIS} | ${npc.statMod("WIS")} |
| CHA | ${npc.stats.CHA} | ${npc.statMod("CHA")} |

## Actions and Attacks
${npc.actions.map(action => `
### ${action.name}
- **Type**: ${action.properties.type || "attack"}
- **Damage/Effect**: ${resolveDamageString(action.properties.damage)}
`).join("\n")}
\n\n`
}

function generateLocationMarkdown(location) {
  let output = `# ${location.name}\n\n`
  output += `**Safety Level:** ${location.properties.safety || "Unknown"}\n\n`
  output += `## Entities\n`
  
  location.items.forEach(item => {
    if (item.kind === "NPC") {
      output += `- 🛡️ **${item.name}** (NPC)\n`
    } else if (item.kind === "Encounter") {
      output += `- ⚔️ **${item.name}** (Encounter)\n`
    }
  })
  
  return output + "\n---\n"
}