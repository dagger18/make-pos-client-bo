import { getList as getEbitNoteStatuses } from '@/config/enums/EbitNoteStatus';
import { enums as UserStatus } from '@/config/enums/UserStatus';
import { getList as getShipmentStatuses } from '@/config/enums/ShipmentStatus';
import { getList as getTransportTypes } from '@/config/enums/TransportType';
import { printDateTime, transformDateFilter } from '@/services/CommonService';
export const filterConfigs = (appStore) => {
  return [
    {
      title: $gettext('Shipment ID'),
      value: 'code,id',
      type: 'text'
    },
    {
      title: $gettext('Client'),
      value: 'quote.client',
      type: 'select',
      itemTitle: 'name',
      itemValue: 'id',
      apiEndpoint: 'ClientService',
    },
    {
      title: $gettext('Provider'),
      value: 'quote.provider',
      type: 'select',
      itemTitle: 'name',
      itemValue: 'id',
      apiEndpoint: 'ProviderService',
    },
    {
      title: $gettext('ETD'),
      value: 'booking.etd',
      type: 'date',
      preSubmitCallback: transformDateFilter,
      toUTCDateOnPick: false,
      toDateOnMounted: false
    },
    {
      title: $gettext('ETA'),
      value: 'booking.eta',
      type: 'date',
      preSubmitCallback: transformDateFilter,
      toUTCDateOnPick: false,
      toDateOnMounted: false
    },
    {
      title: $gettext('Master Bill'),
      value: 'masterBill',
      type: 'text'
    },
    {
      title: $gettext('House Bill'),
      value: 'houseBill',
      type: 'text'
    },
    {
      title: $gettext('Port Loading'),
      value: 'quote.originPort.name,quote.originPort.code,quote.originPort.codeFull',
      type: 'text'
    },
    {
      title: $gettext('Port Discharge'),
      value: 'quote.destinationPort.name,quote.destinationPort.code,quote.destinationPort.codeFull',
      type: 'text'
    },
    {
      title: $gettext('Booking No.'),
      value: 'booking.code',
      type: 'text'
    },
    {
      title: $gettext('Booking Ref.'),
      value: 'booking.codeReference',
      type: 'text'
    },
    {
      title: $gettext('Status'),
      value: 'status',
      type: 'select',
      items: getShipmentStatuses,
    },
    {
      title: $gettext('Debit/Credit Status'),
      value: 'ebitNotes.status',
      type: 'select',
      items: getEbitNoteStatuses,
    },
    {
      title: $gettext('Revenues'),
      value: 'revenue->amount',
      type: 'number',
    },
    {
      title: $gettext('Costs'),
      value: 'cost->amount',
      type: 'number',
    },
    {
      title: $gettext('Profit'),
      value: 'profit->amount',
      type: 'number',
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
      preSubmitCallback: transformDateFilter
    },
    {
      title: $gettext('Completed Date'),
      value: 'completedDate',
      type: 'date',
      preSubmitCallback: transformDateFilter
    },
    {
      title: $gettext('Documents'),
      value: 'documents.category',
      type: 'select',
      items: ['MAWB']
    }
  ]
}

export const headers = () => {
  return [
    { 
      key: 'createdDate', 
      text: $gettext('Shipment ID'),
      renderSlot: 'code'
    },
    { 
      key: 'quote.client', sortable: false, 
      text: $gettext('Client'),
      wrapperClass: 'line-clamp-2',
      style: 'width: 150px;',
      renderObject: (item) => { return item.client.name }
    },
    { 
      key: 'quote.provider', sortable: false,
      text: $gettext('Provider'),
      wrapperClass: 'line-clamp-2',
      style: 'width: 150px;',
      renderObject: (item) => { return item.provider.name }
    },
    { 
      key: 'cargoVolume', sortable: false,
      text: $gettext('Volume'),
      renderSlot: 'cargoVolume'
    },
    { 
      key: 'Relationbooking.etd', sortable: true,
      text: $gettext('ETD') + '/' + $gettext('ETA'),
      renderSlot: 'etdeta'
    },
    { 
      key: 'originPort', sortable: false,
      text: $gettext('Route'),
      renderSlot: 'route'
    },
    {
      key: 'status', sortable: false,
      text: $gettext('Status'),
      renderSlot: 'status'
    },
    {
      key: 'status', sortable: false,
      text: $gettext('Debit') + '/' + $gettext('Credit'),
      renderSlot: 'voucher'
    },
    { 
      key: 'revenue.amount',
      text: $gettext('Revenues'),
      renderObject (item) {
        if(!item.revenue || !item.revenue.amount) return ''
        return item.revenue.amount?.toMoneyFormat(item.revenue.currency, true)
      },
      bodyClass: 'text-right',
      headerClass: 'text-right'
    },
    { 
      key: 'cost', 
      text: $gettext('Costs'),
      renderObject (item) {
        if(!item.cost || !item.cost.amount) return ''
        return item.cost.amount?.toMoneyFormat(item.cost.currency, true)
      },
      bodyClass: 'text-right',
      headerClass: 'text-right'
    },
    { 
      key: 'profit', 
      text: $gettext('Profit'),
      renderObject (item) {
        if(!item.profit || !item.profit.amount) return ''
        const textColor = item.profit.amount > 0 ? 'success' : 'error'
          return '<span class="text-'+ textColor +'">' + item.profit.amount?.toMoneyFormat(item.profit.currency, true) +'</span>'
      },
      bodyClass: 'text-right',
      headerClass: 'text-right'
    },
    { 
      key: 'booking', sortable: false,
      text: $gettext('Booking'),
      renderSlot: 'booking'
    },
    { 
      key: 'masterBill', sortable: false,
      text: $gettext('B/L'),
      renderSlot: 'billNo'
    },
    { 
      key: 'completedDate', 
      text: $gettext('Complete'),
      renderObject (item) {
        return item.completedDate ?  printDateTime(item.completedDate, 'DD/MM/YYYY') : ''
      },
    },
    { 
      key: 'commodities', sortable: false,
      text: $gettext('Commodity'),
      renderObject (item) {
        return item.booking.commodities
      },
    },
    { 
      key: 'referenceId',
      text: $gettext('Reference Id')
    },
    { 
      key: 'accountManager', sortable: false,
      text: $gettext('Manager'),
      sortable: false,
      renderAvatar: true,
      headerClass: 'text-center',
      bodyClass: 'text-center'
    },
    { 
      key: 'createdBy', sortable: false,
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

export const reportColumns = () => {
  return [
    {
      value: 'code',
      title: $gettext('Shipment ID'),
      sortable: true
    },
    {
      value: 'client.name',
      title: $gettext('Client')
    },
    {
      value: 'provider.name',
      title: $gettext('Provider')
    },
    {
      value: 'cargoVolume.text',
      title: $gettext('Volume (KGS)'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'cargoVolume.totalUnit',
      title: $gettext('Qty'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'cargoVolume.chargeableWeight',
      title: $gettext('CW (KGS)'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'cargoVolume.totalWeight',
      title: $gettext('GW (KGS)'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'booking.etdText',
      title: $gettext('ETD')
    },
    {
      value: 'booking.etaText',
      title: $gettext('ETA')
    },
    {
      value: 'quote.originPort.code',
      title: $gettext('Original')
    },
    {
      value: 'quote.destinationPort.code',
      title: $gettext('Destination')
    },
    {
      value: 'quote.buying',
      title: $gettext('Buying Price'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'quote.selling',
      title: $gettext('Selling Price'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'revenue.amountText',
      title: $gettext('Revenues'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'cost.amountText',
      title: $gettext('Costs'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'profit.amountText',
      title: $gettext('Profit'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'booking.code',
      title: $gettext('Booking Code')
    },
    {
      value: 'houseBill',
      title: $gettext('House Bill')
    },
    {
      value: 'masterBill',
      title: $gettext('Master Bill')
    },
    {
      value: 'booking.commodities',
      title: $gettext('Commodities')
    },
    {
      value: 'completedDateText',
      title: $gettext('Completed Date')
    },
    {
      value: 'accountManager.name',
      title: $gettext('Account Manager')
    },
    {
      value: 'createdBy.name',
      title: $gettext('Created By')
    },
    { 
      value: 'createdDateText', 
      title: $gettext('Created At'),
    },
    {
      value: 'commissionProvider.amount',
      title: $gettext('Comm. Provider'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'commissionClient.amount',
      title: $gettext('Comm. Client'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
  ]
}
export const reportGroupColumns = () => {
  return [
    {
      value: 'shipment',
      title: $gettext('Shipment')
    },
    {
      value: 'client',
      title: $gettext('Client')
    },
    {
      value: 'provider',
      title: $gettext('Provider')
    },
    {
      value: 'totalUnit',
      title: $gettext('Qty'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'volume',
      title: $gettext('Volume'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'chargeableWeight',
      title: $gettext('CW (KGS)'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'grossWeight',
      title: $gettext('GW (KGS)'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'origin',
      title: $gettext('Origin')
    },
    {
      value: 'destination',
      title: $gettext('Destination')
    },
    {
      value: 'revenue',
      title: $gettext('Revenues'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'cost',
      title: $gettext('Costs'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'profit',
      title: $gettext('Profit'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'commissionProvider',
      title: $gettext('Comm. Provider'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'commissionClient',
      title: $gettext('Comm. Client'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'buying',
      title: $gettext('Buying Price'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
    {
      value: 'selling',
      title: $gettext('Selling Price'),
      headerClass: 'text-right',
      bodyClass: 'text-right',
    },
  ]
}
export const reportFilterConfigs = (appStore) => {
  const filters = filterConfigs(appStore)
                  .filter(f => ![
                    'code,id','referenceId','quote.code',
                    'booking.code', 'booking.codeReference',
                    'status'
                  ].includes(f.value))
  filters.unshift({
    title: $gettext('Transport Type'),
    value: 'quote.transportType',
    type: 'select',
    itemTitle: 'titleFull',
    itemValue: 'value',
    items: getTransportTypes,
  })
  return filters
}