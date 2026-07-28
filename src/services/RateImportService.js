const BASE = 'rate-import'

export default {
  list() {
    return $api(BASE)
  },
  get(id) {
    return $api(`${BASE}/${id}`)
  },
  upload(data) {
    const fd = new FormData()
    fd.append('file', data.file)
    fd.append('transportType', data.transportType)
    fd.append('effectiveDate', data.effectiveDate)
    fd.append('expiryDate', data.expiryDate)
    if (data.providerId) fd.append('providerId', data.providerId)
    if (data.currency) fd.append('currency', data.currency)
    return $api(BASE, { method: 'POST', body: fd, loading: true })
  },
  approve(id) {
    return $api(`${BASE}/${id}/approve`, { method: 'POST', loading: true })
  },
  rollback(id) {
    return $api(`${BASE}/${id}/rollback`, { method: 'POST', loading: true })
  },
}
