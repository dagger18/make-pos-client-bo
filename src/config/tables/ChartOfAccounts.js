export const filterConfigs = () => [
  { title: $gettext('Code'), value: 'code', type: 'text' },
  { title: $gettext('Name'), value: 'name', type: 'text' },
  {
    title: $gettext('Type'),
    value: 'accountType',
    type: 'select',
    items: [
      { value: 'ASSET',     title: $gettext('Asset') },
      { value: 'LIABILITY', title: $gettext('Liability') },
      { value: 'REVENUE',   title: $gettext('Revenue') },
      { value: 'COST',      title: $gettext('Cost') },
      { value: 'OTHER',     title: $gettext('Other') },
    ],
  },
  {
    title: $gettext('Active'),
    value: 'isActive',
    type: 'select',
    items: [
      { value: '1', title: $gettext('Active') },
      { value: '0', title: $gettext('Inactive') },
    ],
  },
]

export const headers = () => [
  { key: 'code',        text: $gettext('Code'),  style: 'width: 100px;' },
  { key: 'name',        text: $gettext('Name'),  renderSlot: 'name' },
  { key: 'accountType', text: $gettext('Type'),  renderSlot: 'accountType', style: 'width: 120px;' },
  {
    key: 'isActive',
    text: $gettext('Active'),
    renderSlot: 'isActive',
    style: 'width: 80px;',
    headerClass: 'text-center',
    bodyClass: 'text-center',
  },
  {
    key: 'actions',
    text: '',
    sortable: false,
    renderSlot: 'action',
    bodyClass: 'px-0',
    headerClass: 'text-end pe-4',
    noReport: true,
    style: 'width: 100px;',
  },
]
