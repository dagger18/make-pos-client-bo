import { $api } from '@/utils/api'

const SalesCrmService = {
  // Leads
  listLeads(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return $api(`crm/lead${qs ? '?' + qs : ''}`)
  },
  getLead(id) { return $api(`crm/lead/${id}`) },
  createLead(data) {
    return $api('crm/lead', { method: 'POST', body: JSON.stringify(data) })
  },
  updateLead(id, data) {
    return $api(`crm/lead/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  convertLead(id, clientId = null) {
    return $api(`crm/lead/${id}/convert`, { method: 'POST', body: JSON.stringify({ clientId }) })
  },
  deleteLead(id) { return $api(`crm/lead/${id}`, { method: 'DELETE' }) },

  // Opportunities
  listOpportunities(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return $api(`crm/opportunity${qs ? '?' + qs : ''}`)
  },
  getPipelineSummary() { return $api('crm/opportunity/pipeline-summary') },
  getOpportunity(id) { return $api(`crm/opportunity/${id}`) },
  createOpportunity(data) {
    return $api('crm/opportunity', { method: 'POST', body: JSON.stringify(data) })
  },
  updateOpportunity(id, data) {
    return $api(`crm/opportunity/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  closeOpportunity(id, data) {
    return $api(`crm/opportunity/${id}/close`, { method: 'POST', body: JSON.stringify(data) })
  },
  deleteOpportunity(id) { return $api(`crm/opportunity/${id}`, { method: 'DELETE' }) },

  // Activities
  listActivities(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return $api(`crm/activity${qs ? '?' + qs : ''}`)
  },
  createActivity(data) {
    return $api('crm/activity', { method: 'POST', body: JSON.stringify(data) })
  },
  updateActivity(id, data) {
    return $api(`crm/activity/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  deleteActivity(id) { return $api(`crm/activity/${id}`, { method: 'DELETE' }) },

  // Sales Targets
  listTargets(year) {
    return $api(`crm/sales-target?year=${year}`)
  },
  createTarget(data) {
    return $api('crm/sales-target', { method: 'POST', body: JSON.stringify(data) })
  },
  updateTarget(id, data) {
    return $api(`crm/sales-target/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  deleteTarget(id) { return $api(`crm/sales-target/${id}`, { method: 'DELETE' }) },

  // Commissions
  listCommissions(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return $api(`crm/commission${qs ? '?' + qs : ''}`)
  },
  createCommission(data) {
    return $api('crm/commission', { method: 'POST', body: JSON.stringify(data) })
  },
  updateCommission(id, data) {
    return $api(`crm/commission/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  approveCommission(id) {
    return $api(`crm/commission/${id}/approve`, { method: 'POST' })
  },
  payCommission(id) {
    return $api(`crm/commission/${id}/pay`, { method: 'POST' })
  },
  deleteCommission(id) { return $api(`crm/commission/${id}`, { method: 'DELETE' }) },
}

export default SalesCrmService
