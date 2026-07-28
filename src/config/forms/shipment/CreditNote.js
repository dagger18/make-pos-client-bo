import ChargeItems from '@/components/form/ChargeItems.vue';
import EditExchangeRates from '@/components/form/EditExchangeRates.vue';
import { DefaultDueDate, DefaultMoneyScale } from '@/config/enums/AppEnums';
import { enums as EbitNote } from '@/config/enums/EbitNoteType';
import { dateAdapter } from "@/plugins/vuetify";
import ClientService from '@/services/ClientService';
import CommonService, { availableCurrencies, dayJSToUTC, exchangeRatesToMap, priceToChargeItem } from '@/services/CommonService';
// InvoiceInfoService removed - freight-specific service
const InvoiceInfoService = null;
// ProviderService removed - freight-specific service
const ProviderService = null;
import { useAppStore } from '@/stores/appStore';
export const makeDefaultEntity = (context) => {
  const providerCreatedIdList = context.ebitNotes
    .filter(e => e.type === EbitNote.Credit)
    .map(e => e.payTo.id)
  const payToCandidate = context.quote.prices
    .map(p => p.provider)
    .reduce((result, provider) => {
      const ids = result.map(r => r.id)
      if(!provider) {
        if(!ids.includes('isEmpty')) {
          result.push({id: 'isEmpty', name: $gettext('Undefined Provider')})
        }
        return result
      }
      if(!ids.includes(provider.id)) {
        result.push(provider)
      }
      return result
    }, [])
    .find(provider => !providerCreatedIdList.includes(provider.id))
  console.log(payToCandidate, 'payToCandidate')
  const defaultRates = useAppStore().exchangeRatesConfig
  const daysToDueDate = (payToCandidate && payToCandidate.creditPeriod) ?  payToCandidate.creditPeriod : DefaultDueDate
  const noteDate = dateAdapter.date() 
  const dueDate = noteDate.add(daysToDueDate, 'day')
  const exchangeRates = { 
    ...exchangeRatesToMap(defaultRates.exchangeRates), 
    ...context.quote.exchangeRates
  }
  console.log('i got rate here', defaultRates)

  const defaultCurrency = {
    currency: defaultRates.currency.code,
    rate: exchangeRates[defaultRates.currency.code]
  }

  const alreadyCharges = context.ebitNotes
    .filter(e => e.type === EbitNote.Credit)
    .reduce((result, ebitNote) => {
      const ids = ebitNote.chargeItems
      .filter(e => e.quotePrice)
      .map(e => { return e.quotePrice.id})
      return [...result,...ids]
    }, [])
    
  const chargeItems = context.quote.prices.reduce((result, rawPrice) => {
    if(alreadyCharges.includes(rawPrice.id)) return result
    if(payToCandidate && 
      ((!rawPrice.provider && payToCandidate.id !== 'isEmpty')
        || (rawPrice.provider && rawPrice.provider.id !== payToCandidate.id)
      )
    ) return result
    const price = JSON.parse(JSON.stringify(rawPrice))
    const chargeItem = priceToChargeItem(price, EbitNote.Credit, defaultCurrency)
    console.log(chargeItem, 'chargeItem')
    result.push(chargeItem)
    return result
  }, [])
  // debit note send to client, should use exchange rate of quote :))
  return {
    payTo: payToCandidate,
    invoiceInfo: payToCandidate?.defaultInvoiceInfo,
    targetType: 'provider',
    currency: defaultCurrency.currency,
    noteDate: dayJSToUTC(noteDate),
    dueDate: dayJSToUTC(dueDate),
    type: EbitNote.Credit,
    chargeItems,
    exchangeRates,
    moneyScale: DefaultMoneyScale,
    shipment: context.id
  }
}
export const layout = (entity, context) => {
  const { required } = CommonService.rules()
  const appStore = useAppStore()
  const defaultRates = appStore.exchangeRatesConfig
  
  const currencies = availableCurrencies(defaultRates.exchangeRates)
  const clients = [context.quote.client]
  const providers = context.quote.prices
                    .map(p => p.provider)
                    .reduce((result, provider) => {
                      const ids = result.map(r => r.id)
                      if(!provider) {
                        if(!ids.includes('isEmpty')) {
                          result.push({id: 'isEmpty', name: $gettext('Undefined Provider')})
                        }
                        return result
                      }
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
          name: 'payTo',
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
          name: 'payTo',
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
          callParams: {'isOneOf_Client_invoiceInfos': entity.payTo?.id ?? null },
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
          callParams: {'isOneOf_Provider_invoiceInfos': entity.payTo?.id ?? null },
          itemValue: 'id',
          itemTitle(item) {
            return item.company
          },
          columnSpan: 3,
          show: entity.targetType === 'provider',
          rowClass: {'mt-n4': true}
        }
      ],
      [
        {
          name: 'codeReference',
          text: $gettext('Received Invoices#'),
        }
      ]
    ],
    [
      [
        {
          name: 'noteDate',
          text: $gettext('Created Date'),
          rules: [required],
          type: 'datePicker',
        }
      ],
      [
        {
          name: 'dueDate',
          text: $gettext('Due Date'),
          rules: [required],
          type: 'datePicker',
        }
      ],
      [
        {
          name: 'currency',
          text: $gettext('Currency'),
          rules: [required],
          type: 'select',
          items: currencies
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
      ]
    ],
    [
      [
        {
          name: 'chargeItems',
          type: 'custom',
          component: ChargeItems,
          context: {
            ...context, 
            exchangeRates: entity.exchangeRates,
            currency: entity.currency,
            amount: entity.amount,
            amountNoTax: entity.amountNoTax,
            tax: entity.tax,
            ebitNoteType: entity.type,
            moneyScale: entity.moneyScale
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
          columnSpan: 6,
          toCurrency: appStore.exchangeRatesConfig?.currency?.code
        }
      ],
      [
        {
          name: 'moneyScale',
          text: $gettext('Number decimals'),
          type: 'select',
          items: [0,1,2,3,4],
          returnObject: false,
          columnSpan: 3,
        }
      ],
      [
        {
          name: 'showOneCurrency',
          text: $gettext('Show One Currency'),
          type: 'switch',
          columnSpan: 3,
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
    ],
    [
      [
        {
          name: 'note',
          text: $gettext('Note'),
          type: 'textarea'
        }
      ]
    ]
  ]
}
