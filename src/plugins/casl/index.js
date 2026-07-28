import { createMongoAbility } from '@casl/ability'
import { abilitiesPlugin } from '@casl/vue'
const userAbilityRules = useCookie('userAbilityRules')
export const ability = createMongoAbility(userAbilityRules.value ?? [])
export default function (app) {
  app.use(abilitiesPlugin, ability, {
    useGlobalProperties: true,
  })
}
