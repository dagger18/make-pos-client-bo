const BASE_URI = 'vessel-sailing'

export default {
  search(pol, pod, etdFrom, etdTo) {
    const params = new URLSearchParams({ pol, pod, etd_from: etdFrom, etd_to: etdTo }).toString()
    return $api(`${BASE_URI}/search?${params}`)
  },
}
