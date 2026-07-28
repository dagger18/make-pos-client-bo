export const filterConfigs = () => {
  return [
    {
      title: $gettext('Group Name'),
      value: 'name',
      type: 'text'
    }
  ]
}

export const headers = () => {
  return [
    { key: 'name', text: $gettext('Group Name')},
    { key: 'description', text: $gettext('Description')},
    { 
      key: 'members', text: $gettext('Members')
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
