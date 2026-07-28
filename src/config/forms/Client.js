import { getList as clientTypeList } from '@/config/enums/ClientType';
import { enums as CUSTOM_MODE, getList as customInfoModeList } from '@/config/enums/CustomInfoMode';
import { getList as residenceTypeList } from '@/config/enums/ResidenceType';
import { layout as layoutBankAccount, makeDefaultEntity as makeDefaultBankAccount } from '@/config/forms/BankAccount';
import { layout as layoutContact, makeDefaultEntity as makeDefaultContact } from '@/config/forms/Contact';
import { layout as layoutInvoiceInfo, makeDefaultEntity as makeDefaultInvoiceInfo } from '@/config/forms/InvoiceInfo';
import CommonService from '@/services/CommonService';
import { useAppStore } from "@/stores/appStore";
import { useGettext } from "vue3-gettext";
export const makeDefaultEntity = async () => {
  return {
    name: null,
    customInfoMode: 'G'
  }
}
export const layout = (entity) => {
  const { required } = CommonService.rules()
  const { $gettext } = useGettext();
  const appStore = useAppStore()
  return [
    [
      [
        {
          columnName: $gettext('General'),
          isTopLegend: true
        }
      ]
    ],  
    [
      [
        {
          name: 'name',
          text: $gettext('Company Name'),
          rules: [required],
          columnSpan: 9
        }
      ],
      [
        {
          name: 'code',
          text: $gettext('Client Id'),
          rules: [required],
          columnSpan: 3
        }
      ]
    ],  
    [
      [
        {
          name: 'address',
          text: $gettext('Address'),
          columnSpan: 9
        }
      ],
      [
        {
          name: 'phone',
          text: $gettext('Phone'),
          columnSpan: 3
        }
      ]
    ],  
    [
      [
        {
          name: 'province',
          text: $gettext('State/Province'),
        }
      ],
      [
        {
          name: 'city',
          text: $gettext('City'),
        }
      ],
      [
        {
          name: 'zipCode',
          text: $gettext('Zip Code'),
        }
      ],
      [
        {
          name: 'country',
          text: $gettext('Country'),
        }
      ]
    ],
    [
      [
        {
          name: 'note',
          text: $gettext('Note'),
          type: 'textarea',
          rows: 5,
          columnSpan: 6
        }
      ],
      [
        {
          name: 'type',
          text: $gettext('Client Type'),
          type: 'select',
          rules: [required],
          items: clientTypeList,
          columnSpan: 3,
          returnObject: false
        },
        {
          name: 'priceMarkup',
          text: $gettext('Pricing Level'),
          type: 'select',
          rules: [required],
          items: appStore.getList('priceMarkups'),
          itemValue: 'id',
          itemTitle: 'name',
        },
      ],
      [
        {
          name: 'residenceType',
          text: $gettext('Residence Type'),
          type: 'select',
          items: residenceTypeList,
          columnSpan: 3
        },
        {
          name: 'establishmentDate',
          text: $gettext('Establishment Date'),
          type: 'datePicker',
          placeholder: $gettext('Select date') + '...',
          config: { dateFormat: 'DD/MM/YYYY', altInput: true, altFormat: 'DD/MM/YYYY'}
        }
      ]
    ],
    [
      [
        {
          columnName: $gettext('Invoicing Information')
        }
      ]
    ], 
    [
      [
        {
          name: 'invoiceInfos[0]',
          type: 'subForm',
          layout: layoutInvoiceInfo,
          makeDefaultEntity: makeDefaultInvoiceInfo
        }
      ]
    ],
    [
      [
        {
          columnName: $gettext('Bank Account')
        }
      ]
    ], 
    [
      [
        {
          name: 'bankAccounts[0]',
          type: 'subForm',
          layout: layoutBankAccount,
          makeDefaultEntity: makeDefaultBankAccount
        }
      ]
    ],
    [
      [
        {
          columnName: $gettext('Custom Information')
        }
      ]
    ], 
    [
      [
        {
          name: 'customInfoMode',
          type: 'btnSelectGroup',
          items: customInfoModeList
        }
      ],
    ],
    entity.customInfoMode === CUSTOM_MODE.CustomInfo ? [
      [
        {
          name: 'customInfo',
          type: 'subForm',
          layout: layoutInvoiceInfo,
          makeDefaultEntity: makeDefaultInvoiceInfo
        }
      ]
    ]: [],
    [
      [
        {
          columnName: $gettext('Contact Person')
        }
      ]
    ], 
    [
      [
        {
          name: 'contacts[0]',
          type: 'subForm',
          layout: layoutContact,
          makeDefaultEntity: makeDefaultContact
        }
      ]
    ], 
    [
      [
        {
          columnName: $gettext('Credit Terms')
        }
      ]
    ], 
    [
      [
        {
          name: 'creditLimit',
          text: $gettext('Credit Limit'),
          type: 'number',
          numberMode: 'money'
        }
      ],
      [
        {
          name: 'creditPeriod',
          text: $gettext('Credit Period'),
          suffix: $gettext('days')
        }
      ]
    ],
    
  ]
}
