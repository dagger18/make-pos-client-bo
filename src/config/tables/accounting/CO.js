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
      title: $gettext('Shipment'),
      value: 'shipment.code',
      type: 'text'
    },
    {
      title: $gettext('Collect from'),
      value: 'collectFrom',
      type: 'select',
      itemTitle: 'name',
      itemValue: 'id',
      apiEndpoint: 'ClientService',
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
      key: 'shipment.code', 
      text: $gettext('Shipment'),
      renderSlot: 'shipment'
    },
    { 
      key: 'collectFrom.name', 
      text: $gettext('Collect from'),
      wrapperClass: 'line-clamp-2',
      style: 'width: 250px;',
    },
    { 
      key: 'payTo.name', 
      text: $gettext('Pay to')
    },
    { 
      key: 'currency', 
      text: $gettext('Curr.')
    },
    { 
      key: 'amountNoTax', 
      text: $gettext('Amount'),
      renderObject (item) {
        return item.amountNoTax?.amount?.toMoneyFormat(item.amountNoTax.currency, false)
      }
    },
    { 
      key: 'tax', 
      text: $gettext('Tax'),
      renderObject (item) {
        return item.tax?.amount?.toMoneyFormat(item.tax.currency, false)
      }
    },
    { 
      key: 'amount', 
      text: $gettext('Amount') + '<br><span class="text-no-wrap">(' +  $gettext('Incl. Tax') + ')</span>',
      renderObject (item) {
        return item.amount?.amount?.toMoneyFormat(item.amount.currency, false)
      }
    },
    { 
      key: 'paid', 
      text: $gettext('Paid'),
      renderObject (item) {
        return item.paid.toMoneyFormat(item.amountNoTax.currency, false)
      }
    },
    { 
      key: 'remains', 
      text: $gettext('Debit'),
      renderObject (item) {
        return item.remains.toMoneyFormat(item.amountNoTax.currency, false)
      }
    },
    { 
      key: 'status',
      text: $gettext('Status'),
      renderSlot: 'status'
    },
    { 
      key: 'lastestPaidDate', 
      text: $gettext('Paid At'),
      renderObject (item) {
        return item.lastestPaidDate ?  printDateTime(item.lastestPaidDate) : ''
      }
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
      }
    },
    { 
      key: 'dueDate', 
      text: $gettext('Due Date'),
      renderSlot: 'dueDate'
    },
    { 
      key: 'shipment.accountManager', 
      text: $gettext('Account Manager'),
      sortable: false,
      renderAvatar: true,
      headerClass: 'text-center',
      bodyClass: 'text-center'
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
  ].filter(item => item)
}