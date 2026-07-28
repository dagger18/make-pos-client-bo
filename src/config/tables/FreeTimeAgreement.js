export const filterConfigs = [
  {
    key: 'direction', label: 'Direction', type: 'select',
    options: ['IMPORT', 'EXPORT'].map(v => ({ title: v, value: v })),
  },
  {
    key: 'freeType', label: 'Free Type', type: 'select',
    options: ['DETENTION', 'DEMURRAGE', 'COMBINED'].map(v => ({ title: v, value: v })),
  },
]

export const headers = () => [
  { title: 'Carrier', key: 'carrier', renderObject: (item) => item.carrier?.name ?? '—' },
  { title: 'Port', key: 'port', renderObject: (item) => item.port?.code ?? 'Any' },
  { title: 'Direction', key: 'direction' },
  { title: 'Type', key: 'freeType' },
  { title: 'Container', key: 'containerType', renderObject: (item) => item.containerType ?? 'Any' },
  { title: 'Free Days', key: 'freeDays', align: 'end', width: 90 },
  { title: 'Currency', key: 'currency', width: 80 },
  { title: 'Effective From', key: 'effectiveFrom', width: 120 },
  { title: 'Effective To', key: 'effectiveTo', renderObject: (item) => item.effectiveTo ?? 'Open', width: 110 },
  { title: '', key: 'action', renderSlot: 'action', sortable: false, width: 80 },
]
