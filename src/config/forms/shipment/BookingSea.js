import { getTitle as getContainerTitle } from '@/config/enums/ContainerType';
import { getList as freightTerms } from '@/config/enums/FreightTerm';
import { enums as TransportType } from '@/config/enums/TransportType';
import { enums as VolumeType } from '@/config/enums/VolumeType';
import { portFieldConfig } from '@/services/CommonService';
function layoutOrigin (entity) {
  return [
    [
      [
        {
          name: 'placeReceipt',
          text: $gettext('Place of Receipt'),
          acceptTextInput: true,
          ...portFieldConfig()
        }
      ],
      [
        {
          name: 'portLoading',
          text: $gettext('Port of loading'),
          ...portFieldConfig(entity.transportType)
        }
      ]
    ],
    [
      [
        {
          name: 'pickup',
          text: $gettext('Pick up'),
          acceptTextInput: true,
          ...portFieldConfig()
        }
      ],
      [
        {
          name: 'etd',
          text: $gettext('ETD'),
          type: 'datetimePicker'
        }
      ]
    ],
    [
      [
        {
          name: 'pickupDate',
          text: $gettext('Date of Pick up'),
          type: 'datePicker'
        }
      ],
      [
        {
          name: 'warehouse',
          text: $gettext('Drop off / Warehouse')
        }
      ]
    ],
    [
      [
        {
          name: 'feederVessel',
          text: $gettext('Feeder Vessel')
        }
      ],
      [
        {
          name: 'feederVoyage',
          text: $gettext('Feeder Voyage')
        }
      ]
    ],
    [
      [
        {
          name: 'motherVessel',
          text: $gettext('Mother Vessel')
        }
      ],
      [
        {
          name: 'motherVoyage',
          text: $gettext('Mother Voyage')
        }
      ]
    ],
    entity.serviceType === 'LCL' ? [
      [
        {
          name: 'placeStuffing',
          text: $gettext('Place Stuffing')
        }
      ],
      [
        {
          name: 'dateStuffing',
          text: $gettext('Date Stuffing'),
          type: 'datePicker'
        }
      ]
    ] : [],
    [
      [
        {
          name: 'provider',
          text: $gettext('Provider'),
          type: 'select',
          disabled: true,
          itemValue: 'id',
          itemTitle: 'name',
        }
      ],
      [
        {
          name: 'carrier',
          text: $gettext('Carrier'),
          type: 'select',
          disabled: true
        }
      ]
    ],
    [
      [
        {
          name: 'cyCutOff',
          text: $gettext('CY Cut-off'),
          type: 'datetimePicker'
        }
      ],
      [
        {
          name: 'siCutOff',
          text: $gettext('SI Cut-off'),
          type: 'datetimePicker'
        }
      ]
    ],
    [
      [
        {
          name: 'vgmCutOff',
          text: $gettext('VGM Cut-off'),
          type: 'datetimePicker'
        }
      ],
      [
        {
          name: 'gateIn',
          text: $gettext('Gate In'),
          type: 'datetimePicker'
        }
      ]
    ],
    [
      [
        {
          name: 'temperature',
          text: $gettext('Temp')
        }
      ],
      [
        {
          name: 'vent',
          text: $gettext('Vent')
        }
      ]
    ],
    [
      [
        {
          name: 'freightTerms',
          text: $gettext('Freight Terms'),
          type: 'select',
          items: freightTerms,
          returnObject: false,
          columnSpan: 6
        }
      ]
    ],
    [
      [
        {
          name: 'terms',
          text: $gettext('Terms and Conditions'),
          type: 'textarea'
        }
      ]
    ]
  ]
}
function layoutDestination (entity) {
  return [
    [
      [
        {
          name: 'portDischarge',
          text: $gettext('Port of Discharge'),
          ...portFieldConfig(entity.transportType)
        }
      ],
      [
        {
          name: 'placeDelivery',
          text: $gettext('Place of Delivery'),
          acceptTextInput: true,
          ...portFieldConfig()
        }
      ]
    ],
    [
      [
        {
          name: 'destination',
          text: $gettext('Final Destination'),
          acceptTextInput: true,
          ...portFieldConfig()
        }
      ],
      [
        {
          name: 'eta',
          text: $gettext('ETA'),
          type: 'datetimePicker'
        }
      ]
    ],
  ]
}
function layoutConsignment (entity) {
  return [
    [
      [
        entity.cargoVolumeType === VolumeType.Container  ? {
          name: 'wut',
          text: $gettext('Volume'),
          disabled: true,
          modelValue: entity.items.map(i => i.amount + ' x ' + getContainerTitle(i.value)).join(', ') 
        } : {
          name: 'totalUnit',
          text: $gettext('No of Package(s)')
        }
      ],
      [
        {
          name: 'commodities',
          text: $gettext('Commodity')
        }
      ]
    ],
    [
      [
        {
          name: 'totalWeight',
          text: $gettext('Gross Weight (KGS)')
        }
      ],
      [
        {
          name: 'totalCBM',
          text: $gettext('Measurement (CBM)')
        }
      ]
    ],
  ]
}
function layoutContact (entity) {
  if(entity.serviceType === 'LCL')
    return [
      [
        [
          {
            name: 'contactNumber',
            text: $gettext('Contact at warehouse')
          }
        ],
        [
          {
            name: 'codeWarehouse',
            text: $gettext('Code Warehouse')
          }
        ]
      ],
      [
        [
          {
            name: 'remark',
            text: $gettext('Special remark'),
            columnSpan: 6
          }
        ],
        [
          {
            name: 'contactDate',
            text: $gettext('Date of Creation'),
            type: 'datePicker'
          }
        ],
      ]
    ]
  return [
    [
      [
        {
          name: 'contactNumber',
          text: $gettext('Contact')
        }
      ],
      [
        {
          name: 'contactDate',
          text: $gettext('Date of Creation'),
          type: 'datePicker'
        }
      ],
    ],
    [
      [
        {
          name: 'remark',
          text: $gettext('Special remark'),
          columnSpan: 6
        }
      ]
    ]
  ]
}
export default {
  layoutOrigin,
  layoutDestination,
  layoutConsignment,
  layoutContact
}
