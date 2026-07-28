const BASE_URI = 'chart-of-account'
export default {
  list () {
    return $api(BASE_URI)
  },
  update (id, data) {
    return $api(`${BASE_URI}/${id}`, { method: 'PUT', body: data })
  },
}
