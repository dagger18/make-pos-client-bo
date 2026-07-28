export const filterConfigs = () => [
  { title: $gettext('Company'), value: 'companyName', type: 'text' },
  { title: $gettext('Contact'), value: 'contactName',  type: 'text' },
  {
    title: $gettext('Status'),
    value: 'status',
    type: 'select',
    items: [
      { value: 'NEW',       title: $gettext('New') },
      { value: 'CONTACTED', title: $gettext('Contacted') },
      { value: 'QUALIFIED', title: $gettext('Qualified') },
      { value: 'CONVERTED', title: $gettext('Converted') },
      { value: 'DEAD',      title: $gettext('Dead') },
    ],
  },
  {
    title: $gettext('Source'),
    value: 'source',
    type: 'select',
    items: [
      { value: 'REFERRAL',   title: $gettext('Referral') },
      { value: 'LINKEDIN',   title: $gettext('LinkedIn') },
      { value: 'COLD_CALL',  title: $gettext('Cold Call') },
      { value: 'TRADE_SHOW', title: $gettext('Trade Show') },
      { value: 'INBOUND',    title: $gettext('Inbound') },
    ],
  },
  {
    title: $gettext('Primary Mode'),
    value: 'primaryMode',
    type: 'select',
    items: [
      { value: 'OCN', title: 'Ocean (OCN)' },
      { value: 'AIR', title: 'Air (AIR)' },
      { value: 'RD',  title: 'Road (RD)' },
      { value: 'RAL', title: 'Rail (RAL)' },
    ],
  },
]

export const headers = () => [
  { key: 'companyName',     text: $gettext('Company') },
  { key: 'contactName',     text: $gettext('Contact'),     sortable: false },
  { key: 'contactEmail',    text: $gettext('Email'),       sortable: false },
  { key: 'contactPhone',    text: $gettext('Phone'),       sortable: false, style: 'width: 130px;' },
  { key: 'primaryMode',     text: $gettext('Mode'),        style: 'width: 70px;' },
  { key: 'estimatedVolume', text: $gettext('Est. Volume'), sortable: false, style: 'width: 120px;' },
  { key: 'source',          text: $gettext('Source'),      style: 'width: 110px;' },
  {
    key: 'assignedTo',
    text: $gettext('Assigned To'),
    sortable: false,
    renderObject(item) { return item.assignedTo?.name ?? '—' },
  },
  { key: 'status',    text: $gettext('Status'),  renderSlot: 'status',  style: 'width: 110px;' },
  {
    key: 'createdAt',
    text: $gettext('Created'),
    style: 'width: 110px;',
    renderObject(item) { return item.createdAt?.slice(0, 10) ?? '—' },
  },
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
