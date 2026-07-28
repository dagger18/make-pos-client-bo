export const filterConfigs = [
  { key: 'countryCode', label: 'Country Code', type: 'text' },
  { key: 'taxType', label: 'Tax Type', type: 'text' },
]

export const headers = () => [
  { title: 'Country', key: 'countryCode', width: 90 },
  { title: 'Tax Code', key: 'taxCode' },
  { title: 'Tax Type', key: 'taxType' },
  { title: 'Rate %', key: 'taxRate', renderObject: (item) => `${(item.taxRate * 100).toFixed(2)}%`, align: 'end', width: 80 },
  { title: 'Category', key: 'chargeCategory' },
  { title: 'Service', key: 'serviceType' },
  { title: 'Customer', key: 'customerType' },
  { title: 'Flags', key: 'flags', renderSlot: 'flags' },
  { title: 'Effective From', key: 'effectiveFrom', width: 120 },
  { title: 'Effective To', key: 'effectiveTo', width: 110 },
  { title: '', key: 'action', renderSlot: 'action', sortable: false, width: 80 },
]
