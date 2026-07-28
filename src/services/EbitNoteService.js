import CommonService from '@/services/CommonService'
import { useAuthStore } from '@/stores/authStore'
import { baseApiUrl } from '@/utils/api'
const BASE_URI = 'ebit-note'
export default {
  list (params = '') {
    if(params.includes('export=true')) {
      return `${baseApiUrl}/${BASE_URI}?${params}`
    }
    return $api(`${BASE_URI}?${params}`)
  },

  get (id, parent) {
    return $api(`${BASE_URI}/${id}`+ (parent ? ('?' + new URLSearchParams(parent).toString()) : ''))
  },
  getAmountInWords (currency, amount) {
    return $api(`${BASE_URI}/get-amount-in-words/${currency}/${amount}`)
  },
  add (entity) {
    return $api(`${BASE_URI}`, {
      method: 'POST',
      body: CommonService.formData(entity),
      loading: true
    })
  },
  sendMail (entity) {
    console.log(entity, 'entity')
    entity.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return $api(`${BASE_URI}/send-email/${entity.debitId}`, {
      method: 'POST',
      body: CommonService.formData(entity),
      loading: true
    })
  },
  makeInvoice (id, parent) {
    return $api(`${BASE_URI}/make-invoice/${id}`, {
      method: 'POST',
      body: CommonService.formData(parent),
      loading: true
    })
  },

  cancelAllInvoices (id, parent) {
    return $api(`${BASE_URI}/cancel-all-invoices/${id}`, {
      method: 'POST',
      body: CommonService.formData(parent),
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
  downloadPdf (id, language, shipmentId) {
    const { accessToken, user } = useAuthStore()
    const email = user.email
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const params = {
      YXV0aFRva2Vu: accessToken,
      ZW1haWw: email,
      timezone,
      parentId: shipmentId, 
      parentType: 'shipment', 
      parentProperty: 'pdf'
    }
    const rawParams = new URLSearchParams(params).toString()

    return `${baseApiUrl}/ebit-note/pdf/${language}/${id}?${rawParams}`
  },
  downloadMonthlyPdf (entity) {
    return $api(`${BASE_URI}/download-monthly-pdf`, {
      method: 'POST',
      body: CommonService.formData(entity),
      loading: true
    })
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
      parentProperty: 'pdf'
    }
    const rawParams = new URLSearchParams(params).toString()
    return `${baseApiUrl}/ebit-note/pdf-preview/${language}/${id}?${rawParams}`
  },
  delete (id, parent) {
    return $api(`${BASE_URI}/${id}` + (parent ? ('?' + new URLSearchParams(parent).toString()) : ''), {
      method: 'DELETE',
      loading: true
    }).catch((err) => {
      return {error: err}
    })
  },
  updateExchangeRates (entity) {
    return $api(`${BASE_URI}/update-exchange-rates`, {
      method: 'POST',
      body: CommonService.formData(entity),
      loading: true
    })
  },
  markInvoiceDebit (entity) {
    return $api(`${BASE_URI}/mark-invoice-debit`, {
      method: 'POST',
      body: CommonService.formData(entity),
      loading: true
    })
  },
  approveVariance (id) {
    return $api(`${BASE_URI}/${id}/approve-variance`, {
      method: 'POST'
    })
  },
  disputeVariance (id) {
    return $api(`${BASE_URI}/${id}/dispute-variance`, {
      method: 'POST'
    })
  },
  lock (id) {
    return $api(`${BASE_URI}/${id}/lock`, {
      method: 'POST'
    })
  },
}
