import CommonService from '@/services/CommonService'
const BASE_URI = 'exchange-rate-group'
export default {
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

  delete (id) {
    return $api(`${BASE_URI}/${id}`, {method: 'DELETE', loading: true})
  },

}
