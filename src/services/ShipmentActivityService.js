import CommonService from '@/services/CommonService'
const BASE_URI = 'shipment-activity'
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

  delete (id, parent = {}) {
    return $api(`${BASE_URI}/${id}` + (parent ? ('?' + new URLSearchParams(parent).toString()) : ''), {
      method: 'DELETE',
      loading: true
    }).catch((err) => {
      return {error: err}
    })
  },

}
