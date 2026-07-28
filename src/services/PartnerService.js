const BASE_URI = 'client'
export default {
  list (params = '') {
    return $api(`${BASE_URI}?${params}`)
  },
}
