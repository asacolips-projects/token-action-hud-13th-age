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
  item: 'tokenActionHud.template.item',
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

  action: { id: 'action', name: 'tokenActionHud.template.action', type: 'system' },
  trait: { id: 'trait', name: 'tokenActionHud.template.trait', type: 'system' },
  nastierSpecial: { id: 'nastierSpecial', name: 'tokenActionHud.template.nastierSpecial', type: 'system' },
  
  ability: { id: 'ability', name: 'tokenActionHud.template.ability', type: 'system' },
  background: { id: 'background', name: 'tokenActionHud.template.background', type: 'system' },
  icon: { id: 'icon', name: 'tokenActionHud.template.icon', type: 'system' },

  recovery: { id: 'recovery', name: 'tokenActionHud.template.recovery', type: 'system' },
  rest: { id: 'rest', name: 'tokenActionHud.template.rest', type: 'system' },
  saves: { id: 'saves', name: 'tokenActionHud.template.saves', type: 'system' },
  
  combat: { id: 'combat', name: 'tokenActionHud.combat', type: 'system' },
  utility: { id: 'utility', name: 'tokenActionHud.utility', type: 'system' },

  effect: { id: 'effect', name: 'tokenActionHud.template.effect', type: 'system' },
  condition: { id: 'condition', name: 'tokenActionHud.template.condition', type: 'system' }
}

/**
 * Item types
 */
export const ITEM_TYPE = {
  // Character item types.
  armor: { groupId: 'armor' },
  equipment: { groupId: 'equipment' },
  loot: { groupId: 'loot' },
  tool: { groupId: 'tool' },

  // NPC item types.
  action: { groupId: 'action' },
  trait: { groupId: 'trait' },
  nastierSpecial: { groupId: 'nastierSpecial' }
}
