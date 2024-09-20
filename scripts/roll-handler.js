export let RollHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
  /**
   * Extends Token Action HUD Core's RollHandler class and handles action events triggered when an action is clicked
   */
  RollHandler = class RollHandler extends coreModule.api.RollHandler {
    /**
     * Handle action click
     * Called by Token Action HUD Core when an action is left or right-clicked
     * @override
     * @param {object} event        The event
     * @param {string} encodedValue The encoded value
     */
    async handleActionClick (event, encodedValue) {
      const [actionTypeId, actionId] = encodedValue.split('|')

      const renderable = ['item']

      if (renderable.includes(actionTypeId) && this.isRenderItem()) {
        return this.doRenderItem(this.actor, actionId)
      }

      const knownCharacters = ['character', 'npc']

      // If single actor is selected
      if (this.actor) {
        await this.#handleAction(event, this.actor, this.token, actionTypeId, actionId)
        return
      }

      const controlledTokens = canvas.tokens.controlled
        .filter((token) => knownCharacters.includes(token.actor?.type))

      // If multiple actors are selected
      for (const token of controlledTokens) {
        const actor = token.actor
        await this.#handleAction(event, actor, token, actionTypeId, actionId)
      }
    }

    /**
     * Handle action hover
     * Called by Token Action HUD Core when an action is hovered on or off
     * @override
     * @param {object} event        The event
     * @param {string} encodedValue The encoded value
     */
    async handleActionHover (event, encodedValue) {}

    /**
     * Handle group click
     * Called by Token Action HUD Core when a group is right-clicked while the HUD is locked
     * @override
     * @param {object} event The event
     * @param {object} group The group
     */
    async handleGroupClick (event, group) {}

    /**
     * Handle action
     * @private
     * @param {object} event        The event
     * @param {object} actor        The actor
     * @param {object} token        The token
     * @param {string} actionTypeId The action type id
     * @param {string} actionId     The actionId
     */
    async #handleAction (event, actor, token, actionTypeId, actionId) {
      switch (actionTypeId) {
        case 'item':
          this.#handleItemAction(event, actor, actionId)
          break
        case 'ability':
          this.#handleAbilityAction(event, actor, actionId)
          break
        case 'recovery':
          this.#handleRecoveryAction(event, actor, actionId)
          break
        case 'rest':
          this.#handleRestAction(event, actor, actionId)
          break
        case 'saves':
          this.#handleSavesAction(event, actor, actionId)
          break
        case 'combat':
          this.#handleCombatAction(token, actionId)
          break
        case 'condition':
          this.#handleEffectAction(event, actor, actionTypeId, actionId)
          break;
        case 'effect':
          this.#handleEffectAction(event, actor, actionTypeId, actionId)
          break;
      }
    }

    /**
     * Handle item action
     * @private
     * @param {object} event    The event
     * @param {object} actor    The actor
     * @param {string} actionId The action id
     */
    #handleItemAction (event, actor, actionId) {
      const item = actor.items.get(actionId)
      item.roll(event)
    }

    #handleAbilityAction(event, actor, actionId) {
      if (['str','dex','con','int','wis','cha'].includes(actionId)) {
        actor.rollAbility(actionId);
      }
      else if (actor.system.backgrounds?.[actionId]) {
        actor.rollAbility(null, actor.system.backgrounds[actionId].name.value);
      }
    }

    #handleRecoveryAction(event, actor, actionId) {
      switch (actionId) {
        case 'recovery':
          actor.rollRecoveryDialog();
          break;
      }
    }

    #handleRestAction(event, actor, actionId) {
      switch (actionId) {
        case 'fullHeal':
          actor.restFull();
          break;
        case 'quickRest':
          actor.restQuick();
          break;
      }
    }

    #handleSavesAction(event, actor, actionId) {
      if (['easy', 'normal', 'hard', 'death', 'lastGasp'].includes(actionId)) {
        actor.rollSave(actionId);
      }
    }

    /**
     * Handle utility action
     * @private
     * @param {object} token    The token
     * @param {string} actionId The action id
     */
    async #handleCombatAction (token, actionId) {
      const actor = token.actor;
      switch (actionId) {
        case 'initiative':
          let combatant = game.combat?.combatants.find(c => c.tokenId == token.id);
          if (combatant) {
            game.combat.rollInitiative([combatant.id]);
          }
          else {
            actor.rollInitiative({createCombatants: true});
          }
          break

        case 'disengage':
          actor.rollDisengage();
          break;

        case 'endTurn':
          if (game.combat?.current?.tokenId === token.id) {
            await game.combat?.nextTurn()
          }
          break
      }
    }

    #handleEffectAction(event, actor, actionTypeId, actionId) {
      let updated = false;
      if (actionTypeId === 'condition') {
        let status = actor.effects.find(e => [...e.statuses.values()].includes(actionId));
        // Toggle existing conditions.
        if (status) {
          status.update({disabled: !status.disabled});
          updated = true;
        }
        // Add missing conditions.
        else {
          status = CONFIG.statusEffects.find(e => e.id === actionId);
          const effectData = foundry.utils.duplicate(status);
          effectData.label = game.i18n.localize(status.name);
          effectData.name = effectData.label;
          effectData.statuses = [actionId];
          if (status) {
            actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
            updated = true;
          }
        }
      }

      if (actionTypeId === 'effect') {
        const effect = actor.effects.get(actionId);
        if (effect) {
          effect.update({disabled: !effect.disabled});
          updated = true;
        }
      }

      // Update the DOM for the class.
      if (updated) {
        const target = event?.target ?? event?.currentTarget;
        const button = target.closest('.toggle');
        if (button) {
          button.classList.toggle('active');
        }
      }
    }

  }
})
