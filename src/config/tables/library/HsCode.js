export const filterConfigs = () => [
  { title: $gettext('HS Code'), value: 'code', type: 'text' },
  { title: $gettext('Description'), value: 'description', type: 'text' },
  { title: $gettext('Country Code'), value: 'countryCode', type: 'text' },
  { title: $gettext('HS Version'), value: 'hsVersion', type: 'text' },
  {
    title: $gettext('Active'),
    value: 'isActive',
    type: 'select',
    items: [{ title: $gettext('Yes'), value: 1 }, { title: $gettext('No'), value: 0 }],
  },
]

export const headers = () => [
  { key: 'code', text: $gettext('Code') },
  { key: 'description', text: $gettext('Description') },
  { key: 'level', text: $gettext('Level') },
  { key: 'countryCode', text: $gettext('Country') },
  { key: 'hsVersion', text: $gettext('Version') },
  { key: 'isActive', text: $gettext('Active'), renderObject(item) { return item.isActive ? $gettext('Yes') : $gettext('No') } },
  { key: 'id', text: $gettext('Action'), sortable: false, renderSlot: 'action', bodyClass: 'px-0', headerClass: 'text-end pe-4' },
]
