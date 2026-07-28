import { $api } from '@/utils/api'

const qs = (params) => {
  const s = new URLSearchParams(params).toString()
  return s ? '?' + s : ''
}

const LcService = {
  // Letter of Credit
  list(params = {})    { return $api(`lc${qs(params)}`) },
  get(id)              { return $api(`lc/${id}`) },
  create(data)         { return $api('lc', { method: 'POST', body: JSON.stringify(data) }) },
  update(id, data)     { return $api(`lc/${id}`, { method: 'PUT', body: JSON.stringify(data) }) },
  remove(id)           { return $api(`lc/${id}`, { method: 'DELETE' }) },
  setBlDate(id, data)  { return $api(`lc/${id}/set-bl-date`, { method: 'POST', body: JSON.stringify(data) }) },
  checkCompliance(id, data) { return $api(`lc/${id}/compliance-check`, { method: 'POST', body: JSON.stringify(data) }) },

  // Document Requirements
  listDocuments(lcId)           { return $api(`lc/${lcId}/documents`) },
  createDocument(lcId, data)    { return $api(`lc/${lcId}/documents`, { method: 'POST', body: JSON.stringify(data) }) },
  updateDocument(lcId, id, data){ return $api(`lc/${lcId}/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) }) },
  deleteDocument(lcId, id)      { return $api(`lc/${lcId}/documents/${id}`, { method: 'DELETE' }) },
  markReady(lcId, id, data)     { return $api(`lc/${lcId}/documents/${id}/mark-ready`, { method: 'POST', body: JSON.stringify(data) }) },

  // Discrepancies
  listDiscrepancies(lcId)           { return $api(`lc/${lcId}/discrepancies`) },
  createDiscrepancy(lcId, data)     { return $api(`lc/${lcId}/discrepancies`, { method: 'POST', body: JSON.stringify(data) }) },
  resolveDiscrepancy(lcId, id, data){ return $api(`lc/${lcId}/discrepancies/${id}/resolve`, { method: 'POST', body: JSON.stringify(data) }) },
  waiveDiscrepancy(lcId, id, data)  { return $api(`lc/${lcId}/discrepancies/${id}/waive`, { method: 'POST', body: JSON.stringify(data) }) },

  // Presentations
  listPresentations(lcId)        { return $api(`lc/${lcId}/presentations`) },
  createPresentation(lcId, data) { return $api(`lc/${lcId}/presentations`, { method: 'POST', body: JSON.stringify(data) }) },
  updatePresentation(lcId, id, data) { return $api(`lc/${lcId}/presentations/${id}`, { method: 'PUT', body: JSON.stringify(data) }) },
}

export default LcService
