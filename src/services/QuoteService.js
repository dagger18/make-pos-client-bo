import CommonService from '@/services/CommonService'
import { useAuthStore } from '@/stores/authStore'
import { baseApiUrl } from '@/utils/api'
const BASE_URI = 'quote'
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

  delete (id, parent = {}) {
    return $api(`${BASE_URI}/${id}` + (parent ? ('?' + new URLSearchParams(parent).toString()) : ''), {
      method: 'DELETE',
      loading: true
    }).catch((err) => {
      return {error: err}
    })
  },

  downloadPdf (id, language) {
    const { accessToken, user } = useAuthStore()
    const email = user.email
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return `${baseApiUrl}/quote/pdf/${language}/${id}?YXV0aFRva2Vu=${accessToken}&ZW1haWw=${email}&timezone=${timezone}`
  },
  previewPdf (id, language) {
    const { accessToken, user } = useAuthStore()
    const email = user.email
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return `${baseApiUrl}/quote/pdf-preview/${language}/${id}?YXV0aFRva2Vu=${accessToken}&ZW1haWw=${email}&timezone=${timezone}`
  },
  makeShipment (id) {
    return $api(`${BASE_URI}/make-shipment/${id}`, {
      method: 'POST',
      loading: true
    })
  }
}
