const BASE_URI = 'journal'
export default {
  list (params = '') {
    return $api(`${BASE_URI}?${params}`)
  },
  get (id) {
    return $api(`${BASE_URI}/${id}`)
  },
  byEbitNote (id) {
    return $api(`${BASE_URI}?ebitNoteId=${id}`)
  },
}
