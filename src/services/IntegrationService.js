import { $api } from '@/utils/api'

const qs = (params) => {
  const p = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== ''))
  const s = new URLSearchParams(p).toString()
  return s ? '?' + s : ''
}

const IntegrationService = {
  // Connectors
  listConnectors(params = {})       { return $api(`integration/connectors${qs(params)}`) },
  createConnector(data)             { return $api('integration/connectors', { method: 'POST', body: JSON.stringify(data) }) },
  updateConnector(id, data)         { return $api(`integration/connectors/${id}`, { method: 'PATCH', body: JSON.stringify(data) }) },
  removeConnector(id)               { return $api(`integration/connectors/${id}`, { method: 'DELETE' }) },

  // Messages
  listMessages(params = {})         { return $api(`integration/messages${qs(params)}`) },
  getMessage(id)                    { return $api(`integration/messages/${id}`) },
  createMessage(data)               { return $api('integration/messages', { method: 'POST', body: JSON.stringify(data) }) },
  listShipmentMessages(shipmentId, params = {}) {
    return $api(`shipment/${shipmentId}/integration-messages${qs(params)}`)
  },
}

export default IntegrationService
