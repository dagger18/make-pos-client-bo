import { useAuthStore } from '@/stores/authStore'
const BASE = (shipmentId) => `shipment/${shipmentId}/dangerous-goods`

export default {
  list(shipmentId) {
    return $api(BASE(shipmentId))
  },
  create(shipmentId, payload) {
    return $api(BASE(shipmentId), {
      method: 'POST',
      body: JSON.stringify(payload),
      loading: true,
    })
  },
  update(shipmentId, dgId, payload) {
    return $api(`${BASE(shipmentId)}/${dgId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      loading: true,
    })
  },
  delete(shipmentId, dgId) {
    return $api(`${BASE(shipmentId)}/${dgId}`, {
      method: 'DELETE',
      loading: true,
    })
  },
  downloadPdf(shipment, language) {
    const { accessToken, user } = useAuthStore()
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const params = {
      YXV0aFRva2Vu: accessToken,
      ZW1haWw: user.email,
      timezone,
    }
    return `${baseApiUrl}/${BASE(shipment.id)}/pdf/${language}?${new URLSearchParams(params).toString()}`
  },
  previewPdfUrl(shipment, language) {
    const { accessToken, user } = useAuthStore()
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const params = {
      YXV0aFRva2Vu: accessToken,
      ZW1haWw: user.email,
      timezone,
    }
    return `${baseApiUrl}/${BASE(shipment.id)}/pdf-preview/${language}?${new URLSearchParams(params).toString()}`
  },
}
