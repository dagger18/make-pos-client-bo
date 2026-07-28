import CommonService from '@/services/CommonService'
import { useAppStore } from '@/stores/appStore'
const BASE_URI = 'invoice-info'
export default {
  listCacheable (params) {
    const appStore = useAppStore()
    return appStore.fetchListCached(`${BASE_URI}?${params}`)
  },
  list (params = '') {
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

  delete (id, parent) {
    return $api(`${BASE_URI}/${id}` + (parent ? ('?' + new URLSearchParams(parent).toString()) : ''), {
      method: 'DELETE',
      loading: true
    }).catch((err) => {
      return {error: err}
    })
  }

}
