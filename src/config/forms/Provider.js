import { layout as layoutBankAccount, makeDefaultEntity as makeDefaultBankAccount } from '@/config/forms/BankAccount';
import { layout as layoutContact, makeDefaultEntity as makeDefaultContact } from '@/config/forms/Contact';
import { layout as layoutInvoiceInfo, makeDefaultEntity as makeDefaultInvoiceInfo } from '@/config/forms/InvoiceInfo';
import { getList as transportTypes } from '@/config/enums/TransportType';
import CommonService from '@/services/CommonService';
import { useGettext } from "vue3-gettext";
export const makeDefaultEntity = async () => {
  return {
    name: null
  }
}
export const layout = (entity) => {
  const { required } = CommonService.rules()
  const { $gettext } = useGettext();
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
          text: $gettext('Provider Id'),
          rules: [required],
          columnSpan: 3
        }
      ]
    ],
    [
      [
        {
          name: 'transportTypes',
          text: $gettext('Transport Modes'),
          type: 'select',
          multiple: true,
          items: transportTypes,
          returnObject: false,
          clearable: true,
          columnSpan: 12
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
          name: 'description',
          text: $gettext('Description'),
          type: 'textarea',
          columnSpan: 9
        },
        {
          name: 'taxNumber',
          text: $gettext('Tax Number'),
        },
        {
          name: 'trackingUrl',
          text: $gettext('Tracking URL'),
        }
      ],
      [
        {
          name: 'logo',
          text: $gettext('Logo'),
          type: 'imageUpload',
          columnSpan: 3
        },
      ]
    ],
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
  ]
}
