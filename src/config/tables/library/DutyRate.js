export const filterConfigs = () => [
  { title: $gettext('Import Country'), value: 'importCountry', type: 'text' },
  { title: $gettext('Export Country'), value: 'exportCountry', type: 'text' },
  { title: $gettext('Rate Type'), value: 'rateType', type: 'text' },
  { title: $gettext('FTA Name'), value: 'ftaName', type: 'text' },
]

export const headers = () => [
  { key: 'hsCode', text: $gettext('HS Code'), renderObject(item) { return item.hsCode?.code ?? '—' } },
  { key: 'importCountry', text: $gettext('Import Country') },
  { key: 'exportCountry', text: $gettext('Export Country') },
  { key: 'rateType', text: $gettext('Rate Type') },
  { key: 'dutyRate', text: $gettext('Duty (%)') },
  { key: 'vatRate', text: $gettext('VAT (%)') },
  { key: 'exciseRate', text: $gettext('Excise (%)') },
  { key: 'id', text: $gettext('Action'), sortable: false, renderSlot: 'action', bodyClass: 'px-0', headerClass: 'text-end pe-4' },
]
