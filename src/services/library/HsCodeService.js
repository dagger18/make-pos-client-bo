import CommonService from '@/services/CommonService'

const BASE_URI = 'hs-code'

export default {
  list(params = '') {
    return $api(`${BASE_URI}?${params}`)
  },
  get(id) {
    return $api(`${BASE_URI}/${id}`)
  },
  add(entity) {
    return $api(BASE_URI, { method: 'POST', body: CommonService.formData(entity), loading: true })
  },
  update(entity) {
    return $api(BASE_URI, { method: 'PUT', body: CommonService.formData(entity), loading: true })
  },
  delete(id) {
    return $api(`${BASE_URI}/${id}`, { method: 'DELETE', loading: true })
  },
  search(q, limit = 20) {
    return $api(`${BASE_URI}/search?q=${encodeURIComponent(q)}&limit=${limit}`)
  },
  browse(parentId = 0) {
    return $api(`${BASE_URI}/browse/${parentId}`)
  },
}
