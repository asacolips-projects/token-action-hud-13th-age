/**
 * Module-based constants
 */
export const MODULE = {
  ID: 'token-action-hud-13th-age'
}

/**
 * Core module
 */
export const CORE_MODULE = {
  ID: 'token-action-hud-core'
}

/**
 * Core module version required by the system module
 */
export const REQUIRED_CORE_MODULE_VERSION = '1.5'

/**
 * Action types
 */
export const ACTION_TYPE = {
  powers: 'tokenActionHud.template.power',
  item: 'tokenActionHud.template.item',
  abilities: 'tokenActionHud.template.ability',
  combat: 'tokenActionHud.template.combat',
  utility: 'tokenActionHud.utility'
}

const collapsedByDefault = {
  settings: {
    collapse: true
  }
}

/**
 * Groups
 */
export const GROUP = {
  spell: { id: 'spell', name: 'tokenActionHud.template.spell', type: 'system' },
  flexible: { id: 'flexible', name: 'tokenActionHud.template.flexible', type: 'system' },
  power: { id: 'power', name: 'tokenActionHud.template.power', type: 'system' },
  talent: { id: 'talent', name: 'tokenActionHud.template.talent', type: 'system', ...collapsedByDefault },
  feature: { id: 'feature', name: 'tokenActionHud.template.feature', type: 'system', ...collapsedByDefault },
  other: { id: 'other', name: 'tokenActionHud.template.other', type: 'system', ...collapsedByDefault },

  equipment: { id: 'equipment', name: 'tokenActionHud.template.equipment', type: 'system' },
  loot: { id: 'loot', name: 'tokenActionHud.template.loot', type: 'system' },
  tool: { id: 'tool', name: 'tokenActionHud.template.tool', type: 'system' },
  
  ability: { id: 'ability', name: 'tokenActionHud.template.ability', type: 'system' },
  background: { id: 'background', name: 'tokenActionHud.template.background', type: 'system' },
  
  combat: { id: 'combat', name: 'tokenActionHud.combat', type: 'system' },
  utility: { id: 'utility', name: 'tokenActionHud.utility', type: 'system' }
}

/**
 * Item types
 */
export const ITEM_TYPE = {
  // power: { groupId: 'power' },
  armor: { groupId: 'armor' },
  equipment: { groupId: 'equipment' },
  loot: { groupId: 'loot' },
  tool: { groupId: 'tool' }
}
