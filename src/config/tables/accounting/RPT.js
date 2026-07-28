import { printDate, printDateTime, transformDateFilter } from '@/services/CommonService';
import { enums as UserStatus } from '@/config/enums/UserStatus';
export const filterConfigs = (route, appStore) => {
  console.log(route.params.transportType)
  return [
    {
      title: $gettext('Record ID'),
      value: 'code',
      type: 'text'
    },
    {
      title: $gettext('Invoice ID'),
      value: 'parentNote.code',
      type: 'text'
    },
    {
      title: $gettext('Shipment'),
      value: 'shipment.code',
      type: 'text'
    },
    {
      title: $gettext('Received from'),
      value: 'collectFrom',
      type: 'select',
      itemTitle: 'name',
      itemValue: 'id',
      apiEndpoint: 'ClientService',
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
      text: $gettext('Record ID'),
      renderSlot: 'code'
    },
    { 
      key: 'parentNote.code', 
      text: $gettext('Invoice'),
      renderSlot: 'parentNote'
    },
    { 
      key: 'shipment.code', 
      text: $gettext('Shipment'),
      renderSlot: 'shipment'
    },
    { 
      key: 'collectFrom.name', 
      text: $gettext('Received From')
    },
    { 
      key: 'currency', 
      text: $gettext('Curr.')
    },
    { 
      key: 'amount', 
      text: $gettext('Amount'),
      renderObject (item) {
        return item.amount?.amount?.toMoneyFormat(item.amount.currency, false)
      }
    },
    { 
      key: 'paymentMethod.name', 
      text: $gettext('Pay in')
    },
    { 
      key: 'noteDate', 
      text: $gettext('Paid Date'),
      renderObject (item) {
        return item.noteDate ?  printDate(item.noteDate) : ''
      }
    },
    { 
      key: 'description', 
      text: $gettext('Description')
    },
    { 
      key: 'note', 
      text: $gettext('Note')
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
      key: 'fxGainLoss',
      text: $gettext('FX Gain/Loss'),
      sortable: false,
      renderSlot: 'fx_gain_loss'
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