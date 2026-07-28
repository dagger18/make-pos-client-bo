export const filterConfigs = () => [
  {
    title: $gettext('Type'),
    value: 'sourceType',
    type: 'select',
    items: [
      { value: 'AR_INVOICE',  title: $gettext('AR Invoice') },
      { value: 'AP_BILL',     title: $gettext('AP Bill') },
      { value: 'AR_PAYMENT',  title: $gettext('AR Receipt') },
      { value: 'AP_PAYMENT',  title: $gettext('AP Payment') },
      { value: 'CREDIT_NOTE', title: $gettext('Credit Note') },
      { value: 'MANUAL',      title: $gettext('Manual') },
    ],
  },
  {
    title: $gettext('Posted'),
    value: 'isPosted',
    type: 'select',
    items: [
      { value: '1', title: $gettext('Posted') },
      { value: '0', title: $gettext('Unposted') },
    ],
  },
]

const TYPE_LABELS = {
  AR_INVOICE: 'AR Invoice', AP_BILL: 'AP Bill', AR_PAYMENT: 'AR Receipt',
  AP_PAYMENT: 'AP Payment', CREDIT_NOTE: 'Credit Note', MANUAL: 'Manual',
}

export const headers = () => [
  { key: 'journalNumber', text: $gettext('Journal #') },
  {
    key: 'sourceType',
    text: $gettext('Type'),
    style: 'width: 130px;',
    renderObject(item) { return TYPE_LABELS[item.sourceType] ?? item.sourceType },
  },
  { key: 'entryDate',    text: $gettext('Date'),     style: 'width: 110px;' },
  {
    key: 'ebitNoteCode',
    text: $gettext('EbitNote'),
    sortable: false,
    renderObject(item) { return item.ebitNoteCode ?? '—' },
  },
  { key: 'isPosted',  text: $gettext('Posted'),  renderSlot: 'isPosted', style: 'width: 90px;' },
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
