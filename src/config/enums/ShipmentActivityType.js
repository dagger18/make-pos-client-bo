import { findByValue as getShipmentStatus } from "./ShipmentStatus"
import { findByValue as getSubStatus } from "./SubStatus"
function list() {
  return [
    { 
      'enums': 'Create', 'value': 'CE', 'title': (activity, shipment) => {
        console.log(shipment,'create status')
        return $gettext('New shipment #%{code} created', {code: shipment.code})
      }
    },
    { 
      'enums': 'Replicate', 'value': 'RE', 'title': (activity, shipment) => {
        return $gettext('New shipment #%{code} created (replicated from #%{origin})', {code: shipment.code, origin: activity.subEntityId})
      } 
    },
    { 
      'enums': 'Update', 'value': 'UE', 'title': (activity, shipment) => {
        return $gettext('Shipment updated')
      } 
    },
    { 
      'enums': 'UpdateStatus', 'value': 'US', 'title': (activity, shipment) => {
        return $gettext('Shipment Status was changed from "%{from}" to "%{to}"', {
          from: getShipmentStatus(activity.changes[0]).title,
          to: getShipmentStatus(activity.changes[1]).title,
        })
      } 
    },
    { 
      'enums': 'SubUpdate', 'value': 'SU', 'title': (activity, shipment) => {
        if(activity.subEntityType === 'instruction') {
          return $gettext('Shipment instruction was modified')
        }
        if(activity.subEntityType === 'quote') {
          return $gettext('Pricing was modified')
        }
        if(activity.subEntityType === 'booking') {
          return $gettext('Booking information was modified')
        }
        if(activity.subEntityType === 'ebitnote') {
          if(activity.subEntityId.startsWith('DN_')) {
            return $gettext('Debit Note %{code} was modified', {code: activity.subEntityId})
          }
          if(activity.subEntityId.startsWith('CN_')) {
            return $gettext('Credit Note %{code} was modified', {code: activity.subEntityId})
          }
          if(activity.subEntityId.startsWith('INV_')) {
            return $gettext('Invoice %{code} was modified', {code: activity.subEntityId})
          }
          if(activity.subEntityId.startsWith('RPT_')) {
            return $gettext('Receipt %{code} was modified', {code: activity.subEntityId})
          }
          return $gettext('Credit Note %{code} was modified', {code: activity.subEntityId})
        }
      } 
    },
    { 
      'enums': 'SubDelete', 'value': 'SD', 'title': (activity, shipment) => {
        if(activity.subEntityType === 'ebitnote') {
          if(activity.subEntityId.startsWith('DN_')) {
            return $gettext('Debit Note %{code} was deleted', {code: activity.subEntityId})
          }
          if(activity.subEntityId.startsWith('CN_')) {
            return $gettext('Credit Note %{code} was deleted', {code: activity.subEntityId})
          }
          if(activity.subEntityId.startsWith('INV_')) {
            return $gettext('Invoice %{code} was deleted', {code: activity.subEntityId})
          }
          return $gettext('Credit Note %{code} was deleted', {code: activity.subEntityId})
        }
      } 
    },
    {
      'enums': 'UpdateSubStatus', 'value': 'USS', 'title': (activity, shipment) => {
        const from = activity.changes?.[0] ? (getSubStatus(activity.changes[0])?.title ?? activity.changes[0]) : $gettext('None')
        const to = activity.changes?.[1] ? (getSubStatus(activity.changes[1])?.title ?? activity.changes[1]) : $gettext('None')
        return $gettext('Sub-status changed from "%{from}" to "%{to}"', { from, to })
      }
    },
    {
      'enums': 'UpdateHold', 'value': 'UH', 'title': (activity, shipment) => {
        if (activity.changes?.[1]) {
          return $gettext('Shipment placed on hold: %{reason}', { reason: activity.subEntityId ?? '' })
        }
        return $gettext('Shipment hold removed')
      }
    },
    {
      'enums': 'SubCreate', 'value': 'SC', 'title': (activity, shipment) => {
        if(activity.subEntityType === 'ebitnote') {
          if(activity.subEntityId.startsWith('DN_')) {
            return $gettext('Debit Note %{code} was created', {code: activity.subEntityId})
          }
          if(activity.subEntityId.startsWith('CN_')) {
            return $gettext('Credit Note %{code} was created', {code: activity.subEntityId})
          }
          if(activity.subEntityId.startsWith('INV_')
            || activity.subEntityId.startsWith('IC')
            || activity.subEntityId.startsWith('ID')
          ) {
            return $gettext('Invoice %{code} was created', {code: activity.subEntityId})
          }
          if(activity.subEntityId.startsWith('RPT_')) {
            return $gettext('Receipt %{code} was created', {code: activity.subEntityId})
          }
        }
        if(activity.subEntityType === 'user') {
          return $gettext('%{code} has been invited to the shipment', {code: activity.subEntityId})
        }
        if(activity.subEntityType === 'payment-record' && activity.subEntityId.startsWith('PMT_')) {
          return $gettext('Payment record %{code} was created', {code: activity.subEntityId})
        }
        if(activity.subEntityType === 'document') {
          return $gettext('New document "%{name}" uploaded', {name: activity.subEntityId.replace('&quot;', '').replaceAll('"', '')})
        }
      } 
    }
  ]
}

export const enums = list().reduce(function(result, item, index) {
  result[item.enums] = item.value;
  return result;
}, {})
export const getList = list().map(({value, title}) => {return {value, title}})
export const getTitle = (findValue, activity, shipment) => {
  if(!findValue) return null
  const exists = list().find(({value}) => value === findValue)
  return exists?.title(activity, shipment) ?? $gettext('Unknown activity')
}

