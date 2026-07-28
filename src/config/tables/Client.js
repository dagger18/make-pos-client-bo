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
      title: $gettext('Contact Person'),
      value: 'defaultContact.firstName,defaultContact.lastName',
      type: 'text'
    },
    {
      title: $gettext('Company ID'),
      value: 'code',
      type: 'text'
    },
    {
      title: $gettext('Credit Limit (USD)'),
      value: 'creditLimit->amount',
      type: 'number'
    },
    {
      title: $gettext('Credit Period (days)'),
      value: 'creditPeriod',
      type: 'number'
    },
    {
      title: $gettext('Tax Number'),
      value: 'defaultInvoiceInfo.taxNumber',
      type: 'text'
    },
    {
      title: $gettext('Contact Phone'),
      value: 'defaultContact.phone,phone',
      type: 'text'
    },
    {
      title: $gettext('Account Manager'),
      value: 'accountManager',
      type: 'select',
      apiEndpoint: 'UserService',
      searchOnProperties: ['firstName', 'lastName'],
      callParams: { filter_status: UserStatus.ACTIVE },
      itemTitle: 'fullName',
      itemValue: 'id',
      placeholder: $gettext('Select user') + '...'
    },
    {
      title: $gettext('Country'),
      value: 'country',
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
    },
    { title: $gettext('Active'), value: 'isActive', type: 'select', items: [{ value: '1', title: $gettext('Active') }, { value: '0', title: $gettext('Inactive') }] },
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
    {
      title: $gettext('Tier'),
      value: 'tier',
      type: 'select',
      items: [
        { value: 'PLATINUM', title: $gettext('Platinum') },
        { value: 'GOLD',     title: $gettext('Gold') },
        { value: 'SILVER',   title: $gettext('Silver') },
        { value: 'STANDARD', title: $gettext('Standard') },
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
    { key: 'tier', sortable: false, text: $gettext('Tier'), renderSlot: 'tier' },
    { key: 'email', sortable: false, text: $gettext('Email') },
    { key: 'isActive', sortable: false, text: $gettext('Active'), renderSlot: 'isActive' },
    { key: 'creditStatus', sortable: false, text: $gettext('Credit Status'), renderSlot: 'creditStatus' },

    {
      key: 'defaultContact',
      text: $gettext('Contact Phone'), 
      sortable: false,
      renderObject (item) {
        return item.defaultContact.phone ?? ''
      },
      reportKey: 'defaultContact.phone'
    },
    { 
      key: 'accountManager', 
      text: $gettext('Account Manager'), 
      sortable: false,
      headerClass: 'text-center',
      bodyClass: 'text-center',
      renderObject (item) {
        return [item.accountManager?.firstName ?? '', item.accountManager?.lastName ?? ''].join(' ')
      },
      reportKey: 'accountManager.fullName'
    },
    { 
      key: 'unpaid.amount', 
      text: $gettext('Unpaid'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
      renderObject (item) {
        let color = ''
        if(item.unpaid.amount
            && item.unpaid.amount > item.creditLimit.amount) {
          color = 'text-error'
        }
        return '<span class="' + color + '">'
          + (item.unpaid?.amount?.toMoneyFormat(item.unpaid.currency) ?? '')
          + '</span>'
      },
      reportKey: 'unpaid.amount'
    },
    { 
      key: 'creditLimit', 
      headerClass: 'text-right',
      bodyClass: 'text-right',
      text: $gettext('Credit Limit'),
      renderObject (item) {
        if(item.creditLimit.amount == 0)
          return ''
        return item.creditLimit?.amount?.toMoneyFormat(item.creditLimit.currency) ?? ''
      },
      reportKey: 'creditLimit.amount'
    },
    { 
      key: 'creditPeriod', 
      text: $gettext('Credit Period'),
      renderObject (item) {
        return item.creditPeriod ? (item.creditPeriod + ' ' + $gettext('day(s)')) : ''
      }
    },
    { 
      key: 'defaultContact', 
      text: $gettext('Contact Person'), 
      sortable: false,
      renderObject (item) {
        return (item.defaultContact.firstName ?? '') + ' ' + (item.defaultContact.lastName ?? '')
      },
      reportKey: 'defaultContact.fullName'
    },
    { key: 'country', text: $gettext('Country')},
    { key: 'code', text: $gettext('Company ID')},
    { key: 'assignedUsersCount', text: $gettext('Assigned Users'), sortable: false},
    { 
      key: 'establishmentDate', 
      text: $gettext('Establishment Date'),
      renderObject (item) {
        return item.establishmentDate ?  printDateTime(item.establishmentDate, 'DD/MM/YYYY') : ''
      },
      headerClass: 'text-center',
      bodyClass: 'text-center'
    },
    { 
      key: 'createdBy', 
      text: $gettext('Created By'),
      sortable: false,
      headerClass: 'text-center',
      bodyClass: 'text-center',
      renderObject (item) {
        return [item.createdBy?.firstName ?? '', item.createdBy?.lastName ?? ''].join(' ')
      },
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