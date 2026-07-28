export const filterConfigs = () => {
  return [
    {
      title: $gettext('Name'),
      value: 'name',
      type: 'text'
    },
    {
      title: $gettext('Code'),
      value: 'code',
      type: 'text'
    },
  ]
}

export const headers = () => {
  return [
    { key: 'name', text: $gettext('Name') },
    { key: 'code', text: $gettext('Code') },
    { key: 'address', text: $gettext('Address') },
    { key: 'phone', text: $gettext('Phone') },
    {
      key: 'isActive',
      text: $gettext('Active'),
      renderObject(item) {
        return item.isActive ? $gettext('Yes') : $gettext('No')
      }
    },
    {
      key: 'id',
      text: $gettext('Action'),
      sortable: false,
      renderSlot: 'action',
      bodyClass: 'px-0',
      headerClass: 'text-end pe-4'
    },
  ]
}
