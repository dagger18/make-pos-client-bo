export const filterConfigs = () => [
  { title: $gettext('Name'), value: 'name', type: 'text' },
]

export const headers = () => [
  { key: 'id',   text: '#',               style: 'width: 60px;' },
  { key: 'name', text: $gettext('Name') },
  {
    key: 'rules',
    text: $gettext('Rules'),
    sortable: false,
    renderSlot: 'rules',
    style: 'width: 100px;',
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
