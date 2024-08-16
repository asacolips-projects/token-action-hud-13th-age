import { MODULE } from './constants.js'

export let Utils = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
  /**
   * Utility functions
   */
  Utils = class Utils {
    /**
     * Get setting
     * @param {string} key               The key
     * @param {string=null} defaultValue The default value
     * @returns {string}                 The setting value
     */
    static getSetting (key, defaultValue = null) {
      let value = defaultValue ?? null
      try {
        value = game.settings.get(MODULE.ID, key)
      } catch {
        coreModule.api.Logger.debug(`Setting '${key}' not found`)
      }
      return value
    }

    /**
     * Set setting
     * @param {string} key   The key
     * @param {string} value The value
     */
    static async setSetting (key, value) {
      try {
        value = await game.settings.set(MODULE.ID, key, value)
        coreModule.api.Logger.debug(`Setting '${key}' set to '${value}'`)
      } catch {
        coreModule.api.Logger.debug(`Setting '${key}' not found`)
      }
    }

    /**
     * Retrieve CSS classes for each power type.
     *
     * @param {string} inputString
     *
     * @returns {array}
     *   Returns an array with key 0 as the usage string, and key 1 as the
     *   recharge value.
     */
    static getPowerClasses (inputString) {
      // Get the appropriate usage.
      let usage = 'other'
      let recharge = 0
      const usageString = inputString !== null ? inputString.toLowerCase() : ''
      if (usageString.includes('will')) {
        usage = 'at-will'
      } else if (usageString.includes('recharge')) {
        usage = 'recharge'
        if (usageString.includes('16')) {
          recharge = 16
        } else if (usageString.includes('11')) {
          recharge = 11
        } else if (usageString.includes('6')) {
          recharge = 6
        }
      } else if (usageString.includes('battle') || usageString.includes('cyclic')) {
        usage = 'once-per-battle'
      } else if (usageString.includes('daily')) {
        usage = 'daily'
      }

      return [usage, recharge]
    }
  }
})
