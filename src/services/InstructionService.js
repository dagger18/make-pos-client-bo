import CommonService from '@/services/CommonService'
import { useAuthStore } from '@/stores/authStore'
const BASE_URI = 'instruction'
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
    return `${baseApiUrl}/instruction/pdf/${language}/${shipment.instruction.id}?${rawParams}`
  },
  previewPdf (id, language, shipmentId) {
    const { accessToken, user } = useAuthStore()
    const email = user.email
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const params = {
      YXV0aFRva2Vu: accessToken,
      ZW1haWw: email,
      timezone,
      parentId: shipmentId,
      parentType: 'shipment',
      parentProperty: 'instruction'
    }
    const rawParams = new URLSearchParams(params).toString()
    return `${baseApiUrl}/instruction/pdf-preview/${language}/${id}?${rawParams}`
  },
  downloadHawbPdf (shipment, language) {
    const { accessToken, user } = useAuthStore()
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const params = {
      YXV0aFRva2Vu: accessToken,
      ZW1haWw: user.email,
      timezone,
      parentId: shipment.id,
      parentType: 'shipment',
      parentProperty: 'pdf'
    }
    return `${baseApiUrl}/instruction/hawb-pdf/${language}/${shipment.instruction.id}?${new URLSearchParams(params).toString()}`
  },
  previewHawbPdf (id, language, shipmentId) {
    const { accessToken, user } = useAuthStore()
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const params = {
      YXV0aFRva2Vu: accessToken,
      ZW1haWw: user.email,
      timezone,
      parentId: shipmentId,
      parentType: 'shipment',
      parentProperty: 'instruction'
    }
    return `${baseApiUrl}/instruction/hawb-pdf-preview/${language}/${id}?${new URLSearchParams(params).toString()}`
  },
  downloadPackingListPdf (shipment, language) {
    const { accessToken, user } = useAuthStore()
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const params = {
      YXV0aFRva2Vu: accessToken,
      ZW1haWw: user.email,
      timezone,
      parentId: shipment.id,
      parentType: 'shipment',
      parentProperty: 'pdf'
    }
    return `${baseApiUrl}/instruction/packing-list-pdf/${language}/${shipment.instruction.id}?${new URLSearchParams(params).toString()}`
  },
}
