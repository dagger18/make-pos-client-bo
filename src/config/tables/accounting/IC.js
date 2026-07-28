import { getListInvocie as getEbitNoteStatuses } from '@/config/enums/EbitNoteStatus';
import { enums as UserStatus } from '@/config/enums/UserStatus';
import { printDate, printDateTime, transformDateFilter } from '@/services/CommonService';
export const filterConfigs = (route, appStore) => {
  console.log(route.params.transportType)
  return [
    {
      title: $gettext('Invoice ID'),
      value: 'code',
      type: 'text'
    },
    {
      title: $gettext('Credit Note'),
      value: 'parentNote.code',
      type: 'text'
    },
    {
      title: $gettext('Shipment'),
      value: 'shipment.code',
      type: 'text'
    },
    {
      title: $gettext('Pay for'),
      value: 'payTo',
      type: 'select',
      itemTitle: 'name',
      itemValue: 'id',
      apiEndpoint: 'ProviderService',
    },
    {
      title: $gettext('ETD'),
      value: 'shipment.booking.etd',
      type: 'date',
      preSubmitCallback: transformDateFilter,
      toUTCDateOnPick: false,
      toDateOnMounted: false
    },
    {
      title: $gettext('Status'),
      value: 'status',
      type: 'select',
      items: getEbitNoteStatuses,
    },
    {
      title: $gettext('Sent Date'),
      value: 'noteDate',
      type: 'date',
      preSubmitCallback: transformDateFilter,
      toUTCDateOnPick: false,
      toDateOnMounted: false
    },
    {
      title: $gettext('Due Date'),
      value: 'dueDate',
      type: 'date',
      preSubmitCallback: transformDateFilter,
      toUTCDateOnPick: false,
      toDateOnMounted: false
    },
    {
      title: $gettext('Account Manager'),
      value: 'shipment.accountManager',
      type: 'select',
      apiEndpoint: 'UserService',
      searchOnProperties: ['firstName', 'lastName'],
      callParams: { filter_status: UserStatus.ACTIVE },
      itemTitle: 'fullName',
      itemValue: 'id',
      placeholder: $gettext('Select user') + '...'
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
  const route = useRoute()
  return [
    { 
      key: 'code', 
      text: $gettext('Invoice ID'),
      renderSlot: 'code'
    },
    { 
      key: 'RelationparentNote.code', 
      text: $gettext('Credit Note'),
      renderSlot: 'parentNote'
    },
    { 
      key: 'Relationshipment.code',
      text: $gettext('Shipment'),
      renderSlot: 'shipment'
    },
    { 
      key: 'RelationpayTo.id', 
      text: $gettext('Pay for'),
      renderObject (item) {
        return item.payTo?.name ?? $gettext('Undefined Provider')
      },
      wrapperClass: 'line-clamp-2',
      style: 'width: 250px;',
      reportKey: 'payTo.name'
    },
    { 
      key: 'Relationshipment.booking.etd', 
      text: $gettext('ETD'),
      renderObject (item) {
        return item.shipment.etd ? printDateTime(item.shipment.etd, 'DD-MMM-YYYY') : ''
      },
      reportKey: 'shipment.etdText'
    },
    { 
      key: 'amountNoTax', 
      text: $gettext('Amount'),
      renderObject (item) {
        return item.amountNoTax?.amount?.toMoneyFormat(item.amountNoTax.currency, false)
      },
      reportKey: 'amountNoTaxText'
    },
    { 
      key: 'tax', 
      text: $gettext('Tax'),
      renderObject (item) {
        return item.tax?.amount?.toMoneyFormat(item.tax.currency, false)
      },
      reportKey: 'taxText'
    },
    { 
      key: 'amount', 
      text: $gettext('Amount') + '(' +  $gettext('Incl. Tax') + ')',
      renderObject (item) {
        return item.amount?.amount?.toMoneyFormat(item.amount.currency, false)
      },
      reportKey: 'amountText'
    },
    { 
      key: 'paid', 
      text: $gettext('Paid'),
      renderObject (item) {
        return item.paid.toMoneyFormat(item.amountNoTax.currency, false)
      },
      reportKey: 'paidText'
    },
    { 
      key: 'remains', 
      text: $gettext('Debit'),
      renderObject (item) {
        return item.remains.toMoneyFormat(item.amountNoTax.currency, false)
      },
      reportKey: 'remainsText'
    },
    { 
      key: 'currency', 
      text: $gettext('Curr.')
    },
    {
      key: 'variance_status',
      text: $gettext('Variance'),
      renderSlot: 'variance_status',
      sortable: false,
      noReport: true
    },
    {
      key: 'status',
      text: $gettext('Status'),
      renderSlot: 'status',
      reportKey: 'statusText'
    },
    { 
      key: 'lastestPaidDate', 
      text: $gettext('Paid At'),
      renderObject (item) {
        return item.lastestPaidDate ?  printDateTime(item.lastestPaidDate) : ''
      },
      noReport: true
    },
    { 
      key: 'paymentMethod.name', 
      text: $gettext('Pay in')
    },
    { 
      key: 'noteDate', 
      text: $gettext('Sent Date'),
      renderObject (item) {
        return item.noteDate ?  printDate(item.noteDate) : ''
      },
      reportKey: 'noteDateText'
    },
    { 
      key: 'dueDate', 
      text: $gettext('Due Date'),
      renderSlot: 'dueDate',
      reportKey: 'dueDateText'
    },
    { 
      key: 'shipment.accountManager', 
      text: $gettext('Account Manager'),
      sortable: false,
      renderAvatar: true,
      headerClass: 'text-center',
      bodyClass: 'text-center',
      reportKey: 'shipment.accountManagerName'
    },
    { 
      key: 'createdBy', 
      text: $gettext('Created By'),
      sortable: false,
      renderAvatar: true,
      headerClass: 'text-center',
      bodyClass: 'text-center',
      reportKey: 'createdBy.name'
    },
    { 
      key: 'createdDate', 
      text: $gettext('Created On'),
      renderObject (item) {
        return item.createdDate ?  printDateTime(item.createdDate) : ''
      },
      bodyClass: 'pe-4',
      noReport: true
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
  ].filter(item => item)
}