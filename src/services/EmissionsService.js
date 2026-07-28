import { $api } from '@/utils/api'

const qs = (params) => {
  const s = new URLSearchParams(params).toString()
  return s ? '?' + s : ''
}

const EmissionsService = {
  // Emission Factors (admin library)
  listFactors(params = {}) {
    return $api(`emissions/factor${qs(params)}`)
  },
  createFactor(data) {
    return $api('emissions/factor', { method: 'POST', body: JSON.stringify(data) })
  },
  updateFactor(id, data) {
    return $api(`emissions/factor/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  deleteFactor(id) {
    return $api(`emissions/factor/${id}`, { method: 'DELETE' })
  },

  // Sea Distances
  listSeaDistances(params = {}) {
    return $api(`emissions/sea-distance${qs(params)}`)
  },
  saveSeaDistance(data) {
    return $api('emissions/sea-distance', { method: 'POST', body: JSON.stringify(data) })
  },
  deleteSeaDistance(id) {
    return $api(`emissions/sea-distance/${id}`, { method: 'DELETE' })
  },

  // Shipment Emissions
  listForShipment(shipmentId) {
    return $api(`emissions/shipment/${shipmentId}`)
  },
  calculate(shipmentId, data) {
    return $api(`emissions/calculate/${shipmentId}`, { method: 'POST', body: JSON.stringify(data) })
  },
  createManual(data) {
    return $api('emissions/manual', { method: 'POST', body: JSON.stringify(data) })
  },
  deleteRecord(id) {
    return $api(`emissions/record/${id}`, { method: 'DELETE' })
  },

  // CO2 Report
  getReport(params = {}) {
    return $api(`emissions/report${qs(params)}`)
  },
}

export default EmissionsService
