import CommonService from '@/services/CommonService'
import { useAppStore } from '@/stores/appStore'
const BASE_URI = 'client'
export default {
  listCacheable (params) {
    const appStore = useAppStore()
    return appStore.fetchListCached(`${BASE_URI}?${params}`)
  },
  list (params = '') {
    if(params.includes('export=true')) {
      return `${baseApiUrl}/${BASE_URI}?${params}`
    }
    return $api(`${BASE_URI}?${params}`)
  },

  get (id) {
    return $api(`${BASE_URI}/${id}`)
  },
  add (entity) {
    return $api(`${BASE_URI}`, {
      method: 'POST',
      body: CommonService.formData(entity),
      loading: true
    })
  },
  
  update (entity) {
    return $api(`${BASE_URI}/${entity.id}`, {
      method: 'PUT',
      body: CommonService.formData(entity),
      loading: true
    })
  },

  delete (id) {
    return $api(`${BASE_URI}/${id}`, {method: 'DELETE', loading: true})
  },

  updateCreditStatus(id, data) {
    return $api(`client/${id}/credit-status`, {
      method: 'PUT',
      body: CommonService.formData(data),
      loading: true
    })
  },

  checkDuplicates(name, taxNumber = '') {
    const params = new URLSearchParams({ name, taxNumber }).toString()
    return $api(`client/check-duplicates?${params}`)
  },

  getCreditCheck(id) {
    return $api(`client/${id}/credit-check`)
  },

  getCreditHistory(id) {
    return $api(`client/${id}/credit-history`)
  },

}
