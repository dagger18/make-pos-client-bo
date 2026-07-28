import { getTitle } from '@/config/enums/PaymentMethodType';
import { enums as UserStatus } from '@/config/enums/UserStatus';
import { printDateTime, transformDateFilter } from '@/services/CommonService';
export const filterConfigs = (appStore) => {
  return [
    {
      title: $gettext('Name'),
      value: 'name',
      type: 'text'
    },
    {
      title: $gettext('Description'),
      value: 'description',
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
      preSubmitCallback: transformDateFilter,
      toUTCDateOnPick: false,
      toDateOnMounted: false
    }
  ]
}

export const headers = () => {
  return [
    { 
      key: 'name', 
      text: $gettext('Name')
    },
    { 
      key: 'type', 
      text: $gettext('Type'),
      renderObject(item) {
        return getTitle(item.type)
      }
    },
    { key: 'description', text: $gettext('Description')},
    { 
      key: 'createdBy', 
      text: $gettext('Created By'),
      sortable: false,
      renderAvatar: true,
      headerClass: 'text-center',
      bodyClass: 'text-center'
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