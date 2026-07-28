import { useAuthStore } from '@/stores/authStore'

const BASE = 'consolidation'

export default {
  list (params = '') {
    return $api(`${BASE}?${params}`)
  },

  get (id) {
    return $api(`${BASE}/${id}`)
  },

  create (data) {
    return $api(BASE, { method: 'POST', body: data })
  },

  update (id, data) {
    return $api(`${BASE}/${id}`, { method: 'PUT', body: data })
  },

  close (id) {
    return $api(`${BASE}/${id}/close`, { method: 'PATCH' })
  },

  depart (id) {
    return $api(`${BASE}/${id}/depart`, { method: 'PATCH' })
  },

  arrive (id) {
    return $api(`${BASE}/${id}/arrive`, { method: 'PATCH' })
  },

  cancel (id) {
    return $api(`${BASE}/${id}`, { method: 'DELETE' })
  },

  addShipment (id, shipmentId) {
    return $api(`${BASE}/${id}/shipments`, { method: 'POST', body: { shipmentId } })
  },

  removeShipment (id, shipId) {
    return $api(`${BASE}/${id}/shipments/${shipId}`, { method: 'DELETE' })
  },

  downloadManifestPdf (id, language) {
    const { accessToken, user } = useAuthStore()
    const baseApiUrl = import.meta.env.VITE_API_URL
    const params = new URLSearchParams({
      YXV0aFRva2Vu: accessToken,
      ZW1haWw: user?.email ?? '',
    })
    return `${baseApiUrl}/${BASE}/${id}/manifest-pdf/${language}?${params}`
  },

  previewManifestPdf (id, language) {
    const { accessToken, user } = useAuthStore()
    const baseApiUrl = import.meta.env.VITE_API_URL
    const params = new URLSearchParams({
      YXV0aFRva2Vu: accessToken,
      ZW1haWw: user?.email ?? '',
    })
    return `${baseApiUrl}/${BASE}/${id}/manifest-pdf-preview/${language}?${params}`
  },
}
