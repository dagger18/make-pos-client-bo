import { printDateTime, transformDateFilter } from '@/services/CommonService';
import { enums as UserStatus } from '@/config/enums/UserStatus';
export const filterConfigs = (appStore) => {
  return [
    {
      title: $gettext('Name'),
      value: 'name',
      type: 'text'
    },
    {
      title: $gettext('Created By'),
      value: 'createdBy',
      type: 'select',
      apiEndpoint: 'UserService',
      searchOnProperties: ['firstName', 'lastName'],
      callParams: { filter_status: UserStatus.ACTIVE },
      itemTitle: 'fullName',
      itemValue: 'id',
      placeholder: $gettext('Select user') + '...'
    },
    {
      title: $gettext('Created On'),
      value: 'createdDate',
      type: 'date',
      placeholder: $gettext('Select date') + '...',
      config: { dateFormat: 'DD/MM/YYYY', altInput: true, altFormat: 'DD/MM/YYYY'},
      preSubmitCallback: transformDateFilter
    }
  ]
}

export const headers = () => {
  return [
    { 
      key: 'name', 
      text: $gettext('Name')
    },
    { key: 'entityType', text: $gettext('Type')},
    { key: 'rowType', text: $gettext('Row Type')},
    { 
      key: 'createdBy', 
      text: $gettext('Created By'),
      sortable: false,
      renderAvatar: true
    },
    { 
      key: 'createdDate', 
      text: $gettext('Created On'),
      renderObject (item) {
        return item.createdDate ?  printDateTime(item.createdDate) : ''
      },
      bodyClass: 'pe-4'
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