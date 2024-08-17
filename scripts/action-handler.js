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
      }

      // Build character actions.
      if (this.actorType === 'character') {
        this.#buildCharacterActions()
      }
      else if (this.actorType === 'npc') {
        this.#buildNpcActions()
      } else if (!this.actor) {
        this.#buildMultipleTokenActions()
      }

      // Build generic actions.
      this.#buildCombat();
      this.#buildEffects();
    }

    /**
     * Build character actions
     * @private
     */
    #buildCharacterActions () {
      this.#buildInventory();
      this.#buildAbilities();
      this.#buildRecovery();
    }

    #buildNpcActions () {
      this.#buildNpcInventory();
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
     * Build inventory
     * @private
     */
    async #buildNpcInventory () {
      if (this.items.size === 0) return

      const actionTypeId = 'item'
      const actionMap = new Map()

      for (const [itemId, itemData] of this.items) {
        const type = itemData.type
        const typeMap = actionMap.get(type) ?? new Map()
        typeMap.set(itemId, itemData)
        actionMap.set(type, typeMap)
      }

      for (const [type, typeMap] of actionMap) {
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

          return {
            id,
            name,
            img,
            listName,
            encodedValue,
          }
        })

        // TAH Core method to add actions to the action list
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
        const cssClass = `power recharge`;
        return {
          id,
          name,
          encodedValue,
          cssClass,
        }
      });

      const abilityGroupData = { id: 'ability', type: 'system' };
      this.addActions(abilityActions, abilityGroupData);

      // Backgrounds.
      const backgroundTypes = {};
      if (this.actor) {
        Object.entries(this.actor.system.backgrounds).filter((backgroundType) => {
          return backgroundType[1].isActive.value;
        })
        .forEach((backgroundType) => {
          backgroundTypes[backgroundType[0]] = { name: backgroundType[1].name.value };
        });
      }

      const backgroundActions = Object.entries(backgroundTypes).map((backgroundType) => {
        const id = backgroundType[0];
        const name = backgroundType[1].name;
        const encodedValue = [actionType, id].join(this.delimiter);
        const cssClass = `power other`;
        return {
          id,
          name,
          encodedValue,
          cssClass
        }
      });

      const backgroundGroupData = { id: 'background', type: 'system' };
      this.addActions(backgroundActions, backgroundGroupData);

      // Icons.
      // @todo icon relationship rolls are not yet possible using only
      // the actor document. Revisit this in a later release.
    }

    #buildRecovery() {
      if (this.actors.length === 0) return;
      
      // Recoveries
      const recoveryTypes = {
        recovery: { name: coreModule.api.Utils.i18n('ARCHMAGE.CHARACTER.RESOURCES.recovery')}
      };
      const recoveryActions = Object.entries(recoveryTypes).map((recoveryType) => {
        const recoveries = this.actor.system.attributes.recoveries;
        const id = recoveryType[0];
        const name = `[${recoveries.value}/${recoveries.max}] ${recoveryType[1].name} (${recoveries.formula})`;
        const encodedValue = ['recovery', id].join(this.delimiter);
        const cssClass = `power at-will`;
        return {
          id,
          name,
          encodedValue,
          cssClass,
        }
      });
      this.addActions(recoveryActions, {id: 'recovery', type: 'system'});

      // Resting
      const restingTypes = {
        quickRest: { name: coreModule.api.Utils.i18n('ARCHMAGE.CHAT.QuickRest'), usage: 'once-per-battle'},
        fullHeal: { name: coreModule.api.Utils.i18n('ARCHMAGE.CHAT.FullHeal'), usage: 'daily'}
      }
      const restActions = Object.entries(restingTypes).map((restingType) => {
        const id = restingType[0];
        const name = restingType[1].name;
        const encodedValue = ['rest', id].join(this.delimiter);
        const cssClass = `power ${restingType[1].usage}`;
        return {
          id,
          name,
          encodedValue,
          cssClass,
        }
      });
      this.addActions(restActions, {id: 'rest', type: 'system'});
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
        disengage: { name: coreModule.api.Utils.i18n('ARCHMAGE.SAVE.disengage')},
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

      // Saves
      const saveTypes = {
        easy: { name: `${coreModule.api.Utils.i18n('ARCHMAGE.SAVE.easy')} (6+)`},
        normal: { name: `${coreModule.api.Utils.i18n('ARCHMAGE.SAVE.normal')} (11+)`},
        hard: { name: `${coreModule.api.Utils.i18n('ARCHMAGE.SAVE.hard')} (16+)`},
        death: { name: `${coreModule.api.Utils.i18n('ARCHMAGE.SAVE.death')} (16+)`},
        lastGasp: { name: `${coreModule.api.Utils.i18n('ARCHMAGE.SAVE.lastGasp')} (16+)`},
      }
      const saveActions = Object.entries(saveTypes).map((saveType) => {
        const id = saveType[0];
        const name = saveType[1].name;
        const encodedValue = ['saves', id].join(this.delimiter);
        return {
          id,
          name,
          encodedValue,
        }
      });
      this.addActions(saveActions, {id: 'saves', type: 'system'});
      
      const groupData = { id: 'combat', type: 'system' };
      this.addActions(actions, groupData);
    }

    #buildEffects() {
      if (this.actors.length === 0) return;
      
      // Conditions.
      const conditionActions = [];
      CONFIG.statusEffects.forEach((statusEffect) => {
        const id = statusEffect.id;
        const name = coreModule.api.Utils.i18n(statusEffect.name);
        const encodedValue = ['condition', id].join(this.delimiter);
        const img = statusEffect?.img ?? statusEffect?.icon;
        const tooltip = game.tokenActionHud13thAge.journals.find(j => j.id == statusEffect.journal)?.description ?? coreModule.api.Utils.i18n(name);

        const active = this.actor.effects.find(e => [...e.statuses.values()].includes(id));
        const cssClass = !active || active?.disabled ? 'toggle' : 'toggle active';

        conditionActions.push({
          id,
          name,
          encodedValue,
          cssClass,
          img,
          tooltip,
        });
      });
      this.addActions(conditionActions, {id: 'condition', type: 'system'});

      // Custom effects.
      if (this.actor) {
        const effectActions = [];
        this.actor.effects?.entries()?.forEach((effect) => {
          // Avoid status effects, which are covered by the conditions.
          if (effect[1].statuses.size > 0) {
            return;
          }

          const id = effect[0];
          const name = effect[1].name;
          const encodedValue = ['effect', id].join(this.delimiter);
          const img = effect[1]?.img ?? effect[1]?.icon;
          const active = !effect[1].disabled;
          const cssClass = !active || active?.disabled ? 'toggle' : 'toggle active';

          effectActions.push({
            id,
            name,
            encodedValue,
            cssClass,
            img,
          });
        });
        this.addActions(effectActions, {id: 'effect', type: 'system'});
      }
    }
  }
})
