export const filterConfigs = []

export function headers() {
  return [
    { title: $gettext('ID'),           key: 'id',                      sortable: true },
    { title: $gettext('Carrier SCAC'), key: 'carrierScac',             sortable: true },
    { title: $gettext('Event Code'),   key: 'carrierEventCode',        sortable: true },
    { title: $gettext('Description'),  key: 'carrierEventDescription', sortable: false },
    { title: $gettext('Milestone'),    key: 'milestoneCode',           sortable: true },
    { title: $gettext('Confidence'),   key: 'confidence',              sortable: true },
    { title: '',                        key: 'action',                  sortable: false },
  ]
}
