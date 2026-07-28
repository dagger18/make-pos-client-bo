import { $api } from '@/utils/api'

const qs = (params) => {
  const s = new URLSearchParams(params).toString()
  return s ? '?' + s : ''
}

const ComplianceService = {
  // Audit Log
  listAuditLog(params = {}) {
    return $api(`compliance/audit-log${qs(params)}`)
  },
  getDashboard() {
    return $api('compliance/audit-log/dashboard')
  },
  logEvent(data) {
    return $api('compliance/audit-log', { method: 'POST', body: JSON.stringify(data) })
  },

  // Sanctions
  listSanctions(params = {}) {
    return $api(`compliance/sanctions${qs(params)}`)
  },
  getSanction(id) {
    return $api(`compliance/sanctions/${id}`)
  },
  checkSanctions(data) {
    return $api('compliance/sanctions/check', { method: 'POST', body: JSON.stringify(data) })
  },
  clearSanctionHit(id, data) {
    return $api(`compliance/sanctions/${id}/clear`, { method: 'POST', body: JSON.stringify(data) })
  },
  createSanction(data) {
    return $api('compliance/sanctions', { method: 'POST', body: JSON.stringify(data) })
  },
  updateSanction(id, data) {
    return $api(`compliance/sanctions/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  deleteSanction(id) {
    return $api(`compliance/sanctions/${id}`, { method: 'DELETE' })
  },

  // Data Retention
  listRetention(params) {
    return $api(`compliance/retention${params ? `?${params}` : ''}`)
  },
  createRetention(data) {
    return $api('compliance/retention', { method: 'POST', body: JSON.stringify(data) })
  },
  updateRetention(id, data) {
    return $api(`compliance/retention/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  deleteRetention(id) {
    return $api(`compliance/retention/${id}`, { method: 'DELETE' })
  },

  // GDPR
  eraseContact(data) {
    return $api('compliance/gdpr/erase', { method: 'POST', body: JSON.stringify(data) })
  },
  exportContactData(contactId) {
    return $api(`compliance/gdpr/export/${contactId}`)
  },
}

export default ComplianceService
