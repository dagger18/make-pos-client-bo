import { router } from '@/plugins/1.router';
import { ability } from '@/plugins/casl';
import UserService from '@/services/UserService';
import MyProfileService from '@/services/MyProfileService';
import {useAppStore} from '@/stores/appStore';
import { loadLocale } from '@/plugins/gettext'
export const useAuthStore = defineStore('authStore', {
  state: () => ({
    accessToken: useCookie('accessToken').value,
    user: useCookie('user').value,
    userAbilityRules: useCookie('userAbilityRules').value,
    organizationConfig: useCookie('organizationConfig').value,
    featureConfig: null
  }),
  actions: {
    async login (response, route) {
      const { accessToken, user, userAbilityRules } = response
      const userWithoutTableConfig = JSON.parse(JSON.stringify(user))
      userWithoutTableConfig.tableConfig = null
      console.log('loging in userAbilityRules', userAbilityRules)
      useCookie('userAbilityRules').value = userAbilityRules
      useCookie('user').value = userWithoutTableConfig
      useCookie('accessToken').value = accessToken
      ability.update(useCookie('userAbilityRules').value)
      this.user = userWithoutTableConfig
      this.accessToken = accessToken
      this.userAbilityRules = useCookie('userAbilityRules').value
      loadLocale(userWithoutTableConfig.language ?? 'en')
      router.push(route.query.to ? String(route.query.to) : {name: 'first-route'})
    },
    logout () {
      useCookie('user').value = null
      useCookie('accessToken').value = null
      useCookie('userAbilityRules').value = null
      this.user = null
      this.accessToken = null
      this.userAbilityRules = null
      ability.update({
        action: 'GET',
        subject: 'Auth',
      })
      router.push('/login')
    },
    async saveTableConfig (property, config, route) {
      if(!this.user.tableConfig) {
        this.user.tableConfig = {}
      }
      if(!this.user.tableConfig[route.fullPath] || typeof this.user.tableConfig[route.fullPath] == "string") {
        this.user.tableConfig[route.fullPath] = {}
      }
      this.user.tableConfig[route.fullPath][property] = config.join(',')
      // beautify form data
      const formData = {id: this.user.id}
      Object.keys(this.user.tableConfig).forEach(routePath => {
        if(typeof this.user.tableConfig[routePath] === "string") {
          this.user.tableConfig[routePath] = {}
        }
        else if (typeof this.user.tableConfig[routePath] == "object") {
          Object.keys(this.user.tableConfig[routePath]).forEach(propertyKey => {
            formData[`tableConfig[${routePath}][${propertyKey}]`] = this.user.tableConfig[routePath][propertyKey]
          })
        }
      })
      const response = await MyProfileService.profile(formData)
      // useCookie('user').value = response
      // this.user = response
    },
    clearSession () {
      useCookie('accessToken').value = null
      useCookie('user').value = null
      useCookie('userAbilityRules').value = null
      useCookie('organizationConfig').value = null
      this.accessToken = null
      this.user = null
      this.userAbilityRules = null
      this.organizationConfig = null
    },
    markProviderReady () {
      if (this.organizationConfig) {
        this.organizationConfig.providerReady = true
      }
    },
    markOrgInitialized () {
      if (this.organizationConfig) {
        this.organizationConfig.isInit = 1
      }
    },
    setLanguage (lang) {
      if (!this.user) return
      this.user.language = lang
      // Write back to the cookie so the preference survives a page refresh
      const cookie = useCookie('user')
      if (cookie.value) {
        cookie.value = { ...cookie.value, language: lang }
      }
    },
    async clearTableConfig () {
      await $api('my-profile/table-config', { method: 'DELETE' })
      this.user.tableConfig = null
      const cookie = useCookie('user')
      if (cookie.value) {
        cookie.value = { ...cookie.value, tableConfig: null }
      }
    },
    async setTableConfig (to = null) {
      loadLocale(this.user?.language ?? 'en')
      if(!!this.user.tableConfig) return
      const response = await MyProfileService.getTableConfig()
      this.user.tableConfig = response.tableConfig ?? {}
      // this one is for admin organization stuff, if you are admin, of course
      this.organizationConfig = response.organizationConfig
      this.featureConfig = response.featureConfig ?? []
      useAppStore().exchangeRatesConfig = response.exchangeRatesConfig
      if(this.organizationConfig?.isInit !== undefined && !this.organizationConfig.isInit) {
        const target = to ?? router.currentRoute.value
        if (!this.organizationConfig.providerReady) {
          // Step 1: configure company profile
          if (!(target.name === 'provider-id-id' && target.params?.id == 1)) {
            router.push({ name: 'provider-id-id', params: { id: 1 }, query: { mode: 'init' } })
          }
        } else {
          // Step 2: configure exchange rate (popup opens automatically on the provider page)
          if (!(target.name === 'provider-id-id' && target.params?.id == 1)) {
            router.push({ name: 'provider-id-id', params: { id: 1 }, query: { mode: 'init', step: 'exchange-rate' } })
          }
        }
      }
    }
  }
})
