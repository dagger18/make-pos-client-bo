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
      title: $gettext('Provider ID'),
      value: 'code',
      type: 'text'
    },
    {
      title: $gettext('City'),
      value: 'city',
      type: 'text'
    },
    {
      title: $gettext('Country'),
      value: 'country',
      type: 'text'
    },
    {
      title: $gettext('Contact Person'),
      value: 'defaultContact.firstName,defaultContact.lastName,defaultContact.email,defaultContact.phone,defaultContact.title',
      type: 'text'
    },
    {
      title: $gettext('Phone'),
      value: 'phone',
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
    },
    {
      title: $gettext('Credit Status'),
      value: 'creditStatus',
      type: 'select',
      items: [
        { value: 'ACTIVE', title: $gettext('Active') },
        { value: 'ON_HOLD', title: $gettext('On Hold') },
        { value: 'BLOCKED', title: $gettext('Blocked') },
        { value: 'BLACKLISTED', title: $gettext('Blacklisted') },
      ]
    },
  ]
}

export const headers = () => {
  return [
    { 
      key: 'name', text: $gettext('Name'),
      wrapperClass: 'line-clamp-2',
      style: 'width: 250px;',
    },
    { key: 'creditStatus', sortable: false, text: $gettext('Credit Status'), renderSlot: 'creditStatus' },
    { key: 'code', text: $gettext('Provider ID')},
    { key: 'country', text: $gettext('Country')},
    { key: 'city', text: $gettext('City')},
    { 
      key: 'defaultContact', 
      text: $gettext('Contact Person'), 
      sortable: false,
      renderObject (item) {
        return (item.defaultContact.firstName ?? '') + ' ' + (item.defaultContact.lastName ?? '')
      },
      reportKey: 'defaultContact.fullName'
    },
    { key: 'phone', text: $gettext('Phone')},
    { key: 'trackingUrl', text: $gettext('Tracking URL')},
    { 
      key: 'creditPeriod', 
      text: $gettext('Payment Due'),
      renderObject (item) {
        return item.creditPeriod ? (item.creditPeriod + ' ' + $gettext('day(s)')) : ''
      }
    },
    { 
      key: 'createdBy', 
      text: $gettext('Created By'),
      sortable: false,
      renderAvatar: true,
      reportKey: 'createdBy.fullName'
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
      headerClass: 'text-end pe-4',
      noReport: true
    },
  ]
}