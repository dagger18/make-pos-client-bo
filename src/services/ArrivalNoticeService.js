import CommonService from '@/services/CommonService'
import { useAuthStore } from '@/stores/authStore'
const BASE_URI = 'arrival-notice'
export default {
  list (params = '') {
    return $api(`${BASE_URI}?${params}`)
  },

  get (id) {
    return $api(`${BASE_URI}/${id}`)
  },

  add (entity) {
    return $api(`${BASE_URI}`, {
      method: 'POST',
      body: CommonService.formData(entity),
      loading: true
    })
  },

  update (entity) {
    return $api(`${BASE_URI}/${entity.id}`, {
      method: 'PUT',
      body: CommonService.formData(entity),
      loading: true
    })
  },

  delete (id) {
    return $api(`${BASE_URI}/${id}`, { method: 'DELETE', loading: true })
  },

  downloadPdf (shipment, arrivalNoticeId, language) {
    const { accessToken, user } = useAuthStore()
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const params = {
      YXV0aFRva2Vu: accessToken,
      ZW1haWw: user.email,
      timezone,
      parentId: shipment.id,
      parentType: 'shipment',
      parentProperty: 'arrivalNotice'
    }
    return `${baseApiUrl}/${BASE_URI}/pdf/${language}/${arrivalNoticeId}?${new URLSearchParams(params).toString()}`
  },

  previewPdf (arrivalNoticeId, language, shipmentId) {
    const { accessToken, user } = useAuthStore()
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const params = {
      YXV0aFRva2Vu: accessToken,
      ZW1haWw: user.email,
      timezone,
      parentId: shipmentId,
      parentType: 'shipment',
      parentProperty: 'arrivalNotice'
    }
    return `${baseApiUrl}/${BASE_URI}/pdf-preview/${language}/${arrivalNoticeId}?${new URLSearchParams(params).toString()}`
  },
}
