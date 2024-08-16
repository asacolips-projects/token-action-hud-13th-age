import { GROUP } from './constants.js'

/**
 * Default layout and groups
 */
export let DEFAULTS = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
  const groups = GROUP
  Object.values(groups).forEach(group => {
    group.name = coreModule.api.Utils.i18n(group.name)
    group.listName = `Group: ${coreModule.api.Utils.i18n(group.listName ?? group.name)}`
  })
  const groupsArray = Object.values(groups)
  DEFAULTS = {
    layout: [
      {
        nestId: 'powers',
        id: 'powers',
        name: coreModule.api.Utils.i18n('tokenActionHud13thAge.powers'),
        groups: [
          { ...groups.spell, nestId: 'powers_spell' },
          { ...groups.flexible, nestId: 'powers_flexible' },
          { ...groups.power, nestId: 'powers_power' },
          { ...groups.talent, nestId: 'powers_talent' },
          { ...groups.feature, nestId: 'powers_feature' },
          { ...groups.other, nestId: 'powers_other' }
        ]
      },
      {
        nestId: 'inventory',
        id: 'inventory',
        name: coreModule.api.Utils.i18n('tokenActionHud13thAge.inventory'),
        groups: [
          { ...groups.equipment, nestId: 'inventory_equipment' },
          { ...groups.loot, nestId: 'inventory_loot' },
          { ...groups.tool, nestId: 'inventory_tool' }
        ]
      },
      {
        nestId: 'abilities',
        id: 'abilities',
        name: coreModule.api.Utils.i18n('tokenActionHud13thAge.abilities'),
        groups: [
          { ...groups.ability, nestId: 'abilities_ability' },
          { ...groups.background, nestId: 'abilities_background' },
          { ...groups.icon, nestId: 'abilities_icon' },
        ]
      },
      {
        nestId: 'recovery',
        id: 'recovery',
        name: coreModule.api.Utils.i18n('tokenActionHud13thAge.recovery'),
        groups: [
          { ...groups.recovery, nestId: 'recovery_recovery' },
          { ...groups.rest, nestId: 'recovery_rest' },
          { ...groups.saves, nestId: 'recovery_saves' }
        ]
      },
      {
        nestId: 'combat',
        id: 'combat',
        name: coreModule.api.Utils.i18n('tokenActionHud13thAge.combat'),
        groups: [
          { ...groups.combat, nestId: 'combat_combat' },
        ]
      },
      {
        nestId: 'utility',
        id: 'utility',
        name: coreModule.api.Utils.i18n('tokenActionHud.utility'),
        groups: [
          { ...groups.utility, nestId: 'utility_utility' }
        ]
      }
    ],
    groups: groupsArray
  }
})
