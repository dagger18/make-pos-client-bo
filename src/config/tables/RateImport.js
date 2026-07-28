export const filterConfigs = () => [
  {
    title: $gettext('Status'),
    value: 'status',
    type: 'select',
    items: [
      { value: 'PENDING',     title: $gettext('Pending') },
      { value: 'PARSING',     title: $gettext('Parsing') },
      { value: 'VALIDATING',  title: $gettext('Validating') },
      { value: 'PREVIEW',     title: $gettext('Preview') },
      { value: 'APPROVED',    title: $gettext('Approved') },
      { value: 'IMPORTING',   title: $gettext('Importing') },
      { value: 'COMPLETED',   title: $gettext('Completed') },
      { value: 'FAILED',      title: $gettext('Failed') },
      { value: 'ROLLED_BACK', title: $gettext('Rolled Back') },
    ],
  },
  {
    title: $gettext('Transport Mode'),
    value: 'transportType',
    type: 'select',
    items: [
      { value: 'OCN', title: 'Ocean (OCN)' },
      { value: 'AIR', title: 'Air (AIR)' },
      { value: 'RD',  title: 'Road (RD)' },
      { value: 'RAL', title: 'Rail (RAL)' },
      { value: 'COU', title: 'Courier (COU)' },
    ],
  },
]

export const headers = () => [
  { key: 'id',           text: '#',                   style: 'width: 60px;' },
  { key: 'status',       text: $gettext('Status'),    renderSlot: 'status', style: 'width: 130px;' },
  { key: 'transportType',text: $gettext('Mode'),      style: 'width: 80px;' },
  {
    key: 'provider',
    text: $gettext('Provider'),
    sortable: false,
    renderObject(item) { return item.provider?.name ?? '—' },
  },
  { key: 'fileName', text: $gettext('File'), sortable: false, renderSlot: 'fileName' },
  { key: 'rows',     text: $gettext('Rows'), sortable: false, renderSlot: 'rows', style: 'width: 130px;' },
  {
    key: 'effectiveDate',
    text: $gettext('Effective'),
    style: 'width: 110px;',
    renderObject(item) { return item.effectiveDate?.slice(0, 10) ?? '—' },
  },
  {
    key: 'expiryDate',
    text: $gettext('Expiry'),
    style: 'width: 110px;',
    renderObject(item) { return item.expiryDate?.slice(0, 10) ?? '—' },
  },
  {
    key: 'uploadedBy',
    text: $gettext('Uploaded By'),
    sortable: false,
    renderObject(item) {
      return item.uploadedBy
        ? [item.uploadedBy.firstName, item.uploadedBy.lastName].join(' ')
        : '—'
    },
  },
  {
    key: 'createdAt',
    text: $gettext('Date'),
    style: 'width: 130px;',
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
    style: 'width: 60px;',
  },
]
