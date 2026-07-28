import VolumeByContainer from '@/components/form/CargoVolume/VolumeByContainer.vue';
import VolumeByOneUnit from '@/components/form/CargoVolume/VolumeByOneUnit.vue';
import VolumeByShipment from '@/components/form/CargoVolume/VolumeByShipment.vue';
import VolumeByUnit from '@/components/form/CargoVolume/VolumeByUnit.vue';
import EditExchangeRates from '@/components/form/EditExchangeRates.vue';
import PriceDetails from '@/components/form/PriceDetails.vue';
import { enums as ShipmentStatus } from '@/config/enums/ShipmentStatus';
import { getList as shipmentTypes } from '@/config/enums/ShipmentType';
import { enums as TransportType, getList as transportTypes } from '@/config/enums/TransportType';
import { getListByMode as getServiceTypes } from '@/config/enums/ServiceType';
import { enums as VolumeType, getList as volumeTypes } from '@/config/enums/VolumeType';
import { getList as weekdays } from '@/config/enums/WeekDay';
import ClientService from '@/services/ClientService';
import CommonService, { availableCurrencies, portFieldConfig } from '@/services/CommonService';
import ContactService from '@/services/ContactService';
// ProviderService removed - freight-specific service
const ProviderService = null;
import { useAppStore } from '@/stores/appStore';

function getRouteType(transportType) {
  if(['OCN', 'AIR', 'RAL'].includes(transportType)) return 'port'
  if(['RD', 'COU'].includes(transportType)) return 'door'
  return 'other'
}

function getCargoVolumeComponent(transportType, serviceType) {
  if(!transportType) return null
  if(transportType === 'OCN') {
    if(serviceType === 'LCL' || serviceType === 'BULK') return VolumeByUnit
    return VolumeByContainer
  }
  if(transportType === 'AIR') return VolumeByShipment
  if(transportType === 'RD') {
    if(serviceType === 'FTL') return VolumeByOneUnit
    return VolumeByUnit
  }
  if(transportType === 'RAL') {
    if(serviceType === 'LCL-RAIL') return VolumeByUnit
    return VolumeByContainer
  }
  return VolumeByUnit
}

export const makeDefaultEntity = async () => {
  return {
    shipmentMode: 2
  }
}
export const layout = (entity) => {
  const { required } = CommonService.rules()
  const appStore = useAppStore()

  const routeType = getRouteType(entity.transportType)
  const cargoVolumeComponent = entity.cargoVolumeType === VolumeType.TotalShip
    ? VolumeByShipment
    : getCargoVolumeComponent(entity.transportType, entity.serviceType)

  const serviceTypeItems = getServiceTypes(entity.transportType)
  const showCargoVolume = entity.transportType && entity.transportType !== 'MMD'

  return [
    [
      [
        {
          name: 'transportType',
          text: $gettext('Transport Mode'),
          rules: [required],
          type: 'btnSelectGroup',
          items: transportTypes,
          disabled: !!entity.id,
          columnSpan: 7
        }
      ],
      [
        {
          name: 'shipmentType',
          text: $gettext('Type'),
          rules: [required],
          type: 'btnSelectGroup',
          items: shipmentTypes,
          columnSpan: 5
        }
      ],
    ],
    [
      [
        {
          columnName: $gettext('Select Provider'),
          isTopLegend: true
        },
        {
          name: 'provider',
          text: $gettext('Provider'),
          rules: [required],
          type: 'select-search',
          apiEndpoint: ProviderService,
          callParams: entity.transportType ? { filter_transportTypes: entity.transportType } : {},
          columnSpan: 4
        },
        entity.transportType ? {
          name: 'serviceType',
          text: $gettext('Service Type'),
          rules: [required],
          type: 'select',
          items: serviceTypeItems,
          itemTitle: 'title',
          itemValue: 'value',
          disabled: !!entity.id,
          returnObject: false,
          columnSpan: 4
        } : null,
      ],
      [
        {
          columnName: $gettext('Select Client to send Quote'),
          isTopLegend: true
        },
        {
          name: 'client',
          text: $gettext('Client'),
          rules: [required],
          type: 'select-search',
          apiEndpoint: ClientService,
          columnSpan: 4,
          disabled: !!entity.id,
          itemTitle(item) {
            if(item.unpaid
              && item.unpaid.amount
              && item.unpaid.amount > item.creditLimit.amount) {
              return `<span class="text-error">${item.name} [Max Credit Exceeded]</span>`
            }
            return item.name
          }
        },
        entity.client ? {
          name: 'contactPerson',
          text: $gettext('Contact persons'),
          type: 'select-search',
          apiEndpoint: ContactService,
          searchOnProperties: ['firstName', 'lastName'],
          callParams: {'isOneOf_Client_contacts': entity.client.id },
          itemValue: 'id',
          itemTitle(item) {
            return (item.firstName ?? '') + ' ' + (item.lastName ?? '')
          },
          columnSpan: 4,
          disabled: !!entity.id
        } : {
          name: 'contactPerson',
          text: $gettext('Contact persons'),
          type: 'select',
          disabled: true
        }
      ],
      [
        {
          columnName: 'empty',
          isTopLegend: true
        },
        {
          name: 'quoteCurrency',
          text: $gettext('Quote Currency'),
          type: 'select',
          items: availableCurrencies(appStore.exchangeRatesConfig.exchangeRates),
          returnObject: false,
          columnSpan: 4,
          rules: [required],
        }
      ],
    ],
    [
      [
        {
          columnName: $gettext('Origin & Destination')
        }
      ]
    ],
    [
      [
        {
          name: 'originDoor',
          text: $gettext('Origin'),
          rules: routeType === 'door' ? [required] : [],
          prependInner: $gettext('Door'),
          columnSpan: 4
        },
        {
          name: 'originPort',
          text: $gettext('POL'),
          rules: routeType === 'port' ? [required] : [],
          show: routeType === 'port',
          ...portFieldConfig(entity.transportType)
        },
        routeType === 'port'
        ?
          {
            name: 'subOriginPort',
            text: $gettext('POL 2'),
            ...portFieldConfig(entity.transportType)
          }
        : null
      ],
      [
        {
          name: 'destinationDoor',
          text: $gettext('Destination'),
          rules: routeType === 'door' ? [required] : [],
          prependInner: $gettext('Door'),
          columnSpan: 4
        },
        {
          name: 'destinationPort',
          text: $gettext('POD'),
          rules: routeType === 'port' ? [required] : [],
          show: routeType === 'port',
          ...portFieldConfig(entity.transportType)
        },
        routeType === 'port'
        ?
          {
            name: 'subDestinationPort',
            text: $gettext('POD 2'),
            ...portFieldConfig(entity.transportType)
          }
        : null
      ],
      [
        {
          text: 'empty',
          type: 'text',
          renderText: '',
          bodyClass: 'pb-10'
        },
        {
          name: 'vesselNo',
          text: $gettext('Vessel Number')
        },
        {
          name: 'subVesselNo',
          text: $gettext('Vessel 2 Number')
        },
      ],

    ],
    showCargoVolume ? [
      [
        {
          columnName: $gettext('Cargo Volume')
        }
      ]
    ] : null,
    ['OCN', 'RD'].includes(entity.transportType) && ['LCL', 'LTL', 'GROUPAGE'].includes(entity.serviceType) ? [
      [
        {
          name: 'cargoVolumeType',
          type: 'radioGroup',
          items: volumeTypes
                  .filter(({value}) => [
                    VolumeType.Unit,
                    VolumeType.TotalShip
                  ].includes(value)),
          inline: true
        },
      ],
    ] : null,
    showCargoVolume ? [
      [
        {
          name: 'cargoVolume',
          type: 'custom',
          component: cargoVolumeComponent,
          context: {
            transportType: entity.transportType,
            serviceType: entity.serviceType
          }
        },
      ],
    ] : null,
    [
      [
        {
          columnName: $gettext('Price Details')
        }
      ]
    ],
    (entity.provider
      && (entity.originPort || entity.originDoor)
      && (entity.destinationPort || entity.destinationDoor)
    ) ? [
      [
        {
          name: 'prices',
          type: 'custom',
          component: PriceDetails,
          quote: {
            transportType: entity.transportType,
            serviceType: entity.serviceType,
            provider: entity.provider,
            cargoVolume: entity.cargoVolume ?? null,
            exchangeRates: entity.exchangeRates ?? {},
            originPort: entity.originPort,
            destinationPort: entity.destinationPort,
          }
        },
        {
          name: 'exchangeRates',
          type: 'custom',
          component: EditExchangeRates,
          toCurrency: entity.quoteCurrency ?? appStore.exchangeRatesConfig?.currency?.code
        }
      ],
    ] : [
      [
        {
          type: 'text',
          renderText: '<span class="text-error">' + $gettext('Please input Origin, Destination and Provider data first.') + '</span>'
        }
      ]
    ],
    [
      [
        {
          columnName: $gettext('Validity and Schedule')
        }
      ]
    ],
    [
      [
        {
          name: 'createdDate',
          text: $gettext('Created On'),
          type: 'datePicker',
          disabled: !!entity.id
        }
      ],
      [
        {
          name: 'validUntil',
          text: $gettext('Valid Until'),
          type: 'datePicker',
          rules: [required]
        }
      ],
      [
        {
          name: 'schedule',
          text: $gettext('Schedule'),
          type: 'select',
          multiple: true,
          returnObject: false,
          items: weekdays
        }
      ]
    ],
    [
      [
        {
          name: 'remark',
          text: $gettext('Remark'),
          type: 'textarea',
          columnSpan: 8
        }
      ],
      [
        {
          name: 'transitTime',
          text: $gettext('Transit Time (days)'),
          type: 'number',
          columnSpan: 4
        }
      ]
    ],
    [
      [
        {
          columnName: $gettext('Other Information')
        }
      ]
    ],
    [
      [
        {
          name: 'estimatedDeparture',
          text: $gettext('Estimated Time of Departure (ETD)'),
          type: 'datePicker'
        }
      ],
      [
        {
          name: 'cargoReady',
          text: $gettext('Cargo Ready Date'),
          type: 'datePicker'
        }
      ],
      [
        {
          name: 'incoterm',
          text: $gettext('Incoterms'),
          type: 'select',
          items: appStore.getList('incoterms'),
          itemTitle: 'name',
          itemValue: 'id'
        },

      ]
    ],
    [
      [
        {
          name: 'note',
          text: $gettext('Note'),
          type: 'textarea',
          columnSpan: 8
        }
      ],
      [
        {
          name: 'commodities',
          text: $gettext('Commodities'),
          columnSpan: 4
        }
      ]
    ]
  ]
}

export const detailsLayout = (entity, context) => {
  const { required } = CommonService.rules()
  const appStore = useAppStore()

  const routeType = getRouteType(entity.transportType)
  const cargoVolumeComponent = entity.cargoVolumeType === VolumeType.TotalShip
    ? VolumeByShipment
    : getCargoVolumeComponent(entity.transportType, entity.serviceType)

  const serviceTypeItems = getServiceTypes(entity.transportType)
  const showCargoVolume = entity.transportType && entity.transportType !== 'MMD'
  const shouldShowDoor = !(['OCN', 'AIR', 'RAL'].includes(entity.transportType))

  return [
    [
      [
        {
          name: 'transportType',
          text: $gettext('Transport Mode'),
          rules: [required],
          type: 'btnSelectGroup',
          items: transportTypes,
          disabled: !!entity.id,
          columnSpan: 7
        }
      ],
      [
        {
          name: 'shipmentType',
          text: $gettext('Type'),
          type: 'btnSelectGroup',
          items: shipmentTypes,
          columnSpan: 5
        }
      ],
    ],
    [
      [
        {
          columnName: $gettext('Select Provider'),
          isTopLegend: true
        },
        {
          name: 'provider',
          text: $gettext('Provider'),
          rules: [required],
          type: 'select-search',
          apiEndpoint: ProviderService,
          callParams: entity.transportType ? { filter_transportTypes: entity.transportType } : {},
          columnSpan: 3
        },
        entity.transportType ? {
          name: 'serviceType',
          text: $gettext('Service Type'),
          rules: [required],
          type: 'select',
          items: serviceTypeItems,
          itemTitle: 'title',
          itemValue: 'value',
          disabled: !!entity.id,
          returnObject: false,
        } : null,
      ],
      [
        {
          columnName: $gettext('Select a Carrier'),
          isTopLegend: true
        },
        {
          name: 'carrier',
          text: $gettext('Carrier'),
          type: 'select-search',
          apiEndpoint: ProviderService,
          columnSpan: 3
        }
      ],
      [
        {
          columnName: $gettext('Select Client'),
          isTopLegend: true
        },
        {
          name: 'client',
          text: $gettext('Client'),
          rules: [required],
          type: 'select-search',
          apiEndpoint: ClientService,
          columnSpan: 3,
          itemTitle(item) {
            if(item.unpaid
              && item.unpaid.amount
              && item.unpaid.amount > item.creditLimit.amount) {
              return `<span class="text-error">${item.name} [Max Credit Exceeded]</span>`
            }
            return item.name
          }
        }
      ],
      [
        {
          columnName: 'empty',
          isTopLegend: true
        },
        entity.client ? {
          name: 'contactPerson',
          text: $gettext('Contact persons'),
          type: 'select-search',
          apiEndpoint: ContactService,
          searchOnProperties: ['firstName', 'lastName'],
          callParams: {'isOneOf_Client_contacts': entity.client.id },
          itemValue: 'id',
          itemTitle(item) {
            return (item.firstName ?? '') + ' ' + (item.lastName ?? '')
          },
          columnSpan: 3,
          disabled: !!entity.id && context.status !== ShipmentStatus.Draft && context.status !== ShipmentStatus.Pending
        } : {
          name: 'contactPerson',
          text: $gettext('Contact persons'),
          type: 'select',
          disabled: true
        }
      ],
    ],
    [
      [
        {
          columnName: $gettext('Origin & Destination')
        }
      ]
    ],
    [
      [
        shouldShowDoor ? {
          name: 'originDoor',
          text: $gettext('Origin'),
          prependInner: $gettext('Door')
        } : null,
        {
          name: 'originPort',
          text: $gettext('POL'),
          rules: [required],
          ...portFieldConfig(entity.transportType)
        },
        routeType === 'port'
        ?
          {
            name: 'subOriginPort',
            text: $gettext('POL 2'),
            ...portFieldConfig(entity.transportType)
          }
        : null
      ].filter(i => i),
      [
        shouldShowDoor ? {
          name: 'destinationDoor',
          text: $gettext('Destination'),
          prependInner: $gettext('Door')
        } : null,
        {
          name: 'destinationPort',
          text: $gettext('POD'),
          rules: [required],
          ...portFieldConfig(entity.transportType)
        },
        routeType === 'port'
        ?
          {
            name: 'subDestinationPort',
            text: $gettext('POD 2'),
            ...portFieldConfig(entity.transportType)
          }
        : null
      ].filter(i => i),
      [
        shouldShowDoor ? {
          text: 'empty',
          type: 'text',
          renderText: '',
          bodyClass: 'pb-10'
        } : null,
        {
          name: 'vesselNo',
          text: $gettext('Vessel Number')
        },
        {
          name: 'subVesselNo',
          text: $gettext('Vessel 2 Number')
        },
      ].filter(i => i),
    ],
    showCargoVolume ? [
      [
        {
          columnName: $gettext('Cargo Volume')
        }
      ]
    ] : null,
    ['OCN', 'AIR', 'RD'].includes(entity.transportType) && ['LCL', 'LTL', 'GROUPAGE', 'DIRECT', 'CONSOL'].includes(entity.serviceType) ? [
      [
        {
          name: 'cargoVolumeType',
          type: 'radioGroup',
          items: volumeTypes.filter(({value}) => [VolumeType.Unit, VolumeType.TotalShip].includes(value)),
          inline: true
        },
      ],
    ] : null,
    showCargoVolume ? [
      [
        {
          name: 'cargoVolume',
          type: 'custom',
          component: cargoVolumeComponent,
          context: {
            transportType: entity.transportType,
            serviceType: entity.serviceType,
            ...context
          }
        },
      ],
    ] : null,

    [
      [
        {
          columnName: $gettext('Validity and Schedule')
        }
      ]
    ],
    [
      [
        {
          name: 'createdDate',
          text: $gettext('Created On'),
          type: 'datePicker',
          disabled: !!entity.id
        }
      ],
      [
        {
          name: 'validUntil',
          text: $gettext('Valid Until'),
          type: 'datePicker',
          rules: [required]
        }
      ],
      [
        {
          name: 'schedule',
          text: $gettext('Schedule'),
          type: 'select',
          multiple: true,
          returnObject: false,
          items: weekdays
        }
      ]
    ],
    [
      [
        {
          name: 'remark',
          text: $gettext('Remark'),
          type: 'textarea',
          columnSpan: 8
        }
      ],
      [
        {
          name: 'transitTime',
          text: $gettext('Transit Time (days)'),
          type: 'number',
          columnSpan: 4
        }
      ]
    ],
    [
      [
        {
          columnName: $gettext('Other Information')
        }
      ]
    ],
    [
      [
        {
          name: 'estimatedDeparture',
          text: $gettext('Estimated Time of Departure (ETD)'),
          type: 'datePicker'
        }
      ],
      [
        {
          name: 'cargoReady',
          text: $gettext('Cargo Ready Date'),
          type: 'datePicker'
        }
      ],
    ],
    [
      [
        {
          name: 'note',
          text: $gettext('Note'),
          type: 'textarea',
          columnSpan: 8
        }
      ],
      [
        {
          name: 'incoterm',
          text: $gettext('Incoterms'),
          type: 'select',
          items: appStore.getList('incoterms'),
          itemTitle: 'name',
          itemValue: 'id',
          columnSpan: 4
        },
        {
          name: 'commodities',
          text: $gettext('Commodities'),
        }
      ]
    ]
  ]
}

export const priceLayout = (entity) => {
  const { required } = CommonService.rules()
  const appStore = useAppStore()

  return [
    [
      [
        {
          columnName: $gettext('Price Details')
        }
      ]
    ],
    [
      [
        {
          name: 'prices',
          type: 'custom',
          component: PriceDetails,
          quote: {
            transportType: entity.transportType,
            serviceType: entity.serviceType,
            provider: entity.provider,
            cargoVolume: entity.cargoVolume ?? null,
            exchangeRates: entity.exchangeRates ?? {},
            originPort: entity.originPort,
            destinationPort: entity.destinationPort,
          }
        },
      ],
    ],
    [
      [
        {
          name: 'exchangeRates',
          type: 'custom',
          component: EditExchangeRates,
          toCurrency: entity.quoteCurrency ?? appStore.exchangeRatesConfig?.currency?.code
        },
      ],
    ],
  ]
}
