// System Module Imports
import { ACTION_TYPE, ITEM_TYPE } from './constants.js'
import { Utils } from './utils.js'

export let ActionHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
  /**
   * Extends Token Action HUD Core's ActionHandler class and builds system-defined actions for the HUD
   */
  ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
    /**
     * Get actors
     * @private
     * @returns {object}
     */
    #getActors () {
      const allowedTypes = ['character', 'npc']
      const tokens = coreModule.api.Utils.getControlledTokens()
      const actors = tokens?.filter(token => token.actor).map((token) => token.actor)
      if (actors.every((actor) => allowedTypes.includes(actor.type))) {
        return actors
      } else {
        return []
      }
    }

    /**
     * Build system actions
     * Called by Token Action HUD Core
     * @override
     * @param {array} groupIds
     */
    async buildSystemActions (groupIds) {
      // Set actor and token variables
      this.actors = (!this.actor) ? this.#getActors() : [this.actor]
      this.actorType = this.actor?.type

      this.displayUnequipped = true;

      // Set items variable
      if (this.actor) {
        this.items = new Map([...this.actor.items.entries()].sort((a, b) => (a[1].sort || 0) - (b[1].sort || 0)))
        console.log('items', this.items)
      }

      // Build character actions.
      if (this.actorType === 'character') {
        this.#buildCharacterActions()
      } else if (!this.actor) {
        this.#buildMultipleTokenActions()
      }

      // Build generic actions.
      this.#buildCombat();
    }

    /**
     * Build character actions
     * @private
     */
    #buildCharacterActions () {
      this.#buildInventory();
      this.#buildAbilities();
    }

    /**
     * Build multiple token actions
     * @private
     * @returns {object}
     */
    #buildMultipleTokenActions () {
    }

    /**
     * Build inventory
     * @private
     */
    async #buildInventory () {
      if (this.items.size === 0) return

      const actionTypeId = 'item'
      const inventoryMap = new Map()
      const powerMap = new Map()

      for (const [itemId, itemData] of this.items) {
        const type = itemData.type

        if (type === 'power') {
          const powerType = itemData.system.powerType.value ?? 'other'
          const typeMap = powerMap.get(powerType) ?? new Map()
          typeMap.set(itemId, itemData)
          powerMap.set(powerType, typeMap)
        } else {
          const typeMap = inventoryMap.get(type) ?? new Map()
          typeMap.set(itemId, itemData)
          inventoryMap.set(type, typeMap)
        }
      }

      for (const [type, typeMap] of inventoryMap) {
        const groupId = ITEM_TYPE[type]?.groupId
        if (!groupId) continue

        const groupData = { id: groupId, type: 'system' }

        // Get actions
        const actions = [...typeMap].map(([itemId, itemData]) => {
          const id = itemId
          const name = itemData.name
          const img = itemData.img
          const actionTypeName = coreModule.api.Utils.i18n(ACTION_TYPE[actionTypeId])
          const listName = `${actionTypeName ? `${actionTypeName}: ` : ''}${name}`
          const encodedValue = [actionTypeId, id].join(this.delimiter)
          const cssClass = itemData.type === 'power'
            ? `power ${Utils.getPowerClasses(itemData.system.powerUsage.value)[0]}`
            : ''

          return {
            id,
            name,
            img,
            listName,
            encodedValue,
            cssClass
          }
        })

        // TAH Core method to add actions to the action list
        this.addActions(actions, groupData)
      }

      for (const [type, typeMap] of powerMap) {
        const groupData = { id: type, type: 'system' }
        const actions = [...typeMap].map(([itemId, itemData]) => {
          const id = itemId
          let name = itemData.name
          const img = itemData.img
          const actionTypeName = coreModule.api.Utils.i18n(ACTION_TYPE[actionTypeId])
          const listName = `${actionTypeName ? `${actionTypeName}: ` : ''}${name}`
          const encodedValue = [actionTypeId, id].join(this.delimiter)
          const cssClass = `power ${Utils.getPowerClasses(itemData.system.powerUsage.value)[0]}`

          if (itemData.system.actionType.value) {
            name = `${'[' + CONFIG.ARCHMAGE.actionTypesShort?.[itemData.system.actionType.value] + '] '}${name}`
          }

          if (itemData.system.maxQuantity.value) {
            const current = Number(itemData.system.quantity.value ?? 0)
            const max = Number(itemData.system.maxQuantity.value ?? 0)
            name = `[${current}/${max}] ${name}`
          }

          return {
            id,
            name,
            img,
            listName,
            encodedValue,
            cssClass
          }
        })

        this.addActions(actions, groupData)
      }
    }

    /**
     * Build abilities actions.
     * @private
     */
    #buildAbilities() {
      if (this.actors.length === 0) return;
      const actionType = 'ability';

      // Abilities.
      const abilityTypes = {
        str: { name: coreModule.api.Utils.i18n('ARCHMAGE.str.label')},
        dex: { name: coreModule.api.Utils.i18n('ARCHMAGE.dex.label')},
        con: { name: coreModule.api.Utils.i18n('ARCHMAGE.con.label')},
        int: { name: coreModule.api.Utils.i18n('ARCHMAGE.int.label')},
        wis: { name: coreModule.api.Utils.i18n('ARCHMAGE.wis.label')},
        cha: { name: coreModule.api.Utils.i18n('ARCHMAGE.cha.label')},
      }

      const abilityActions = Object.entries(abilityTypes).map((abilityType) => {
        const id = abilityType[0];
        const name = abilityType[1].name;
        const encodedValue = [actionType, id].join(this.delimiter);
        return {
          id,
          name,
          encodedValue,
        }
      });

      const abilityGroupData = { id: 'ability', type: 'system' };
      this.addActions(abilityActions, abilityGroupData);

      // Backgrounds.
      const backgroundTypes = {};
      if (this.actor) {
        Object.entries(this.actor.system.backgrounds).filter((backgroundType) => {
          console.log('bg', backgroundType);
          return backgroundType[1].isActive.value;
        })
        .forEach((backgroundType) => {
          console.log('bg2', backgroundType);
          backgroundTypes[backgroundType[0]] = { name: backgroundType[1].name.value };
        });
      }

      const backgroundActions = Object.entries(backgroundTypes).map((backgroundType) => {
        const id = backgroundType[0];
        const name = backgroundType[1].name;
        const encodedValue = [actionType, id].join(this.delimiter);
        return {
          id,
          name,
          encodedValue,
        }
      });

      const backgroundGroupData = { id: 'background', type: 'system' };
      this.addActions(backgroundActions, backgroundGroupData);
    }

    /**
     * Build combat actions.
     * @private
     */
    #buildCombat() {
      if (this.actors.length === 0) return;
      const actionType = 'combat';

      const combatTypes = {
        initiative: { name: coreModule.api.Utils.i18n('ARCHMAGE.initiative')},
        endTurn: { name: coreModule.api.Utils.i18n('tokenActionHud.endTurn')}
      }

      // Remove initiative if the actor already has it.
      if (this.token) {
        const combatant = game.combat?.combatants.find(c => c.tokenId == this.token.id);
        if (combatant?.initiative || combatant?.initiative === 0) {
          delete combatTypes.initiative;
        }
      }

      const actions = Object.entries(combatTypes).map((combatType) => {
        const id = combatType[0];
        const name = combatType[1].name;
        const encodedValue = [actionType, id].join(this.delimiter);
        return {
          id,
          name,
          encodedValue,
        }
      });

      
      const groupData = { id: 'combat', type: 'system' };
      this.addActions(actions, groupData);
    }
  }
})
