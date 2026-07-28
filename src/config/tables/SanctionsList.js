export const filterConfigs = []

export const headers = () => [
  { title: 'List', key: 'listName', renderSlot: 'listName', width: 140 },
  { title: 'Name', key: 'listedName' },
  { title: 'Country', key: 'countryCode', width: 80 },
  { title: 'Type', key: 'entityType', width: 110 },
  { title: 'Programs', key: 'programs', renderObject: (item) => (item.programs ?? []).join(', ') || '—', width: 160 },
  { title: 'Listed Date', key: 'listedDate', width: 110 },
  { title: 'Active', key: 'isActive', renderSlot: 'isActive', width: 80 },
  { title: '', key: 'action', renderSlot: 'action', sortable: false, width: 80 },
]
