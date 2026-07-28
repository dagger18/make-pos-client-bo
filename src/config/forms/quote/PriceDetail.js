import { enums as ChargeType } from '@/config/enums/ChargeType';
import { getList as getChargeTypes } from '@/config/enums/PriceDetailChargeType';
import { enums as TransportType } from '@/config/enums/TransportType';
import CommonService, { multiFloat } from '@/services/CommonService';
import ProviderService from '@/services/ProviderService';
import DepartmentService from '@/services/DepartmentService';
import { getList as getPayableAtList } from '@/config/enums/PayableAt';
import { getList as getVisibleToList } from '@/config/enums/VisibleTo';
import { useAppStore } from '@/stores/appStore';
import { v4 as uuidv4 } from 'uuid';
export const makeDefaultEntity = (quote) => {
  return {
    id: null,
    chargeType: null,
    charge: null,
    chargeName: null,
    calculationType: null,
    description: null,
    provider: quote.provider,
    buying: null,
    selling: null,
    quantity: null,
    quote,
    tempId: uuidv4()
  }
}
export const layout = (entity, context) => {
  const charges = useAppStore().getList('charges')
  const { required } = CommonService.rules()
  const chargeTypes = getChargeTypes(entity.quote.transportType)
  // todo: cover for different custom charge type here
  const chargeTypeAlias = entity.chargeType
                          ? chargeTypes.find(({value}) => value === entity.chargeType)?.alias
                          : null
  let chargeList = charges.filter(
    charge => charge.transportType === entity.quote.transportType
              && chargeTypeAlias
              && charge.chargeType === chargeTypeAlias
              && (chargeTypeAlias !== 'CT' || (charge.customChargeType && charge.customChargeType.id == entity.chargeType))
  )
  if(entity.chargeType === 'TK') {
    // handle trucking for air => system charge RD (by_kgs / pickup / delivery)
    if(entity.quote.transportType === TransportType.AIR) {
      chargeList = charges.filter(
        charge => charge.transportType === TransportType.Road
                  && charge.chargeType === ChargeType.Freight
                  && charge.calculationType.code === 'by_kgs'
      )
      if(chargeList.length > 0) {
        const delivery = JSON.parse(JSON.stringify(chargeList[0]))
        delivery.name += ' (Delivery)'
        const pickup = JSON.parse(JSON.stringify(chargeList[0]))
        pickup.name += ' (Pickup)'
        chargeList = [delivery, pickup]
      }
    }
    // handle trucking for OCN => system charge RD (pickup / delivery)
    // FCL-like → flat rate, LCL → by_cbm
    if(entity.quote.transportType === TransportType.Ocean) {
      const isLCL = entity.quote.serviceType === 'LCL'
      const chargeListRaw = charges.filter(
        charge => charge.transportType === TransportType.Road
                  && charge.chargeType === ChargeType.Freight
                  && (!isLCL || charge.calculationType.code === 'by_cbm')
      )
      chargeList = []
      chargeListRaw.forEach(charge => {
        const delivery = JSON.parse(JSON.stringify(charge))
        delivery.name += ' (Delivery)'
        const pickup = JSON.parse(JSON.stringify(charge))
        pickup.name += ' (Pickup)'
        chargeList.push(delivery)
        chargeList.push(pickup)
      })
    }
  }
  const isEmptyEntity = entity.chargeType === null
                        && entity.charge === null
                        && entity.calculationType === null
                        && entity.description === null
                        && entity.quantity === null

  return [
    [
      [
        {
          name: 'firstDummy',
          type: 'text',
          text: '',
          groupedInputs: true,
          scrollable: true,
          groupedWidth: '30px'
        },
        {
          name: 'chargeType',
          type: 'select',
          text: $gettext('Charge Type'),
          placeholder: $gettext('Charge Type'),
          items: chargeTypes,
          groupedWidth: '150px',
          returnObject: false,
          rules: [isEmptyEntity ? null: required].filter(Boolean)
        },
        {
          name: 'chargeName',
          type: 'combobox',
          groupedWidth: '200px',
          text: $gettext('Item Name'),
          placeholder: $gettext('Item Name'),
          items: chargeList,
          itemTitle: 'name',
          itemValue: 'id',
          autocomplete: 'off',
          rules: [isEmptyEntity ? null: required].filter(Boolean)
        },
        {
          name: 'calculationType',
          text: $gettext('Calculated By'),
          placeholder: $gettext('Calculated By'),
          groupedWidth: '150px',
        },
        {
          name: 'description',
          text: $gettext('Description'),
          placeholder: $gettext('Description'),
          groupedWidth: '250px',
        },
        {
          name: 'provider',
          type: 'select-search',
          apiEndpoint: ProviderService,
          text: $gettext('Provider'),
          placeholder: $gettext('Provider'),
          groupedWidth: '150px'
        },
        {
          name: 'buying',
          type: 'number',
          numberMode: 'money',
          groupedWidth: '170px',
          text: $gettext('Buying'),
          placeholder: $gettext('Buying'),
          xrateMap: entity.quote.exchangeRates ?? {}
        },
        {
          name: 'selling',
          type: 'number',
          numberMode: 'money',
          groupedWidth: '170px',
          text: $gettext('Selling'),
          placeholder: $gettext('Selling'),
          xrateMap: entity.quote.exchangeRates ?? {}
        },
        {
          name: 'quantity',
          type: 'number',
          groupedWidth: '110px',
          text: $gettext('Qty'),
          placeholder: $gettext('Qty'),
          rules: [isEmptyEntity ? null: required].filter(Boolean)
        },
        {
          name:'amountBuying',
          type: 'text',
          text: $gettext('Amount Buying'),
          renderText: (entity.buying && entity.quantity)
                    ? multiFloat(entity.buying.amount, entity.quantity)
                      .toMoneyFormat(entity.buying.currency)
                    : 0,
          groupedWidth: '130px',
          bodyClass: 'float-right pe-2',
          groupedInputsLabelClass: 'd-flex pe-5 w-100 justify-end'
        },
        {
          name:'amountSelling',
          type: 'text',
          text: $gettext('Amount Selling'),
          renderText: (entity.selling && entity.quantity)
                      ? multiFloat(entity.selling.amount, entity.quantity)
                        .toMoneyFormat(entity.selling.currency)
                      : 0,
          groupedWidth: '130px',
          bodyClass: 'float-right pe-2',
          groupedInputsLabelClass: 'd-flex pe-5 w-100 justify-end'
        },
        ...(useAppStore().getList('departments').length > 0 ? [
          {
            name: 'department',
            type: 'select-search',
            apiEndpoint: DepartmentService,
            text: $gettext('Department'),
            placeholder: $gettext('Department'),
            groupedWidth: '150px',
          },
          {
            name: 'payableAt',
            type: 'select',
            items: getPayableAtList,
            text: $gettext('Payable At'),
            placeholder: $gettext('Payable At'),
            groupedWidth: '130px',
            clearable: true,
          },
          {
            name: 'visibleTo',
            type: 'select',
            items: getVisibleToList,
            text: $gettext('Visible To'),
            placeholder: $gettext('Visible To'),
            groupedWidth: '130px',
            clearable: true,
          },
        ] : []),
      ].sort((a, b) => {
        if(a.name === 'firstDummy') return -1
        if(b.name === 'firstDummy') return 1
        const aPosition = context.headerPositions.findIndex(pos => pos === a.name)
        const bPosition = context.headerPositions.findIndex(pos => pos === b.name)
        if(aPosition !== -1 && bPosition !== -1) return aPosition - bPosition
        if(aPosition !== -1 && bPosition === -1) return -1
        if(aPosition === -1 && bPosition !== -1) return 1
        return 0
      })
    ]
  ]
}
