const list = [
    { 'enums': 'InvoiceDebit', 'value': 'ID', 
      'title': $gettext('Debit Invoice'),
      'accountingMenu': $gettext('Revenues')
    },
    { 
      'enums': 'InvoiceCredit', 'value': 'IC', 
      'title': $gettext('Credit Invoice'),
      'accountingMenu': $gettext('Costs') 
    },
    { 
      'enums': 'COBO', 'value': 'CO', 
      'title': $gettext('COBO'),
      'accountingMenu': $gettext('COBO')
    },
    { 
      'enums': 'POBO', 'value': 'PO', 
      'title': $gettext('POBO'),
      'accountingMenu': $gettext('POBO')
    },
    { 
      'enums': 'SOAClient', 'value': 'SOA-Client', 
      'title': $gettext('SOA Client'),
      'accountingMenu': $gettext('SOA Client')
    },
    { 
      'enums': 'SOAProvider', 'value': 'SOA-Provider', 
      'title': $gettext('SOA Provider'),
      'accountingMenu': $gettext('SOA Provider')
    },
    { 'enums': 'Debit', 'value': 'DN', 'title': $gettext('Debit') },
    { 'enums': 'Credit', 'value': 'CN', 'title': $gettext('Credit') },
    { 
      'enums': 'RecordReceipt', 'value': 'RPT', 
      'title': $gettext('Receipt Record'),
      'accountingMenu': $gettext('Receipt Records') 
    },
    { 
      'enums': 'RecordPayment', 'value': 'PMT', 
      'title': $gettext('Payment Record'),
      'accountingMenu': $gettext('Payment Records') 
    },
]
export const enums = list.reduce(function(result, item, index) {
  result[item.enums] = item.value;
  return result;
}, {})
export const getList = list.map(({value, title}) => {return {value, title}})
export const getTitle = (findValue) => {
  if(!findValue) return null
  return list.find(({value}) => value === findValue).title
}
export const findByValue = (findValue) => {
  if(!findValue) return null
  return list.find(({value}) => value === findValue)
}
export const getAccountingMenuList = list
  .filter(i => i.accountingMenu)
  .map(({value, accountingMenu}) => {return {value, title: accountingMenu}})
