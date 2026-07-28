export const filterConfigs = () => [
  {
    title: $gettext('Status'),
    value: 'status',
    type: 'select',
    items: [
      { value: 'OPEN',      title: $gettext('Open') },
      { value: 'CLOSED',    title: $gettext('Closed') },
      { value: 'DEPARTED',  title: $gettext('Departed') },
      { value: 'ARRIVED',   title: $gettext('Arrived') },
      { value: 'CANCELLED', title: $gettext('Cancelled') },
    ],
  },
  {
    title: $gettext('Transport Mode'),
    value: 'transportMode',
    type: 'select',
    items: [
      { value: 'SEA',  title: $gettext('Sea') },
      { value: 'AIR',  title: $gettext('Air') },
      { value: 'ROAD', title: $gettext('Road') },
    ],
  },
  { title: $gettext('Code'), value: 'code', type: 'text' },
]

export const headers = () => [
  { key: 'code', text: $gettext('Code'), style: 'width: 130px;' },
  { key: 'transportMode', text: $gettext('Mode / Type'), sortable: false, renderSlot: 'mode' },
  { key: 'status', text: $gettext('Status'), renderSlot: 'status', style: 'width: 130px;' },
  {
    key: 'pol',
    text: $gettext('POL → POD'),
    sortable: false,
    renderObject(item) {
      return `${item.pol?.code ?? '—'} → ${item.pod?.code ?? '—'}`
    },
  },
  { key: 'etd', text: $gettext('ETD'), style: 'width: 110px;' },
  { key: 'eta', text: $gettext('ETA'), style: 'width: 110px;' },
  {
    key: 'vessel',
    text: $gettext('Vessel / Flight'),
    sortable: false,
    renderObject(item) {
      return item.vessel ?? item.flightNumber ?? '—'
    },
  },
  {
    key: 'childCount',
    text: $gettext('Jobs'),
    sortable: false,
    renderSlot: 'jobs',
    style: 'width: 80px;',
    headerClass: 'text-center',
    bodyClass: 'text-center',
  },
  {
    key: 'id',
    text: '',
    sortable: false,
    renderSlot: 'action',
    bodyClass: 'px-0',
    headerClass: 'text-end pe-4',
    noReport: true,
    style: 'width: 60px;',
  },
]
