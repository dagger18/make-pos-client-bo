import InstructionDimension from '@/components/form/CargoVolume/InstructionDimension.vue';
import InstructionCharges from '@/components/form/InstructionCharges.vue';
import { getList as commodityTypes } from '@/config/enums/CommodityType';
import { getList as packagesTypes } from '@/config/enums/PackageType';
import CommonService, { availableCurrencies } from '@/services/CommonService';
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
          name: 'placeReceipt',
          text: $gettext('Place of Receipt'),
          disabled: true
        }
      ],
      [
        {
          name: 'portLoading',
          text: $gettext('Air-port of loading'),
          disabled: true,
          type: 'select',
          itemTitle(item) {
            return item.name + ', ' + item.subdiv + ' (' + item.code + ')'
          }
        }
      ]
    ],
    [
      [
        {
          name: 'portDischarge',
          text: $gettext('Air-port of Discharge'),
          disabled: true,
          type: 'select',
          itemTitle(item) {
            return item.name + ', ' + item.subdiv + ' (' + item.code + ')'
          }
        }
      ],
      [
        {
          name: 'placeDelivery',
          text: $gettext('Place of Delivery'),
          disabled: true
        }
      ]
    ],
    [
      [
        {
          name: 'destination',
          text: $gettext('Final Destination'),
          disabled: true
        }
      ],
      [
        {
          name: 'pickup',
          text: $gettext('Pick up'),
          disabled: true
        }
      ]
    ],
    [
      [
        {
          name: 'warehouse',
          text: $gettext('Drop off / Warehouse'),
          columnSpan: 6,
          disabled: true
        }
      ]
    ],
    [
      [
        {
          name: 'etd',
          text: $gettext('ETD'),
          type: 'datetimePicker',
          disabled: true
        }
      ],
      [
        {
          name: 'eta',
          text: $gettext('ETA'),
          type: 'datetimePicker',
          disabled: true
        }
      ]
    ],
    [
      [
        {
          name: 'atd',
          text: $gettext('ATD'),
          type: 'datetimePicker'
        }
      ],
      [
        {
          name: 'ata',
          text: $gettext('ATA'),
          type: 'datetimePicker'
        }
      ]
    ]
  ]
}
function partiesLayout (entity) {
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
          name: 'shipperAccountNumber',
          text: $gettext("Shipper's Account Number"),
        },
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
          name: 'consigneeAccountNumber',
          text: $gettext("Consignee's Account Number")
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
          name: 'agentName',
          text: $gettext('Agent / Handling Information'),
          placeholder: $gettext('Agent Name') + ' (' + $gettext('Optional field') + ')'
        },
        {
          name: 'agentAddress',
          type: 'textarea',
          placeholder: $gettext('Agent Address') + ' (' + $gettext('Optional field') + ')'
        },
        {
          name: 'agentCity',
          text: $gettext("Issuing Carrier's Agent Name and City"),
          type: 'textarea',
        },
        {
          name: 'agentIataCode',
          text: $gettext("Agent's IATA Code")
        },
        {
          name: 'accountNumber',
          text: $gettext("Account No.")
        },
        {
          name: 'referenceNumber',
          text: $gettext("Reference Number")
        }
      ],
    ]
  ]
}
function detailLayout (entity) {
  const defaultRates = useAppStore().exchangeRatesConfig
  const currencies = availableCurrencies(defaultRates?.exchangeRates)
  return [
    [
      [
        {
          name: 'toCarrier1',
          text: $gettext('To First Carrier')
        },
        {
          name: 'toCarrier2',
          text: $gettext('To 2')
        },
        {
          name: 'toCarrier3',
          text: $gettext('To 3')
        },
        {
          name: 'flight1',
          text: $gettext('Flight No. 1')
        },
        {
          name: 'flight1Date',
          text: $gettext('Flight No. 1 Date'),
          type: 'datePicker'
        },
        {
          name: 'freightTerms',
          text: $gettext('Accounting Information'),
          type: 'select',
          disabled: true
        },
        {
          name: 'freightTermsNote',
          type: 'textarea',
          disabled: true
        },
        {
          name: 'declaredValueCarriage',
          text: $gettext('Declared Value for Carriage')
        },
        {
          name: 'amountInsurance',
          text: $gettext('Amount of Insurance')
        },
        {
          name: 'billLadingIssueDate',
          text: $gettext('Date of issues B/L(s)'),
          type: 'datePicker'
        },
        {
          name: 'billLadingIssuePlace',
          text: $gettext('B/L Place of issue')
        },
        {
          name: 'shipperSignature',
          text: $gettext('Signature of Shipper or his Agent')
        },
        {
          name: 'shippingMarks',
          text: $gettext('Shipping Marks'),
          type: 'textarea'
        },
        {
          name: 'additionalInfo',
          text: $gettext('Additional Information'),
          type: 'textarea'
        }
      ],
      [
        {
          name: 'byCarrier1',
          text: $gettext('By First Carrier')
        },
        {
          name: 'byCarrier2',
          text: $gettext('By 2')
        },
        {
          name: 'byCarrier3',
          text: $gettext('By 3')
        },
        {
          name: 'flight2',
          text: $gettext('Flight No. 2')
        },
        {
          name: 'optionalInfo',
          text: $gettext('Optional Shipping Information')
        },
        {
          name: 'currency',
          text: $gettext('Currency'),
          type: 'select',
          items: currencies
        },
        {
          name: 'declaredValueCustom',
          text: $gettext('Declared Value for Custom')
        },
        {
          name: 'sci',
          text: $gettext('SCI')
        },
        {
          name: 'natureQuantityGoods',
          text: $gettext('Nature and Quantity of Goods'),
          type: 'textarea'
        },
        {
          name: 'carrierSignature',
          text: $gettext('Signature of Issuing Carrier or its Agent')
        },
        {
          name: 'commodity',
          text: $gettext('Commodity'),
          type: 'select',
          items: commodityTypes
        }
      ]
    ]
  ]
}
function rateLayout (entity) {
  return [
    [
      [
        {
          name: 'grossWeight',
          text: $gettext('G. Weight'),
          groupedInputs: true,
        },
        {
          name: 'grossWeightUnit',
          text: 'empty',
          type: 'select',
          items: ['KGS', 'LBS'],
          groupedWidth: '80px'
        },
      ],
      [
        {
          name: 'volume',
          text: $gettext('Volume'),
          appendInner: 'CBM'
        },
      ],
    ],
    [
      [
        {
          name: 'chargeableWeight',
          text: $gettext('Chargeable Weight'),
          appendInner: 'KGS'
        }
      ],
      [
        {
          name: 'rateCharge',
          text: $gettext('Rate / Charge'),
          groupedInputs: true
        },
        {
          name: 'rateChargeAsAgreed',
          text: 'empty',
          type: 'checkbox',
          label: $gettext('As Agreed'),
          groupedWidth: '140px',
          class: 'ps-2'
        },
      ],
    ],
    [
      [
        {
          name: 'packageCount',
          text: $gettext('No of Pieces'),
          groupedInputs: true,
        },
        {
          name: 'packageType',
          text: 'empty',
          type: 'select',
          items: packagesTypes,
          groupedWidth: '140px'
        },
      ],
      [
        {
          name: 'total',
          text: $gettext('Total'),
          disabled: true
        },
      ],
    ],
    [
      [
        {
          name: 'rateClass',
          text: $gettext('Rate Class'),
          type: 'select',
          items: ['C', 'M', 'N', 'Q'],
        }
      ],
      [
        {
          name: 'commodityItemNumber',
          text: $gettext('Commodity Item No.')
        },
      ],
    ]
  ]
}
function costLayout (entity) {
  return [
    [
      [
        
        {
          columnName: $gettext('Costs')
        },
        {
          name: 'costTerm',
          type: 'radioGroup',
          items: [
            { 'value': 'P', 'title': $gettext('Prepaid') },
            { 'value': 'C', 'title': $gettext('Collect') },
          ],
          inline: true
        },
        {
          name: 'costAsAgreed',
          type: 'checkbox',
          label: $gettext('As Agreed')
        },
        {
          name: 'weightCharge',
          text: $gettext('Weight Charge')
        },
        {
          name: 'valuationCharge',
          text: $gettext('Valuation Charge')
        },
        {
          name: 'tax',
          text: $gettext('Tax')
        },
        {
          name: 'dueAgent',
          text: $gettext('Total Other Charge Due Agent')
        },
        {
          name: 'dueCarrier',
          text: $gettext('Total Other Charge Due Carrier')
        },
        {
          name: 'costTotals',
          text: $gettext('Totals')
        },
      ],
      [
        {
          columnName: $gettext('Charges & Conversion Rate')
        },
        {
          name: 'otherCharges',
          text: $gettext('Other Charges')
        },
        {
          name: 'currencyRate',
          text: $gettext('Currency Conversion Rates')
        },
        {
          name: 'ccChargesInDestCurrency',
          text: $gettext('CC Charges in Dest. Currency')
        },
        {
          name: 'chargesAtDestination',
          text: $gettext('Charges at Destination')
        },
        {
          name: 'totalCollectCharges',
          text: $gettext('Total Collect Charges')
        },
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
          columnName: $gettext('General Information'),
          isTopLegend: true
        },
        {
          name: 'generalSubForm',
          type: 'subForm',
          layout: generalLayout,
          makeDefaultEntity: () =>{}
        },
      ],
      [
        {
          columnName: $gettext('Parties'),
          isTopLegend: true
        },
        {
          name: 'partiesSubForm',
          type: 'subForm',
          layout: partiesLayout,
          makeDefaultEntity: () =>{}
        },
      ]
    ],
    [
      [
        {
          columnName: $gettext('Details')
        },
        {
          name: 'detailSubForm',
          type: 'subForm',
          layout: detailLayout,
          makeDefaultEntity: () =>{}
        },
      ],
      [
        {
          columnName: $gettext('Rate Description')
        },
        {
          name: 'rateSubForm',
          type: 'subForm',
          layout: rateLayout,
          makeDefaultEntity: () => {return {
            grossWeightUnit: 'KGS'
          }}
        },
        {
          columnName: $gettext('Dimension')
        },
        {
          name: 'dimension',
          type: 'custom',
          component: InstructionDimension
        },
        {
          name: 'costSubForm',
          type: 'subForm',
          layout: costLayout,
          makeDefaultEntity: () => {}
        },
        {
          columnName: $gettext('Charges')
        },
        {
          name: 'instructionCharges',
          type: 'custom',
          component: InstructionCharges
        },
      ]
    ]
  ]
}
