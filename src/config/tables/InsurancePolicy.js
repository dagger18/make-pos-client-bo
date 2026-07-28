export const filterConfigs = [
  {
    key: 'policyType', label: 'Policy Type', type: 'select',
    options: ['OPEN_COVER', 'SPECIFIC_VOYAGE', 'LIABILITY'].map(v => ({ title: v.replace(/_/g, ' '), value: v })),
  },
  {
    key: 'isActive', label: 'Active', type: 'select',
    options: [{ title: 'Active', value: 'true' }, { title: 'Inactive', value: 'false' }],
  },
]

export const headers = () => [
  { title: 'Policy #', key: 'policyNumber' },
  { title: 'Insurer', key: 'insurer', renderObject: (item) => item.insurer?.name ?? '—' },
  { title: 'Type', key: 'policyType', renderSlot: 'policyType', width: 140 },
  { title: 'Coverage', key: 'coverageScope', width: 150 },
  { title: 'Max/Shipment', key: 'maxPerShipment', renderObject: (item) => Number(item.maxPerShipment).toLocaleString(), align: 'end' },
  { title: 'CCY', key: 'currency', width: 60 },
  { title: 'Rate / Flat', key: 'premiumRate', renderSlot: 'premiumRate', align: 'end' },
  { title: 'Modes', key: 'modesCovered', renderSlot: 'modesCovered' },
  { title: 'Effective', key: 'effectiveFrom', width: 110 },
  { title: 'Expiry', key: 'expiryDate', width: 110 },
  { title: 'Active', key: 'isActive', renderSlot: 'isActive', width: 70 },
  { title: '', key: 'action', renderSlot: 'action', sortable: false, width: 80 },
]
