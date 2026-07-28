import { $api } from '@/utils/api'

const CustomsEntryService = {
  list(shipmentId)            { return $api(`shipment/${shipmentId}/customs-entries`) },
  create(shipmentId, data)    { return $api(`shipment/${shipmentId}/customs-entries`, { method: 'POST', body: JSON.stringify(data) }) },
  update(shipmentId, id, data){ return $api(`shipment/${shipmentId}/customs-entries/${id}`, { method: 'PATCH', body: JSON.stringify(data) }) },
  remove(shipmentId, id)      { return $api(`shipment/${shipmentId}/customs-entries/${id}`, { method: 'DELETE' }) },
  submit(shipmentId, id)      { return $api(`shipment/${shipmentId}/customs-entries/${id}/submit`, { method: 'POST' }) },
  syncStatus(shipmentId, id)  { return $api(`shipment/${shipmentId}/customs-entries/${id}/sync-status`, { method: 'POST' }) },

  addLine(shipmentId, entryId, data)          { return $api(`shipment/${shipmentId}/customs-entries/${entryId}/lines`, { method: 'POST', body: JSON.stringify(data) }) },
  updateLine(shipmentId, entryId, lineId, data){ return $api(`shipment/${shipmentId}/customs-entries/${entryId}/lines/${lineId}`, { method: 'PATCH', body: JSON.stringify(data) }) },
  removeLine(shipmentId, entryId, lineId)     { return $api(`shipment/${shipmentId}/customs-entries/${entryId}/lines/${lineId}`, { method: 'DELETE' }) },
}

export default CustomsEntryService
