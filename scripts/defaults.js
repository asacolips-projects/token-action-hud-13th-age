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
                name: coreModule.api.Utils.i18n('tokenActionHud13thAge.Powers'),
                groups: [
                    { ...groups.spell, nestId: 'powers_spell'},
                    { ...groups.flexible, nestId: 'powers_flexible'},
                    { ...groups.power, nestId: 'powers_power'},
                    { ...groups.talent, nestId: 'powers_talent'},
                    { ...groups.feature, nestId: 'powers_feature'},
                    { ...groups.other, nestId: 'powers_other'},
                ]
            },
            {
                nestId: 'inventory',
                id: 'inventory',
                name: coreModule.api.Utils.i18n('tokenActionHud13thAge.Inventory'),
                groups: [
                    { ...groups.equipment, nestId: 'inventory_equipment' },
                    { ...groups.loot, nestId: 'inventory_loot' },
                    { ...groups.tool, nestId: 'inventory_tool' },
                ]
            },
            {
                nestId: 'utility',
                id: 'utility',
                name: coreModule.api.Utils.i18n('tokenActionHud.utility'),
                groups: [
                    { ...groups.combat, nestId: 'utility_combat' },
                    { ...groups.token, nestId: 'utility_token' },
                    { ...groups.rests, nestId: 'utility_rests' },
                    { ...groups.utility, nestId: 'utility_utility' }
                ]
            }
        ],
        groups: groupsArray
    }
})
