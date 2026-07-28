export const filterConfigs = []

export const headers = () => [
  { title: 'Country', key: 'countryCode', width: 90 },
  { title: 'Tax Type', key: 'taxType' },
  { title: 'Registration No.', key: 'registrationNo' },
  { title: 'Primary', key: 'isPrimary', renderSlot: 'isPrimary', width: 80 },
  { title: 'Effective From', key: 'effectiveFrom', width: 120 },
  { title: 'Effective To', key: 'effectiveTo', width: 110 },
  { title: '', key: 'action', renderSlot: 'action', sortable: false, width: 80 },
]
