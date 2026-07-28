import { printDateTime, transformDateFilter } from '@/services/CommonService';
export const filterConfigs = (appStore) => {
  return [
    {
      title: $gettext('Quote ID'),
      value: 'code',
      type: 'text'
    },
    {
      title: $gettext('Client'),
      value: 'client',
      type: 'select',
      itemTitle: 'name',
      itemValue: 'id',
      apiEndpoint: 'ClientService',
    },
    {
      title: $gettext('Provider'),
      value: 'provider',
      type: 'select',
      itemTitle: 'name',
      itemValue: 'id',
      apiEndpoint: 'ProviderService',
    },
    {
      title: $gettext('Origin'),
      value: 'originPort.name,originPort.code,originPort.codeFull',
      type: 'text'
    },
    {
      title: $gettext('Destination'),
      value: 'destinationPort.name,destinationPort.code,destinationPort.codeFull',
      type: 'text'
    },
    {
      title: $gettext('Valid Until'),
      value: 'validUntil',
      type: 'date',
      preSubmitCallback: transformDateFilter,
      toUTCDateOnPick: false,
      toDateOnMounted: false
    },
    {
      title: $gettext('Created By'),
      value: 'createdBy',
      type: 'select',
      apiEndpoint: 'UserService',
      searchOnProperties: ['firstName', 'lastName'],
      itemTitle: 'firstName',
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
      key: 'code', 
      text: $gettext('Quote ID'),
      renderSlot: 'code'
    },
    { 
      key: 'client', 
      text: $gettext('Client'),
      bodyClass: 'font-weight-bold',
      wrapperClass: 'line-clamp-2',
      style: 'width: 120px;',
      renderObject: (item) => { return item.client.name }
    },
    { 
      key: 'provider', 
      text: $gettext('Provider'),
      wrapperClass: 'line-clamp-2',
      style: 'width: 120px;',
      renderObject: (item) => { return item.provider.name }
    },
    { 
      key: 'cargoVolume', 
      text: $gettext('Volume'),
      renderSlot: 'cargoVolume'
    },
    {
      key: 'originPort',
      text: $gettext('Route'),
      renderSlot: 'route'
    },
    { 
      key: 'status', 
      text: $gettext('Status'),
      renderSlot: 'status'
    },
    { 
      key: 'validUntil', 
      text: $gettext('Valid Until'),
      renderObject (item) {
        return item.validUntil ?  printDateTime(item.validUntil, 'DD/MM/YYYY') : ''
      },
    },
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
      text: $gettext('Created At'),
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
