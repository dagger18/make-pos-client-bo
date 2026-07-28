import CommonService from '@/services/CommonService'
import { useAuthStore } from '@/stores/authStore'
const BASE_URI = 'booking'
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
    return $api(`${BASE_URI}/${id}`, {method: 'DELETE', loading: true})
  },
  downloadPdf (shipment, language) {
    const { accessToken, user } = useAuthStore()
    const email = user.email
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const params = {
      YXV0aFRva2Vu: accessToken,
      ZW1haWw: email,
      timezone,
      parentId: shipment.id, 
      parentType: 'shipment', 
      parentProperty: 'pdf'
    }
    const rawParams = new URLSearchParams(params).toString()
    return `${baseApiUrl}/booking/pdf/${language}/${shipment.booking.id}?${rawParams}`
  },
  change (entity) {
    return $api(`${BASE_URI}/change`, {
      method: 'POST',
      body: CommonService.formData(entity),
      loading: true
    })
  },
}
