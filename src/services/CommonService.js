import { getSymbol } from "@/config/enums/Currency";
import { enums as EbitNote } from "@/config/enums/EbitNoteType";
import { toPortType } from "@/config/enums/TransportType";
import { dateAdapter } from "@/plugins/vuetify";
import PortService from "@/services/library/PortService";
import { useAppStore } from "@/stores/appStore";
import { v4 as uuidv4 } from 'uuid';
Number.prototype.round = function(n) {
  const d = Math.pow(10, n);
  return Math.round((this + Number.EPSILON) * d) / d;
}
String.prototype.round = function(n) {
  const d = Math.pow(10, n);
  return Math.round((1*this + Number.EPSILON) * d) / d;
}
Number.prototype.toMoneyFormat = function(currency = 'USD', withSymbol = true) {
  if(!currency) return this
  const appStore = useAppStore()
  const fmt = appStore.getCurrencyFormat(currency)

  if (!fmt || fmt === 'loading') {
    appStore.fetchCurrencyFormat(currency)
  }

  const maxFD = (fmt && fmt !== 'loading' && fmt.decimalPlaces != null)
      ? fmt.decimalPlaces
      : 0
  let minimumDigits = numZeroesAfterPoint(this)
  if(isNaN(minimumDigits)) minimumDigits = 0
  if(minimumDigits > 0) minimumDigits += 2
  const final = maxFD === 0 ? 0 : Math.max(maxFD, minimumDigits)

  const thousandSep = (fmt && fmt !== 'loading' && fmt.thousandSeparator != null) ? fmt.thousandSeparator : ','
  const decimalSep  = (fmt && fmt !== 'loading' && fmt.decimalSeparator  != null) ? fmt.decimalSeparator  : '.'

  const num = Math.abs(Number(this))
  const sign = this < 0 ? '-' : ''
  const fixed = num.toFixed(final)
  const [intPart, decPart] = fixed.split('.')
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep)
  const numStr = sign + formattedInt + (decPart !== undefined ? decimalSep + decPart : '')

  if(!withSymbol) return numStr

  const currencies = appStore.getList('currencies')
  const curr = currency === 'USD' ? {symbol:'$'} : currencies.find(c => c.code === currency)
  return (curr?.symbol ?? currency) + numStr
}
String.prototype.toMoneyFormat = function(currency = 'USD', withSymbol = true) {
  return (1 * this).toMoneyFormat(currency, withSymbol)
}
export const isCurrencyZeroDecimal = (currency) => {
  const appStore = useAppStore()
  const fmt = appStore.getCurrencyFormat(currency)
  if (!fmt || fmt === 'loading') {
    appStore.fetchCurrencyFormat(currency)
    return false
  }
  return fmt.decimalPlaces === 0
}
export const numZeroesAfterPoint = (x) => {
  if (x % 1 == 0) {
    return 0;
  } else {
    return Math.min(-1 - Math.floor(Math.log10(x % 1)), 5);
  }
}
export const portFieldConfig = (transportType = null) => {
  const object = {
    type: 'port-search',
    searchCriterias: [
      {
        property: 'name,code,codeFull',
        operator: 'like',
        condition(search) { return search && search.length > 3}
      },
      {
        property: 'code',
        operator: 'like',
        condition(search) { return search && search.length <= 3}
      },
    ],
    itemTitle(item) {
      return item.name + ', ' + item.subdiv + ' (' + item.code + ')'
    }
  }
  if(transportType) {
    object.callParams = {
      'filter_portTypes_like': toPortType(transportType)
    }
  }
  return object
}
export const printPort = (port) => {
  if(!port) return '...'
  return [port.name,port.subdiv + ' (' + port.code + ')'].join(', ')
}
export const getSubTotal= (items) => {
  const currencies = {}
  items.forEach(item => {
    if(item.selling && item.quantity) {
      if(!currencies[item.selling.currency]) {
        currencies[item.selling.currency] = {
          selling: 0,
          buying: 0
        }
      }
      currencies[item.selling.currency].selling += item.selling.amount * item.quantity
    }
    if(item.buying) {
      if(!currencies[item.buying.currency]) {
        currencies[item.buying.currency] = {
          selling: 0,
          buying: 0
        }
      }
      currencies[item.buying.currency].buying += item.buying.amount * item.quantity
    }
  })
  Object.keys(currencies).forEach(key => {
    if(!currencies[key].buying && !currencies[key].selling)
    delete currencies[key]
  })
  return currencies
}
export const djb2Hash = (str) => {
      let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return hash >>> 0;
}
export const useFloat = (amount) => {
  return !amount ? 0 : (isNaN(amount) ? 0 : parseFloat(amount))
}
export const multiFloat = (...args) => {
  return args.reduce(
    (result, num) => result * useFloat(num),
    1,
  )
}
// this one convert 1 fromCurrency to X toCurrency
export const convertMoney = (from, toRate) => {
  return from.amount  ? (( from.amount / from.rate ) * toRate) : 0
}
//
export const exchangeRatesToMap = (exchangeRates) => {
  return availableCurrencies(exchangeRates).reduce((result, currency) => {
    result[currency] = getCurrencyRate(exchangeRates, currency)
    return result
  }, {})
}
export const availableCurrencies = (exchangeRates, returnCode = true) => {
  return exchangeRates?.reduce((result, rate) => {
    if(returnCode) {
      if(!result.includes(rate.fromCurrency.code)) {
        result.push(rate.fromCurrency.code)
      }
      if(!result.includes(rate.toCurrency.code)) {
        result.push(rate.toCurrency.code)
      }
    } else {
      if(!result.find(r => r.code === rate.fromCurrency.code)) {
        result.push(rate.fromCurrency)
      }
      if(!result.find(r => r.code === rate.toCurrency.code)) {
        result.push(rate.toCurrency)
      }
    }
    return result
  }, []) ?? []
}

// returns X where 1 USD = X currency
// each entry's fromRate/toRate are already normalized: 1 USD = fromRate fromCurrency, 1 USD = toRate toCurrency
export const getCurrencyRate = (exchangeRates, currency) => {
  if (currency === 'USD') return 1
  if (!exchangeRates?.length) return null
  for (const entry of exchangeRates) {
    if (entry.fromCurrency.code === currency) return entry.fromRate
    if (entry.toCurrency.code === currency) return entry.toRate
  }
  return null
}

export const transformObject = (entity, property) => {
  const object = entity[property]
  Object.keys(object).forEach(key => {
    if(Array.isArray(object[key])) {
      object[key].forEach((item, idx) => {
        Object.keys(item).forEach(k => {
          entity[`${property}[${key}][${idx}][${k}]`] = item[k]
        })
      })
    } else {
      entity[`${property}[${key}]`] = object[key]
    }
  })
  delete entity[property]
}

export const transformArray = (entity, property) => {
  entity[property].forEach((object, index) => {
    if(!object) return
    if ('id' in object && (object.id !== 'holded' && object.id !== '')) {
      entity[`${property}[${index}][id]`] = object.id
    }
    Object.keys(object).forEach(key => {
      if (
        typeof object[key] === 'object' &&
        !Array.isArray(object[key]) &&
        object[key] !== null && 'id' in object[key] && (object[key].id !== 'holded' && object[key].id !== '')
      ) {
        entity[`${property}[${index}][${key}]`] = object[key].id ?? 'isNull'
      } else {
        entity[`${property}[${index}][${key}]`] = object[key] ?? ''
      }
    })
  })
  delete entity[property]
}

export const transformPreSubmit = (entity) => {
  // parse property and format array property
  Object.keys(entity).forEach(key => {
    // push
    // should I clear all before push ?
    if(key.includes('[]')) {

    }
    // set for case like entity['contacts[0]']
    const matches = [...key.matchAll(/([a-zA-Z]+)\[([0-9]+)\]/g)];
    if (matches.length > 0) {
      if(!entity[matches[0][1]]) entity[matches[0][1]] = []
      entity[matches[0][1]][matches[0][2]] = entity[key]
      delete(entity[key])
    }
  })
}
export const recalculateChargeItemPrice = (entity, context) => {
  const currencyRate = context.exchangeRates[context.currency]
  if(entity.price && entity.price.amount) {
    entity.price = {
      amount: entity.price?.amount ?? 0,
      currency: entity.price?.currency ?? context.currency,
      rate: context.exchangeRates[entity.price?.currency ?? context.currency]
    }
    entity.chargePrice = {
      amount: convertMoney(entity.price, currencyRate).round(4),
      currency: context.currency,
      rate: currencyRate
    }
    if(entity.quantity) {
      entity.amount = {
        amount: (entity.chargePrice.amount * (entity.quantity ?? 0)).round(4),
        currency: context.currency,
        rate: currencyRate
      }
      if(entity.taxGroup) {
        entity.tax = {
          amount: (entity.amount.amount * (entity.taxGroup.amount / 100)).round(context.moneyScale),
          currency: context.currency,
          rate: currencyRate
        }
      }
    }
  }
}
// print to local date from api
export const printDateTime = (dateString, outputFormat = 'DD/MM/YYYY HH:mm') => {
  if(!dateString) return null
  const date = dateAdapter.parseISO(dateString)
  return date.format(outputFormat)
}
// print to local date from api
export const printDate = (dateString, outputFormat = 'DD/MM/YYYY') => {
  if(!dateString) return null
  const date = dateAdapter.parseISO(dateString)
  return date.format(outputFormat)
}
// parse date from local from datepicker for api call
export const toUTCDate = (dateString, format = 'DD/MM/YYYY HH:mm:ss') => {
  if(!dateString) return dateString
  const date = dateString === 'now' 
              ? dateAdapter.date() 
              : dateAdapter.parse(dateString, format)
  return dayJSToUTC(date)
}

export const dayJSToUTC = (dayJSDate) => {
  return dayJSDate.toISOString().replace('T', ' ').replace('.000Z','')
}

export const chargeTaxToTaxGroup = (chargeTax) => {
  const taxGroups = useAppStore().getList('taxGroups')
  const found = taxGroups.find(t => t.amount === chargeTax.round(2))
  return found ?? taxGroups[0]
}

export const priceToChargeItem = (quotePrice, ebitNoteType, ebitNoteCurrency) => {
  const {
    charge,provider,chargeName,chargeType,chargeTypeName,calculationType,
    description, quantity, providerName, 
    selling, buying, id, position
  } = quotePrice
  const taxType = ebitNoteType === EbitNote.Debit ? 'debitTax' : 'creditTax'
  const taxGroup = chargeTaxToTaxGroup(charge ? (charge[taxType] ?? 0) : 0)
  // in note's currency
  const chargePrice = {
    amount: convertMoney(ebitNoteType === EbitNote.Debit ? selling : buying, ebitNoteCurrency.rate),
    currency: ebitNoteCurrency.currency,
    rate: ebitNoteCurrency.rate
  }
  const amount = {
    amount: chargePrice.amount*quantity,
    currency: chargePrice.currency,
    rate: chargePrice.rate
  }
  const tax = {
    amount: amount.amount*(taxGroup.amount/100),
    currency: chargePrice.currency,
    rate: chargePrice.rate
  }
  return {
    charge,provider,chargeName,chargeType,chargeTypeName,calculationType,
    description, quantity, providerName, 

    price: ebitNoteType === EbitNote.Debit ? selling : buying,
    taxGroup, chargePrice, amount, tax, position,
    quotePrice: {id},
    tempId: uuidv4()
  }
}

export const printNullable = (string, prefix = null) => {
  return (string ?? '...') + (string && prefix ? (' ' + prefix) : '')
}

export const printMoney = (money) => {
  // todo: show symbol instead of currency
  if(!money || money === null) return '...'
  return money.amount ? (getSymbol(money.currency) + '' + money.amount) : '...'
}

export const printPersonName = (person) => {
  return !(person.firstName && person.lastName) ? '...' : [person.firstName,person.lastName].join(' ')
}

export const operatorList = () => {
  return [
    {
      value: 'eq',
      title: $gettext('equals'),
      symbol: '=',
      groups: ['*']
    },
    {
      value: 'isMemberOf',
      title: $gettext('contains'),
      symbol: '⊃',
      groups: ['isMemberOf']
    },
    {
      value: 'inArray',
      title: $gettext('in array'),
      symbol: 'in',
      groups: ['select'],
      multiple: true
    },
    {
      value: 'notInArray',
      title: $gettext('not in array'),
      symbol: '∉',
      groups: ['select'],
      multiple: true
    },
    {
      value: 'neq',
      title: $gettext('not equals'),
      symbol: '≠',
      groups: ['text', 'number']
    },
    {
      value: 'gt',
      title: $gettext('greater than'),
      symbol: '>',
      groups: ['number', 'date']
    },
    {
      value: 'lt',
      title: $gettext('less than'),
      symbol: '<',
      groups: ['number', 'date']
    },
    {
      value: 'gte',
      title: $gettext('greater than or equal to'),
      symbol: '>=',
      groups: ['number', 'date']
    },
    {
      value: 'lte',
      title: $gettext('less than or equal to'),
      symbol: '<=',
      groups: ['number', 'date']
    },
    // text
    {
      value: 'like',
      title: $gettext('contains'),
      symbol: '⊃',
      groups: ['text', 'anywhere']
    },
    {
      value: 'startsWith',
      title: $gettext('starts with'),
      symbol: '^=',
      groups: ['text', 'anywhere']
    },
    {
      value: 'isEmpty',
      title: $gettext('empty'),
      symbol: '∅',
      groups: ['text'],
      valueComponentDisabled: true
    },
    // date 
    {
      value: 'between',
      title: $gettext('Between'),
      symbol: '()',
      dateConfig: { 
        mode: 'range', dateFormat: 'DD/MM/YYYY', altInput: true, altFormat: 'DD/MM/YYYY'
      },
      groups: ['number', 'date']
    },
    {
      value: 'relativeRange',
      title: $gettext('Relative Range'),
      symbol: '[]',
      groups: ['date'],
      ranges: [
        {value: 'Today', title: $gettext('Today')},
        {value: 'ThisWeek', title: $gettext('This Week')},
        {value: 'LastWeek', title: $gettext('Last Week')},
        {value: 'ThisMonth', title: $gettext('This Month')},
        {value: 'LastMonth', title: $gettext('Last Month')},
        {value: 'ThreeMonths', title: $gettext('3 Months')},
        {value: 'SixMonths', title: $gettext('6 Months')},
        {value: 'ThisYear', title: $gettext('This Year')},
        {value: 'LastYear', title: $gettext('Last Year')},
        {value: 'ThreeYears', title: $gettext('3 Years')},
      ]
    },
  ]
} 

export const transformDateFilter = (orgFilter) => {
  const filter = JSON.parse(JSON.stringify(orgFilter))
  if(filter.operator === 'eq') {
    filter.operator = 'between'
    let fromDate = filter.value + ' 00:00:00'
    let toDate = filter.value + ' 23:59:59'
    // to UTC time
    console.log(fromDate, toDate)
    fromDate = toUTCDate(fromDate) 
    toDate = toUTCDate(toDate)
    filter.value = fromDate + ',' + toDate
  } else if (filter.operator === 'gte') {
    filter.value = toUTCDate(filter.value + ' 00:00:00')
  } else if (filter.operator === 'lte') {
    filter.value = toUTCDate(filter.value + ' 23:59:59')
  } else if (filter.operator === 'gt') {
    filter.value = toUTCDate(filter.value + ' 23:59:59')
  } else if (filter.operator === 'lt') {
    filter.value = toUTCDate(filter.value + ' 00:00:00')
  } else if (filter.operator === 'between') {
    // regex for current date time DD/MM/YYYY
    // todo: im assuming that there are two dates selected
    console.log(filter.value, 'between filter.value')
    let [fromDate, toDate] = filter.value.match(/[0-9]{2}\/[0-9]{2}\/[0-9]{4}/gm)
    fromDate = toUTCDate(fromDate + ' 00:00:00') 
    toDate = toUTCDate(toDate + ' 23:59:59')
    filter.value = fromDate + ',' + toDate
  }
  return filter
}
export const displayFileSize = (size) => {
  let _size = size
  let i = 0
  const fSExt = ['B', 'KB', 'MB', 'GB']
  //check if file is in GB,MB,KB or Bytes
  while(_size > 1000)
  { 
    _size/=1024; //divide file size 
    i++;
  }
  return (Math.round(_size*100)/100) + fSExt[i]
}
export default {

  serialize (obj) {
    if (!obj) return ''
    const str = []
    for (const p in obj) {
      if (Array.isArray(obj[p])) {
        obj[p].forEach((e) => {
          str.push(encodeURIComponent(p) + '[]=' + encodeURIComponent(e))
        })
      } else {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
      }
    }
    return str.join('&')
  },

  caseStripRelation (text) {
    const relationMap = {
    }
    // convert camelCase and snake_case to normal case
    const caseStrippedRelation = text
      .replace(/[A-Z]/g, m => '_' + m.toLowerCase())
      .split('_')
      .join(' ')
      .toLowerCase().trim()
    if (typeof (relationMap[caseStrippedRelation]) !== 'undefined') {
      if (relationMap[caseStrippedRelation] === '') return ''
      return relationMap[caseStrippedRelation]
    } else {
      return caseStrippedRelation
        .replace(/\w\S*/g, function (txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        })
    }
  },

  rules () {
    return {
      required: (v) => !!v || $gettext('Field is required'),
      requiredArray: (v) => (!!v && v.length !== 0) || $gettext('Field is required'),
      email: (v) => /.+@.+\..+/.test(v) || $gettext('Invalid email'),
      maxLength: (maxLength, v) => {
        console.log(maxLength, 'maxLength')
        console.log(v, 'v')
        return (!!v && v.length <= maxLength) || ($gettext('Maximum character allowed is') + ' ' + maxLength)
      },
      requiredProperty: (property, object) => {
        console.log(property, object)
        console.log(!!(object && object[property]))
        return !!(object && object[property]) || $gettext('Field is required')
      },
    }
  },

  async autoLoad (state) {
    const result = await state.loader.call(null, 'limit=-1')
    if (result.error) {
      state.touched = false
    } else {
      state.touched = 'loaded'
      state.list = result.list || result
    }
    return state.list
  },

  alias (s) {
    return s.toString().normalize('NFD')
      .replace(/'/g, '-')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/&/g, '')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  },

  capitalize (string) {
    return string.replace(/\b\w/g, l => l.toUpperCase())
  },

  formData (data) {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      // remove private property
      if(key.startsWith('__')) return;
      if (Array.isArray(data[key])) {
        if (data[key].length > 0) {
          data[key].forEach(value => {
            formData.append(`${key}[]`, value.id || value)
          })
        } else {
          // todo: check how to submit empty array
          formData.append(key, 'isEmpty')
        }
      } else if (typeof data[key] === 'object' &&
        data[key] !== null
      ) {
        if(data[key] instanceof File) {
          formData.append(key, data[key])
        }
        data[key] = toRaw(data[key])
        console.log(data[key], key)
        if(data[key].id) {
          formData.append(key, data[key].id)
        } else {
          Object.keys(data[key]).forEach(prop => {
            if(data[key][prop] === null 
              || data[key][prop] === undefined 
              || data[key][prop] === 'undefined'
            ) {
              return
            }
            formData.append(`${key}[${prop}]`, data[key][prop])
          })
        }
      } else {
        if (data[key] === null) {
          // skip
        } else {
          formData.append(key, data[key])
        }
      }
    })
    return formData
  }

}
