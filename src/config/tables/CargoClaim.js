export const filterConfigs = [
  {
    key: 'claimType', label: 'Claim Type', type: 'select',
    options: ['LOSS', 'DAMAGE', 'DELAY', 'SHORT_DELIVERY'].map(v => ({ title: v.replace('_', ' '), value: v })),
  },
  {
    key: 'status', label: 'Status', type: 'select',
    options: ['OPEN', 'SETTLED', 'REJECTED', 'WITHDRAWN'].map(v => ({ title: v, value: v })),
  },
]

export const headers = () => [
  { title: 'Shipment', key: 'shipmentId', width: 90 },
  { title: 'Carrier', key: 'carrierName' },
  { title: 'Mode', key: 'transportMode', width: 70 },
  { title: 'Type', key: 'claimType' },
  { title: 'Date', key: 'claimDate', width: 110 },
  { title: 'Amount', key: 'claimAmount', renderObject: (item) => Number(item.claimAmount).toLocaleString(), align: 'end' },
  { title: 'CCY', key: 'currency', width: 60 },
  { title: 'Status', key: 'status', renderSlot: 'status', width: 110 },
  { title: '', key: 'action', renderSlot: 'action', sortable: false, width: 80 },
]
