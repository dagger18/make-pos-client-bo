export const filterConfigs = []

export const headers = () => [
  { title: 'Type', key: 'exemptionType' },
  { title: 'Country', key: 'countryCode', width: 90 },
  { title: 'Reference', key: 'exemptionRef' },
  { title: 'Valid From', key: 'validFrom', width: 120 },
  { title: 'Valid To', key: 'validTo', width: 110 },
  { title: '', key: 'action', renderSlot: 'action', sortable: false, width: 80 },
]
