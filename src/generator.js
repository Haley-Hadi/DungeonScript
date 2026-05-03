import * as core from "./core.js"

export default function generate(program) {
  return generateMarkdown(program)
}

function generateMarkdown(program) {
  let markdownOutput = ""
  program.declarations.forEach(decl => {
    if (decl.kind === "NPC") {
      markdownOutput += generateNpcMarkdown(decl)
    } else if (decl.kind === "Location") {
      markdownOutput += generateLocationMarkdown(decl)
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
        return formatModifier(mod)
      })
      .replace(/\bPROF\b/g, () => {
        return formatModifier(npc.proficiency)
      })
  }

  function formatModifier(mod) {
    if (typeof mod !== "number") return "0"
    return mod >= 0 ? `+${mod}` : `${mod}`
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
| STR | ${npc.stats.STR} | ${formatModifier(npc.statMod("STR"))} |
| DEX | ${npc.stats.DEX} | ${formatModifier(npc.statMod("DEX"))} |
| CON | ${npc.stats.CON} | ${formatModifier(npc.statMod("CON"))} |
| INT | ${npc.stats.INT} | ${formatModifier(npc.statMod("INT"))} |
| WIS | ${npc.stats.WIS} | ${formatModifier(npc.statMod("WIS"))} |
| CHA | ${npc.stats.CHA} | ${formatModifier(npc.statMod("CHA"))} |

## Actions and Attacks
${(npc.actions || []).map(action => {
    const props = action.properties || {}
    return `
### ${action.name}
- **Type**: ${props.type || "attack"}
- **Damage/Effect**: ${resolveDamageString(props.damage)}
`
  }).join("\n")}
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