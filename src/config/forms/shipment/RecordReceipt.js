
import ClientService from '@/services/ClientService';
import CommonService from '@/services/CommonService';
// InvoiceInfoService removed - freight-specific service
const InvoiceInfoService = null;
// ProviderService removed - freight-specific service
const ProviderService = null;
import { useAppStore } from '@/stores/appStore';
export const makeDefaultEntity = () => {
  return {
  }
}
export const layout = (entity, context) => {
  const { required } = CommonService.rules()
  const appStore = useAppStore()
  const clients = [context.quote.client]
  const providers = context.quote.prices
                    .map(p => p.provider)
                    .reduce((result, provider) => {
                      const ids = result.map(r => r.id)
                      if(provider && !ids.includes(provider.id)) {
                        result.push(provider)
                      }
                      return result
                    }, [])
  return [  
    [
      [
        {
          name: 'targetType',
          text: $gettext('Recipient from'),
          rules: [required],
          type: 'select',
          items: [
            {'value' : 'client', 'title': $gettext('Client')},
            {'value' : 'provider', 'title': $gettext('Provider')}
          ],
          returnObject: false,
          columnSpan: 3
        }
      ],
      [ 
        {
          name: 'collectFrom',
          text: $gettext('Select Client'),
          rules: [required],
          type: 'select-search',
          apiEndpoint: ClientService,
          columnSpan: 3,
          show: entity.targetType === 'client',
          coreItems: clients,
          coreItemsGroup: $gettext('From pricing'),
          dynamicItemsGroup: $gettext('From custom'),
        },
        {
          name: 'collectFrom',
          text: $gettext('Select Provider'),
          rules: [required],
          type: 'select-search',
          apiEndpoint: ProviderService,
          columnSpan: 3,
          show: entity.targetType === 'provider',
          rowClass: {'mt-n4': true},
          coreItems: providers,
          coreItemsGroup: $gettext('From pricing'),
          dynamicItemsGroup: $gettext('From custom'),
        }
      ], 
      [
        {
          name: 'invoiceInfo',
          text: $gettext('Select invoicing information'),
          type: 'select-search',
          apiEndpoint: InvoiceInfoService,
          searchOnProperties: ['company', 'email', 'contactName'],
          callParams: {'isOneOf_Client_invoiceInfos': entity.collectFrom?.id },
          itemValue: 'id',
          itemTitle(item) {
            return item.company
          },
          columnSpan: 3,
          show: entity.targetType === 'client'
        },
        {
          name: 'invoiceInfo',
          text: $gettext('Select invoicing information'),
          type: 'select-search',
          apiEndpoint: InvoiceInfoService,
          searchOnProperties: ['company', 'email', 'contactName'],
          callParams: {'isOneOf_Provider_invoiceInfos': entity.collectFrom?.id },
          itemValue: 'id',
          itemTitle(item) {
            return item.company
          },
          columnSpan: 3,
          show: entity.targetType === 'provider',
          rowClass: {'mt-n4': true}
        }
      ]
    ],
    [
      [
        {
          name: 'amount',
          text: $gettext('Amount'),
          rules: [required],
          type: 'number',
          numberMode: 'money'
        }
      ],
      [
        {
          name: 'paymentMethod',
          text: $gettext('Payment Method'),
          type: 'select',
          items: appStore.getList('paymentMethods'),
          itemValue: 'id',
          itemTitle: 'name',
        }
      ],
      [
        {
          name: 'noteDate',
          text: $gettext('Receipt Date'),
          rules: [required],
          type: 'datePicker',
        }
      ],
      [
        {
          name: 'pic',
          text: $gettext('PIC'),
        }
      ],
    ],
    
    [
      [
        {
          name: 'amountInWords',
          text: $gettext('In Words'),
          type: 'textarea',
          columnSpan: 3
        }
      ],
      [
        {
          name: 'description',
          text: $gettext('Description'),
          type: 'textarea'
        }
      ],
      [
        {
          name: 'note',
          text: $gettext('Note'),
          type: 'textarea'
        }
      ]
    ],
    [
      [
        {
          name: 'documents',
          text: $gettext('Attached Files'),
          type: 'uploader',
          uploadInstantly: false
        }
      ]
    ]
  ]
}
