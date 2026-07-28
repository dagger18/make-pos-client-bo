const BASE_URI = 'flight-schedule'

export default {
  search(origin, destination, date) {
    const params = new URLSearchParams({ origin, destination, date }).toString()
    return $api(`${BASE_URI}/search?${params}`)
  },
}
