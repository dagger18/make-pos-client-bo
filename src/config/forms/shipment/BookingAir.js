import { getTitle as getContainerTitle } from '@/config/enums/ContainerType';
import { getList as freightTerms } from '@/config/enums/FreightTerm';
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
          text: $gettext('Air-port of loading'),
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
          name: 'vesselNo',
          text: $gettext('Flight No.')
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
          text: $gettext('Air-line'),
          type: 'select',
          disabled: true
        }
      ]
    ],
    [
      [
        {
          name: 'cyCutOff',
          text: $gettext('Cut-off'),
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
          text: $gettext('Air-port of Discharge'),
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
  return [
    [
      [
        {
          name: 'contactNumber',
          text: $gettext('Contact No.')
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
}
export default {
  layoutOrigin,
  layoutDestination,
  layoutConsignment,
  layoutContact
}
