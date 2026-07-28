const BASE_URI = 'price-markup'
const JSON_HEADERS = { 'Content-Type': 'application/json' }

export default {
  list(params = '') {
    return $api(`${BASE_URI}?${params}`)
  },

  get(id) {
    return $api(`${BASE_URI}/${id}`)
  },

  add(entity) {
    return $api(BASE_URI, {
      method: 'POST',
      body: JSON.stringify(entity),
      headers: JSON_HEADERS,
    })
  },

  update(entity) {
    return $api(`${BASE_URI}/${entity.id}`, {
      method: 'PUT',
      body: JSON.stringify(entity),
      headers: JSON_HEADERS,
    })
  },

  delete(id) {
    return $api(`${BASE_URI}/${id}`, { method: 'DELETE' })
  },
}
