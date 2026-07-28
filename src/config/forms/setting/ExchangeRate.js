import { useAppStore } from '@/stores/appStore';
export const makeDefaultEntity = async (context, fromCurrencyCode = null) => {
  const appStore = useAppStore()
  const currencies = await appStore.fetchList('currencies')
  console.log('currencies', currencies)
  const defaultCurrencyId = typeof context.defaultCurrency === 'object'
    ? context.defaultCurrency?.id
    : context.defaultCurrency
  const toCurrency = typeof context.defaultCurrency === 'object'
    ? context.defaultCurrency
    : currencies.find(c => c.id === defaultCurrencyId)
  const result = {
    fromCurrency: null,
    toCurrency,
    fromRate: null,
    toRate: null,
    rate: null
  }
  if(fromCurrencyCode) {
    result.fromCurrency = currencies.find(c => c.code === fromCurrencyCode)
  }
  return result
}
export const layout = (entity, context) => {
  const appStore = useAppStore()
  const currencies = appStore.getList('currencies')
  const existCurrencies = []
  context.exchangeRates.forEach(({fromCurrency, toCurrency}) => {
    if(fromCurrency) existCurrencies.push(fromCurrency.code)
    if(toCurrency) existCurrencies.push(toCurrency.code)
  })
  const availableCurrencies = currencies.filter(c => !existCurrencies.includes(c.code))
  return [  
    [
      [
        {
          name: 'fromCurrency',
          type: 'currency-search',
          itemTitle(item) {
            return '1 ' + item.code + ' (' + item.name + ')'
          },
          itemValue: 'id',
          groupedInputs: true,
          placeholder: $gettext('From'),
          groupedWidth: '110px',
          itemSlot(item) {
            return item.name + ' - ' + item.code + ' (' + item.symbol + ')'
          },
          disabled: entity.fromCurrency && entity.fromCurrency.code === 'USD'
        },
        {
          name: 'rate',
          type: 'number',
          prependInner: '=',
          placeholder: $gettext('Enter exchange rate'),
        },
        {
          type: 'text',
          renderText: entity.toCurrency?.code,
          groupedWidth: '70px',
          bodyClass: 'ps-2'
        }
      ]
    ]
  ]
}
