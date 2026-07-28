import InstructionContainers from '@/components/form/InstructionContainers.vue';
import { getList as commodityTypes } from '@/config/enums/CommodityType';
import { getList as freightTerms } from '@/config/enums/FreightTerm';
import { getList as packagesTypes } from '@/config/enums/PackageType';
import CommonService, { availableCurrencies, portFieldConfig } from '@/services/CommonService';
import { useAppStore } from '@/stores/appStore';
export const makeDefaultEntity = async () => {
  return {
    grossWeightUnit: 'KGS'
  }
}
function generalLayout (entity) {
  return [
    [
      [
        {
          name: 'portLoading',
          text: $gettext('Port of loading'),
          ...portFieldConfig(entity.transportType)
        }
      ],
      [
        {
          name: 'portDischarge',
          text: $gettext('Port of Discharge'),
          ...portFieldConfig(entity.transportType)
        }
      ]
    ],
    [
      [
        {
          name: 'placeReceipt',
          text: $gettext('Place of Receipt'),
        }
      ],
      [
        {
          name: 'placeDelivery',
          text: $gettext('Place of Delivery'),
        }
      ]
    ],
    [
      [
        {
          name: 'etd',
          text: $gettext('ETD'),
          type: 'datetimePicker',
        }
      ],
      [
        {
          name: 'vesselNo',
          text: $gettext('Vessel')
        },
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
        }
      ],
      [
        {
          name: 'billLadingType',
          text: $gettext('Bill Type'),
          type: 'select',
          items: [
            { value: 'origin', title: $gettext('Origin') },
            { value: 'surrendered', title: $gettext('Surrendered') },
          ],
          returnObject: false,
        }
      ]
    ]
  ]
}
function partiesMBLLayout (entity) {
  return [
    [
      [
        {
          name: 'shipperName',
          text: $gettext('Shipper'),
          placeholder: $gettext('Shipper Name') + ' (' + $gettext('Optional field') + ')'
        },
        {
          name: 'shipperAddress',
          type: 'textarea',
          placeholder: $gettext('Shipper Address') + ' (' + $gettext('Optional field') + ')'
        },

        {
          name: 'notifyConsignee',
          text: $gettext("Notify Party"),
          type: 'checkbox',
          label: $gettext("Same as Consignee"),
          checkBoxInline: true,
          class: 'ps-4'
        },
        {
          name: 'notifyName',
          placeholder: $gettext('Notify Party Name') + ' (' + $gettext('Optional field') + ')',
          class: 'mt-n4'
        },
        {
          name: 'notifyAddress',
          type: 'textarea',
          placeholder: $gettext('Notify Party Address') + ' (' + $gettext('Optional field') + ')'
        }
      ],
      [
        {
          name: 'consigneeName',
          text: $gettext('Consignee'),
          placeholder: $gettext('Consignee Name') + ' (' + $gettext('Optional field') + ')'
        },
        {
          name: 'consigneeAddress',
          type: 'textarea',
          placeholder: $gettext('Consignee Address') + ' (' + $gettext('Optional field') + ')'
        },
        {
          name: 'carrierName',
          text: $gettext('Carrier'),
          placeholder: $gettext('Carrier Name') + ' (' + $gettext('Optional field') + ')'
        },
        {
          name: 'carrierAddress',
          type: 'textarea',
          placeholder: $gettext('Carrier Address') + ' (' + $gettext('Optional field') + ')'
        },
      ],
    ]
  ]
}
function partiesHBLLayout (entity) {
  return [
    [
      [
        {
          name: 'shipperName',
          text: $gettext('Shipper'),
          placeholder: $gettext('Shipper Name') + ' (' + $gettext('Optional field') + ')'
        },
        {
          name: 'shipperAddress',
          type: 'textarea',
          placeholder: $gettext('Shipper Address') + ' (' + $gettext('Optional field') + ')',
          rows: 5
        },
        {
          name: 'consigneeName',
          text: $gettext('Consignee'),
          placeholder: $gettext('Consignee Name') + ' (' + $gettext('Optional field') + ')'
        },
        {
          name: 'consigneeAddress',
          type: 'textarea',
          placeholder: $gettext('Consignee Address') + ' (' + $gettext('Optional field') + ')',
          rows: 5
        },
        {
          name: 'agentName',
          text: $gettext('Document Presentation'),
          placeholder: $gettext('Document Presentation Name') + ' (' + $gettext('Optional field') + ')'
        },
        {
          name: 'agentAddress',
          type: 'textarea',
          placeholder: $gettext('Document Presentation Address') + ' (' + $gettext('Optional field') + ')',
          rows: 5
        },
        {
          name: 'notifyName',
          text: $gettext('Notify Party'),
          placeholder: $gettext('Notify Party Name') + ' (' + $gettext('Optional field') + ')',
        },
        {
          name: 'notifyAddress',
          type: 'textarea',
          placeholder: $gettext('Notify Party Address') + ' (' + $gettext('Optional field') + ')',
          rows: 5
        }
      ],
    ]
  ]
}
function detailMBLLayout (entity) {
  const defaultRates = useAppStore().exchangeRatesConfig
  const currencies = availableCurrencies(defaultRates?.exchangeRates)
  return [
    [
      [
        {
          name: 'preCarriage',
          text: $gettext('Pre-Carriage By')
        },
        {
          name: 'vesselName',
          text: $gettext('Vessel Name')
        },
        {
          name: 'blPlaceIssue',
          text: $gettext('B/L Place of issue'),
          type: 'select',
          items: [
            { value: 'origin', title: $gettext('Origin') },
            { value: 'destination', title: $gettext('Destination') },
            { value: 'other', title: $gettext('Other') },
          ]
        },
        {
          name: 'blPlaceIssueAddress',
          type: 'textarea'
        },
        {
          name: 'blOriginalNumber',
          text: $gettext('No. of Original B/L'),
          type: 'select',
          items: [
            { value: 'origin', title: $gettext('Origin') },
            { value: 'surrendered', title: $gettext('Surrendered') },
            { value: 'seaway', title: $gettext('Seaway') },
            { value: 'draft', title: $gettext('Draft') },
            { value: 'copyNonNegotiable', title: $gettext('Copy Non-negotiable') },
          ]
        },
        {
          name: 'blOriginalNumberAddress',
          type: 'textarea'
        },
        {
          name: 'freightTermsMBL',
          text: $gettext('Freight Terms MBL'),
          type: 'select',
          items: [
            { value: 'prepaid', title: $gettext('Freight Prepaid') },
            { value: 'collect', title: $gettext('Freight Collect') },
          ]
        },
        {
          text: $gettext('Clause'),
          name: 'clause',
          type: 'textarea'
        },
        {
          text: $gettext('Shipping Marks'),
          name: 'shippingMarks',
          type: 'textarea'
        },
      ],
      [
        {
          name: 'feederVoyageNumber',
          text: $gettext('Feeder Voyage No.')
        },
        {
          name: 'voyageNumber',
          text: $gettext('Voyage No.')
        },
        {
          name: 'mblType',
          text: $gettext('MBL Type'),
          type: 'select',
          items: [
            { value: 'origin', title: $gettext('Origin') },
            { value: 'surrendered', title: $gettext('Surrendered') },
            { value: 'seaway', title: $gettext('Seaway') },
          ]
        },
        {
          name: 'blIssueDate',
          text: $gettext('Date of issues B/L (s)'),
          type: 'datePicker'
        },
        {
          name: 'onboardDate',
          text: $gettext('Shipped on Board Date'),
          type: 'datePicker'
        },
        {
          text: $gettext('Description of Goods'),
          name: 'descriptionGoods',
          type: 'textarea'
        },
        {
          text: $gettext('Additional Information'),
          name: 'additionalInformation',
          type: 'textarea'
        },
        {
          text: $gettext('Signature By'),
          name: 'signatureBy',
          type: 'textarea'
        },
      ]
    ]
  ]
}
function detailHBLLayout (entity) {
  return [
    [
      [
        {
          name: 'packageType',
          text: 'TYPE OF PACKAGES',
          type: 'select',
          items: packagesTypes,
          returnObject: false
        },
        {
          name: 'shippingMarks',
          text: $gettext('Shipping Marks'),
          type: 'textarea',
          rows: 10
        },
        {
          name: 'natureQuantityGoods',
          text: $gettext('Description of Packages and Goods'),
          type: 'textarea',
          rows: 9
        },
      ],
    ]
  ]
}
export const mblLayout = (entity) => {
  return [
    [
      [
        {
          columnName: $gettext('General Information'),
          isTopLegend: true
        },
        {
          name: 'generalSubForm',
          type: 'subForm',
          layout: generalLayout,
          makeDefaultEntity: () =>{}
        },
        {
          columnName: $gettext('SI Parties'),
          isTopLegend: true
        },
        {
          name: 'partiesMBLSubForm',
          type: 'subForm',
          layout: partiesMBLLayout,
          makeDefaultEntity: () =>{}
        },
      ],
      [
        {
          columnName: $gettext('Details')
        },
        {
          name: 'detailMBLSubForm',
          type: 'subForm',
          layout: detailMBLLayout,
          makeDefaultEntity: () =>{}
        },
      ]
    ],
  ]
}
export const hblLayout = (entity) => {
  return [
    [
      [
        {
          columnName: $gettext('General Information'),
          isTopLegend: true
        },
        {
          name: 'generalSubForm',
          type: 'subForm',
          layout: generalLayout,
          makeDefaultEntity: () =>{}
        },
        {
          columnName: $gettext('Details'),
          isTopLegend: true
        },
        {
          name: 'detailHBLSubForm',
          type: 'subForm',
          layout: detailHBLLayout,
          makeDefaultEntity: () =>{}
        },
      ],
      [
        {
          columnName: $gettext('Parties'),
          isTopLegend: true
        },
        {
          name: 'partiesHBLSubForm',
          type: 'subForm',
          layout: partiesHBLLayout,
          makeDefaultEntity: () =>{}
        },
      ]
    ],
  ]
}
export const tabLayout = (entity) => {
  return [
    [
      [
        [
          {
            name: 'hblLayout',
            type: 'subForm',
            layout: hblLayout,
            makeDefaultEntity: () =>{},
          }
        ]
      ]
    ]
  ]
}
export const layout = (entity) => {
  const { required } = CommonService.rules()
  const appStore = useAppStore()

  return [
    [
      [
        {
          name: 'tabLayout',
          type: 'subForm',
          layout: tabLayout,
          makeDefaultEntity: () =>{},
          tabLayout: [
            { name: $gettext('HBL Processing') },
          ]
        },
      ],
    ],
    [
      [
        {
          columnName: $gettext('Actual Containers')
        },
        {
          name: 'containers',
          type: 'custom',
          component: InstructionContainers
        },
      ]
    ],
  ]
}
