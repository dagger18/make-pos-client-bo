const BASE_URI = 'config'
export default {
  get (name) {
    return $api(`${BASE_URI}/${name}`)
  },
  getShipmentIdTokens () {
    return $api(`${BASE_URI}/shipment-id-format/tokens`)
  },
  getQuoteCodeTokens () {
    return $api(`${BASE_URI}/quote-code-format/tokens`)
  },
  update (name, value) {
    return $api(`${BASE_URI}/${name}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
      loading: true
    })
  }
}
