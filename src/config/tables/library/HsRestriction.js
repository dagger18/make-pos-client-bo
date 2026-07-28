export const filterConfigs = () => [
  { title: $gettext('Country Code'), value: 'countryCode', type: 'text' },
  { title: $gettext('Restriction Type'), value: 'restrictionType', type: 'text' },
  { title: $gettext('Authority'), value: 'authority', type: 'text' },
]

export const headers = () => [
  { key: 'hsCode', text: $gettext('HS Code'), renderObject(item) { return item.hsCode?.code ?? '—' } },
  { key: 'countryCode', text: $gettext('Country') },
  { key: 'restrictionType', text: $gettext('Restriction Type') },
  { key: 'authority', text: $gettext('Authority') },
  { key: 'licenceType', text: $gettext('Licence Type') },
  { key: 'id', text: $gettext('Action'), sortable: false, renderSlot: 'action', bodyClass: 'px-0', headerClass: 'text-end pe-4' },
]
