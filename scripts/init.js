import { SystemManager } from './system-manager.js'
import { MODULE, REQUIRED_CORE_MODULE_VERSION } from './constants.js'

Hooks.on('tokenActionHudCoreApiReady', async () => {
  /**
   * Return the SystemManager and requiredCoreModuleVersion to Token Action HUD Core
   */
  const module = game.modules.get(MODULE.ID)
  module.api = {
    requiredCoreModuleVersion: REQUIRED_CORE_MODULE_VERSION,
    SystemManager
  }
  Hooks.call('tokenActionHudSystemReady', module)

  game.tokenActionHud13thAge = {};
  game.packs.get('archmage.conditions').getDocuments().then(journals => {
    game.tokenActionHud13thAge.journals = journals.map(j => {
      return {
        id: j.id,
        uuid: j.uuid,
        name: j.name,
        description: [...j.pages.values()][0]?.text?.content ?? '',
      };
    });
  });
})
