import * as core from './src/core.js'
import generate from './src/generator.js'

const npc = new core.NPC('Goblin', [
  new core.StatBlock([
    { kind: 'property', name: 'HP', value: 12 },
    { kind: 'property', name: 'STR', value: 14 }
  ]),
  new core.Action('Club', [
    { kind: 'property', name: 'type', value: 'attack' },
    { kind: 'property', name: 'damage', value: '1d4 + STR' }
  ])
])
const location = new core.Location('TheRustyAnchor', [
  { kind: 'property', name: 'safety', value: 10 },
  new core.NPC('Barnaby', [])
])

console.log('NPC kind', npc.kind)
console.log('NPC stats', npc.stats)
console.log('NPC actions', npc.actions)
console.log('Action properties', npc.actions[0]?.properties)
console.log('Location kind', location.kind)
console.log('Location properties', location.properties)
console.log('Generated NPC markdown:\n', generate(new core.Program([npc])))
console.log('Generated location markdown:\n', generate(new core.Program([location])))
