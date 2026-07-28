import { enums as CHARGE_TYPE } from '@/config/enums/ChargeType';
import { getList as localChargeTypes } from '@/config/enums/LocalChargeType';
import { getList as containerTypes } from '@/config/enums/ContainerType';
import { getList as freightTerms } from '@/config/enums/FreightTerm';
import CommonService, { portFieldConfig } from '@/services/CommonService';
import ProviderService from '@/services/ProviderService';
import { useAppStore } from '@/stores/appStore';
export const makeDefaultEntity = async () => {
  return {}
}
export const layout = (entity) => {
  const { required } = CommonService.rules()
  const appStore = useAppStore()
  if (entity.chargeType === CHARGE_TYPE.Service) {
    return [
      [
        [
          {
            name: 'validFrom',
            text: $gettext('Valid From'),
            type: 'datePicker'
          },
          {
            name: 'validUntil',
            text: $gettext('Valid Until'),
            rules: [required],
            type: 'datePicker'
          }
        ],
        [
          {
            name: 'charge',
            text: $gettext('Service Name'),
            type: 'select',
            items: appStore
                  .getList('charges')
                  .filter(c => c.transportType === entity.transportType && c.chargeType === entity.chargeType),
            itemTitle: 'name',
            itemValue: 'id',
            rules: [required]

          },
          {
            name: 'calculationType',
            text: $gettext('Calculation Type'),
            modelValue: entity.charge ? entity.charge.calculationType : null,
            type: 'select',
            disabled: true,
            itemTitle: 'name',
            itemValue: 'id'
          }
        ],
        [
          {
            name: 'buying',
            text: $gettext('Price'),
            type: 'number',
            numberMode: 'money',
            rules: [required]
          }
        ]
      ]
    ]
  }
  if (entity.chargeType === CHARGE_TYPE.Local) {
    return [
      [
        [
          {
            name: 'provider',
            text: $gettext('Provider'),
            rules: [required],
            type: 'select-search',
            apiEndpoint: ProviderService,
            columnSpan: 4
          },
        ],
        [
          {
            name: 'localChargePort',
            text: $gettext('Port'),
            rules: [required],
            ...portFieldConfig(entity.transportType),
            columnSpan: 4
          }
        ],
        [
          {
            text: $gettext('Type'),
            name: 'localChargeType',
            type: 'radioGroup',
            items: localChargeTypes,
            rules: [required],
            inline: true
          },
        ]

      ],
      [
        [
          {
            name: 'validFrom',
            text: $gettext('Valid From'),
            type: 'datePicker'
          },
          {
            name: 'validUntil',
            text: $gettext('Valid Until'),
            rules: [required],
            type: 'datePicker'
          }
        ],
        [
          {
            name: 'charge',
            text: $gettext('Service Name'),
            type: 'select',
            items: appStore
                  .getList('charges')
                  .filter(c => c.transportType === entity.transportType && c.chargeType === entity.chargeType),
            itemTitle: 'name',
            itemValue: 'id',
            rules: [required]

          },
          {
            name: 'calculationType',
            text: $gettext('Calculation Type'),
            modelValue: entity.charge ? entity.charge.calculationType : null,
            type: 'select',
            disabled: true,
            itemTitle: 'name',
            itemValue: 'id'
          }
        ],
        [
          {
            name: 'buying',
            text: $gettext('Buying Price'),
            type: 'number',
            numberMode: 'money',
            rules: [required]
          },
          {
            name: 'selling',
            text: $gettext('Selling Price'),
            type: 'number',
            numberMode: 'money'
          }
        ]
      ]
    ]
  }
  if (entity.chargeType === CHARGE_TYPE.Freight) {
    const isSeaFcl = entity.transportType === 'OCN'
    return [
      [
        // Column 1: Carrier → Freight Term (select) → Transit Time → [Container Type for FCL]
        [
          {
            name: 'provider',
            text: $gettext('Carrier'),
            rules: [required],
            type: 'select-search',
            apiEndpoint: ProviderService,
            columnSpan: 4
          },
          {
            name: 'freightTerm',
            text: $gettext('Freight Term'),
            type: 'select',
            items: freightTerms,
            itemTitle: 'title',
            itemValue: 'value',
          },
          {
            name: 'transitTime',
            text: $gettext('Transit Time (days)'),
            type: 'number',
          },
          ...(isSeaFcl ? [{
            name: 'containerType',
            text: $gettext('Container Type'),
            type: 'select',
            items: containerTypes,
            itemTitle: 'title',
            itemValue: 'value',
            rules: [required],
          }] : []),
        ],
        // Column 2: POL → POD → Via Port (stacked so Via Port is directly below POD)
        [
          {
            name: 'polPort',
            text: $gettext('Port of Loading (POL)'),
            rules: [required],
            ...portFieldConfig(entity.transportType),
            columnSpan: 4
          },
          {
            name: 'podPort',
            text: $gettext('Port of Discharge (POD)'),
            rules: [required],
            ...portFieldConfig(entity.transportType),
          },
          {
            name: 'viaPort',
            text: $gettext('Via Port (Transshipment)'),
            ...portFieldConfig(entity.transportType),
          },
        ],
        // Column 3: Commodity textarea
        [
          {
            name: 'commodity',
            text: $gettext('Commodity'),
            type: 'textarea',
            rows: 6,
            columnSpan: 4
          },
        ],
      ],
      [
        [
          {
            name: 'validFrom',
            text: $gettext('Valid From'),
            type: 'datePicker'
          },
          {
            name: 'validUntil',
            text: $gettext('Valid Until'),
            rules: [required],
            type: 'datePicker'
          }
        ],
        [
          {
            name: 'charge',
            text: $gettext('Freight Charge Name'),
            type: 'select',
            items: appStore
                  .getList('charges')
                  .filter(c => c.transportType === entity.transportType && c.chargeType === entity.chargeType),
            itemTitle: 'name',
            itemValue: 'id',
            rules: [required]
          },
          {
            name: 'calculationType',
            text: $gettext('Calculation Type'),
            modelValue: entity.charge ? entity.charge.calculationType : null,
            type: 'select',
            disabled: true,
            itemTitle: 'name',
            itemValue: 'id'
          }
        ],
        [
          {
            name: 'buying',
            text: $gettext('Buying Rate'),
            type: 'number',
            numberMode: 'money',
            rules: [required]
          },
          {
            name: 'selling',
            text: $gettext('Selling Rate'),
            type: 'number',
            numberMode: 'money'
          }
        ]
      ]
    ]
  }
  return []
}
