import CommonService from '@/services/CommonService'
const BASE_URI = 'organisation-address'

export default {
  listByClient(clientId) { return $api(`${BASE_URI}?clientId=${clientId}`) },
  listByProvider(providerId) { return $api(`${BASE_URI}?providerId=${providerId}`) },
  add(data) { return $api(BASE_URI, { method: 'POST', body: CommonService.formData(data), loading: true }) },
  update(id, data) { return $api(`${BASE_URI}/${id}`, { method: 'PUT', body: CommonService.formData(data), loading: true }) },
  delete(id) { return $api(`${BASE_URI}/${id}`, { method: 'DELETE', loading: true }) },
}
