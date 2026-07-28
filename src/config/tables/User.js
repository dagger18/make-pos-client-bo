import { transformDateFilter } from '@/services/CommonService';
import { getList as getUserStatuses } from '../enums/UserStatus';
export const filterConfigs = (appStore) => {
  return [
    {
      title: $gettext('Name'),
      value: 'firstName,lastName',
      type: 'text'
    },
    {
      title: $gettext('Title'),
      value: 'title',
      type: 'text'
    },
    {
      title: $gettext('Email'),
      value: 'email',
      type: 'text'
    },
    {
      title: $gettext('Group'),
      value: 'userGroup',
      items: appStore.getList('userGroups'),
      type: 'select'
    },
    {
      title: $gettext('Status'),
      value: 'status',
      type: 'select',
      items: getUserStatuses,
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
      key: 'id', 
      text: '', 
      renderSlot: 'avatar',
      sortable: false, 
    },
    { 
      key: 'firstName', 
      text: $gettext('Name'), 
      renderSlot: 'fullName'
    },
    { key: 'title', text: $gettext('Title')},
    { key: 'email', text: $gettext('Email')},
    { key: 'assignedClients', text: $gettext('Assigned Clients')},
    { 
      key: 'group', text: $gettext('Group'), 
      renderObject (item) {
        return item.userGroup.name
      }
    },
    { 
      key: 'status', text: $gettext('Status'), 
      renderSlot: 'status'
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
