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
         * Build system actions
         * Called by Token Action HUD Core
         * @override
         * @param {array} groupIds
         */a
    async buildSystemActions (groupIds) {
      // Set actor and token variables
      this.actors = (!this.actor) ? this._getActors() : [this.actor]
      this.actorType = this.actor?.type

      // Set items variable
      if (this.actor) {
        this.items = new Map([...this.actor.items.entries()].sort((a, b) => (a[1].sort || 0) - (b[1].sort || 0)))
        console.log('items', this.items)
      }

      if (this.actorType === 'character') {
        this.#buildCharacterActions()
      } else if (!this.actor) {
        this.#buildMultipleTokenActions()
      }
    }

    /**
         * Build character actions
         * @private
         */
    #buildCharacterActions () {
      this.#buildInventory()
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
  }
})
