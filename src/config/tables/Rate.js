import { enums as ChargeType } from '@/config/enums/ChargeType';
import { enums as UserStatus } from '@/config/enums/UserStatus';
import { slugToValue } from '@/config/enums/TransportType';
import { printDate, printDateTime, transformDateFilter } from '@/services/CommonService';
import { getTitle as getLocalChargeTypeTitle } from '../enums/LocalChargeType';
import { getTitle as getContainerTypeTitle } from '../enums/ContainerType';
import { getTitle as getFreightTermTitle } from '../enums/FreightTerm';
export const filterConfigs = (route, appStore) => {
  const transportType = slugToValue(route.params.transportType)
  return [
    {
      title: $gettext('Name'),
      value: 'name',
      type: 'text'
    },
    {
      title: $gettext('Calculation Type'),
      value: 'charge.calculationType',
      type: 'select',
      items: appStore.getList('calculationTypes').filter(({ transportTypes }) => transportTypes.includes(transportType)),
      itemTitle: 'name',
      itemValue: 'id',
    },
    {
      title: $gettext('Valid From'),
      value: 'validFrom',
      type: 'date',
      preSubmitCallback: transformDateFilter,
      toUTCDateOnPick: false,
      toDateOnMounted: false
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

export const headers = (currentChargeType) => {
  const isLocal   = currentChargeType.value === ChargeType.LOCAL
  const isFreight = currentChargeType.value === ChargeType.FREIGHT
  return [
    isLocal ? {
      key: 'provider',
      text: $gettext('Provider'),
      wrapperClass: 'line-clamp-2',
      style: 'width: 120px;',
      renderObject (item) { return item.provider?.name }
    } : null,
    isFreight ? {
      key: 'provider',
      text: $gettext('Carrier'),
      wrapperClass: 'line-clamp-2',
      style: 'width: 120px;',
      renderObject (item) { return item.provider?.name }
    } : null,
    isFreight ? {
      key: 'polPort',
      text: $gettext('POL'),
      style: 'width: 100px;',
      renderObject (item) { return item.polPort?.displayName ?? item.polPort?.code }
    } : null,
    isFreight ? {
      key: 'podPort',
      text: $gettext('POD'),
      style: 'width: 100px;',
      renderObject (item) { return item.podPort?.displayName ?? item.podPort?.code }
    } : null,
    isFreight ? {
      key: 'viaPort',
      text: $gettext('Via'),
      style: 'width: 90px;',
      renderObject (item) { return item.viaPort?.code ?? '—' }
    } : null,
    isFreight ? {
      key: 'containerType',
      text: $gettext('Container'),
      renderObject (item) { return item.containerType ? getContainerTypeTitle(item.containerType) : '—' }
    } : null,
    {
      key: 'charge',
      text: $gettext('Name'),
      renderObject (item) { return item.charge?.name }
    },
    isLocal ? {
      key: 'localChargeType',
      text: $gettext('Type'),
      renderObject (item) { return getLocalChargeTypeTitle(item.localChargeType) }
    } : null,
    isLocal ? {
      key: 'localChargePort',
      text: $gettext('Port'),
      wrapperClass: 'line-clamp-2',
      style: 'width: 120px;',
      renderObject (item) { return item.localChargePort?.displayName }
    } : null,
    {
      key: 'charge',
      text: $gettext('Calculation Type'),
      renderObject (item) { return item.charge?.calculationType?.name }
    },
    isFreight ? {
      key: 'transitTime',
      text: $gettext('Transit (days)'),
      renderObject (item) { return item.transitTime ?? '—' }
    } : null,
    isFreight ? {
      key: 'freightTerm',
      text: $gettext('Term'),
      renderObject (item) { return item.freightTerm ? getFreightTermTitle(item.freightTerm) : '—' }
    } : null,
    {
      key: 'buying',
      text: isLocal ? $gettext('Currency Buying') : $gettext('Currency'),
      renderObject (item) { return item.buying?.currency }
    },
    {
      key: 'buying',
      text: isLocal ? $gettext('Buying Rate') : $gettext('Price'),
      renderObject (item) { return item.buying?.amount?.toMoneyFormat(item.buying.currency, false) }
    },
    isLocal || isFreight ? {
      key: 'selling',
      text: $gettext('Currency Selling'),
      renderObject (item) { return item.selling?.currency }
    } : null,
    isLocal || isFreight ? {
      key: 'selling',
      text: $gettext('Selling Rate'),
      renderObject (item) { return item.selling?.amount?.toMoneyFormat(item.selling.currency, false) }
    } : null,
    {
      key: 'validFrom',
      text: $gettext('Valid From'),
      renderObject (item) { return item.validFrom ? printDate(item.validFrom) : '' }
    },
    {
      key: 'validUntil',
      text: $gettext('Valid Until'),
      renderObject (item) { return item.validUntil ? printDate(item.validUntil) : '' }
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
      renderObject (item) { return item.createdDate ? printDateTime(item.createdDate) : '' },
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