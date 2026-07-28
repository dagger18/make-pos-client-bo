const BASE_URI = 'report/ageing'
export default {
  arAgeing () { return $api(`${BASE_URI}/ar`) },
  apAgeing () { return $api(`${BASE_URI}/ap`) },
}
