import AutoLoad from '@/config/enums/AutoLoadConfig'
import CommonService from '@/services/CommonService'
export const useAppStore = defineStore('appStore', {
  state: () => ({
    errorMessages: [],
    queuingBtnList: [],
    loadingBtnList: [],
    drawNavigationOut: 0,
    autoLoad: AutoLoad,
    confirm: null,
    cachedGetRequests: {},
    organizationInfo: useCookie('organizationInfo').value ?? null,
    newEntities: {
      shipment: 0,
      quote: 0,
      client: 0,
      provider: 0,
      accounting: 0,
      notification: 0,
    },
    exchangeRatesConfig: {},
    currencyFormatsCache: {},
    maintenance: false,
  }),
  getters: {
    getList: (state) => {
      return (name) => {
        if (!state.autoLoad[name].touched) {
          state.autoLoad[name].touched = 'loading'
          CommonService.autoLoad(state.autoLoad[name])
        }
        return state.autoLoad[name].list
      }
    },
    getCurrencyFormat: (state) => (code) => {
      if (!code) return null
      const cfg = state.exchangeRatesConfig
      if (cfg?.currency?.code === code) return cfg.currency
      for (const rate of cfg?.exchangeRates ?? []) {
        if (rate.fromCurrency?.code === code) return rate.fromCurrency
        if (rate.toCurrency?.code === code) return rate.toCurrency
      }
      return state.currencyFormatsCache[code] ?? null
    },
  },
  actions: {
    async fetchOrganizationInfo() {
      if (this.organizationInfo) {
        document.title = `${this.organizationInfo.name} - Back office`
        return
      }
      try {
        const provider = await $api('public/organization')
        if (provider?.name) {
          this.organizationInfo = provider
          useCookie('organizationInfo').value = provider
          document.title = `${provider.name} - Back office`
        }
      } catch {
        // silently fail — public route must not block on missing org info
      }
    },
    async fetchCurrencyFormat(code) {
      if (!code || this.currencyFormatsCache[code]) return
      this.currencyFormatsCache[code] = 'loading'
      try {
        const result = await $api(`currency?filters[0][0]=code&filters[0][1]=eq&filters[0][2]=${code}&limit=1`)
        const c = result?.list?.[0]
        this.currencyFormatsCache[code] = c
          ? { thousandSeparator: c.thousandSeparator, decimalSeparator: c.decimalSeparator, decimalPlaces: c.decimalPlaces }
          : null
      } catch {
        this.currencyFormatsCache[code] = null
      }
    },
    pushErrorMessage (message) {
      const exists = this.errorMessages.some(
                      m => (
                            m.code === message.code
                            && m.error === message.error
                          )
                          || (
                            m.status === message.status
                            && m.detail === message.detail
                          )
                    )
      if(!exists) {
        this.errorMessages.push(message)
      }
    },
    async fetchList (name) {
      if (!this.autoLoad[name].touched) {
        this.autoLoad[name].touched = 'loading'
        await CommonService.autoLoad(this.autoLoad[name])
      }
      if (this.autoLoad[name].touched === 'loaded') {
        return this.autoLoad[name].list
      }
      await new Promise(r => setTimeout(r, 100));
      return await this.fetchList (name)
    },
    async fetchListCached (url) {
      if(this.cachedGetRequests.hasOwnProperty(url)) {
        if(this.cachedGetRequests[url] === 'loading') {
          return await new Promise(resolve => setTimeout(async () => {
            resolve(await this.fetchListCached(url))
          }, 1000));
        }
        return this.cachedGetRequests[url]
      }
      this.cachedGetRequests[url] = 'loading'
      const data = await $api(url)
      this.cachedGetRequests[url] = data
      return data 
    },
    startLoading () {
      const lastBtn = this.queuingBtnList.pop()
      if (lastBtn) {
        const clone = JSON.parse(JSON.stringify(this.loadingBtnList))
        clone.push(lastBtn)
        this.loadingBtnList = clone
        return lastBtn
      }
      return false
    },
    endLoading (componentId) {
      if (componentId === false) return
      const index = this.loadingBtnList
        .findIndex(
          btn => btn === componentId
        )
      if (index === -1) return
      const clone = JSON.parse(JSON.stringify(this.loadingBtnList))
      clone.splice(index, 1)
      this.loadingBtnList = clone
    },
    setMaintenance(value) {
      this.maintenance = value
    }
  },
})
