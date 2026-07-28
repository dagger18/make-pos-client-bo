import CommonService from '@/services/CommonService'
import { baseApiUrl } from '@/utils/api'
const BASE_URI = 'shipment'
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
  getActivities(id) {
    return $api(`${BASE_URI}/get-activities/${id}`)
  },
  getBooking(id) {
    return $api(`${BASE_URI}/${id}/booking`)
  },
  getQuote(id) {
    return $api(`${BASE_URI}/${id}/quote`)
  },
  getDocuments(id) {
    return $api(`${BASE_URI}/${id}/documents`)
  },
  getEbitNotes(id) {
    return $api(`${BASE_URI}/${id}/ebitnotes`)
  },
  getSubscribers(id) {
    return $api(`${BASE_URI}/${id}/subscribers`)
  },
  replicate (id) {
    return $api(`${BASE_URI}/replicate/${id}`, {
      method: 'POST',
      loading: true
    })
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

  hold (id, reason) {
    return $api(`${BASE_URI}/${id}/hold`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
      loading: true,
    })
  },

  unhold (id) {
    return $api(`${BASE_URI}/${id}/unhold`, {
      method: 'POST',
      loading: true,
    })
  },

  delete (id) {
    return $api(`${BASE_URI}/${id}`, {method: 'DELETE', loading: true})
  },

}
