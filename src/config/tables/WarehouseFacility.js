export const filterConfigs = () => [
  { title: $gettext('Name'), value: 'name', type: 'text' },
  {
    title: $gettext('Status'),
    value: 'isActive',
    type: 'select',
    items: [
      { value: '1', title: $gettext('Active') },
      { value: '0', title: $gettext('Inactive') },
    ],
  },
  {
    title: $gettext('Bonded'),
    value: 'bonded',
    type: 'select',
    items: [
      { value: '1', title: $gettext('Yes') },
      { value: '0', title: $gettext('No') },
    ],
  },
]

export const headers = () => [
  { key: 'name',         text: $gettext('Name') },
  { key: 'locationCode', text: $gettext('Location'), style: 'width: 110px;' },
  { key: 'bonded',       text: $gettext('Bonded'),   sortable: false, renderSlot: 'bonded',   style: 'width: 90px;' },
  { key: 'dangerousGoodsApproved', text: $gettext('DG'), sortable: false, renderSlot: 'dg', style: 'width: 70px;' },
  {
    key: 'totalAreaSqm',
    text: $gettext('Area (m²)'),
    style: 'width: 110px;',
    headerClass: 'text-right',
    bodyClass: 'text-right',
  },
  { key: 'contactPhone', text: $gettext('Phone'), sortable: false },
  { key: 'isActive',     text: $gettext('Status'), renderSlot: 'isActive', style: 'width: 90px;' },
  {
    key: 'actions',
    text: '',
    sortable: false,
    renderSlot: 'action',
    bodyClass: 'px-0',
    headerClass: 'text-end pe-4',
    noReport: true,
    style: 'width: 80px;',
  },
]
