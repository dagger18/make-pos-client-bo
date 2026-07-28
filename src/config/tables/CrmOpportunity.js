const fmt = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })

export const filterConfigs = () => [
  { title: $gettext('Title'), value: 'title', type: 'text' },
  {
    title: $gettext('Stage'),
    value: 'stage',
    type: 'select',
    items: [
      { value: 'PROSPECTING',  title: $gettext('Prospecting') },
      { value: 'QUALIFICATION',title: $gettext('Qualification') },
      { value: 'PROPOSAL',     title: $gettext('Proposal') },
      { value: 'NEGOTIATION',  title: $gettext('Negotiation') },
      { value: 'CLOSED_WON',   title: $gettext('Closed Won') },
      { value: 'CLOSED_LOST',  title: $gettext('Closed Lost') },
    ],
  },
  {
    title: $gettext('Transport Mode'),
    value: 'transportMode',
    type: 'select',
    items: [
      { value: 'OCN', title: 'Ocean (OCN)' },
      { value: 'AIR', title: 'Air (AIR)' },
      { value: 'RD',  title: 'Road (RD)' },
      { value: 'RAL', title: 'Rail (RAL)' },
      { value: 'COU', title: 'Courier (COU)' },
      { value: 'MMD', title: 'Multimodal (MMD)' },
    ],
  },
]

export const headers = () => [
  { key: 'title',          text: $gettext('Title') },
  { key: 'entity',         text: $gettext('Client / Lead'), sortable: false, renderSlot: 'entity' },
  { key: 'transportMode',  text: $gettext('Mode'),          style: 'width: 70px;' },
  {
    key: 'route',
    text: $gettext('Route'),
    sortable: false,
    renderObject(item) {
      return [item.polName, item.podName].filter(Boolean).join(' → ') || '—'
    },
  },
  {
    key: 'estimatedRevenue',
    text: $gettext('Est. Revenue'),
    headerClass: 'text-right',
    bodyClass: 'text-right',
    renderObject(item) {
      return item.estimatedRevenue ? fmt(item.estimatedRevenue) + ' ' + (item.currency ?? '') : '—'
    },
  },
  {
    key: 'weightedRevenue',
    text: $gettext('Weighted'),
    sortable: false,
    headerClass: 'text-right',
    bodyClass: 'text-right',
    renderObject(item) { return item.estimatedRevenue ? fmt(item.weightedRevenue) : '—' },
  },
  { key: 'expectedClose', text: $gettext('Close Date'),  style: 'width: 110px;' },
  {
    key: 'assignedTo',
    text: $gettext('Assigned'),
    sortable: false,
    renderObject(item) { return item.assignedTo?.name ?? '—' },
  },
  { key: 'stage', text: $gettext('Stage'), renderSlot: 'stage', style: 'width: 180px;' },
  {
    key: 'actions',
    text: '',
    sortable: false,
    renderSlot: 'action',
    bodyClass: 'px-0',
    headerClass: 'text-end pe-4',
    noReport: true,
    style: 'width: 110px;',
  },
]
