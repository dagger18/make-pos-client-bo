const list = [
    { 
      'enums': 'Pending', 'value': 'P', 
      'title': $gettext('Pending'), 'color': 'warning'
    },
    { 
      'enums': 'Sent', 'value': 'S', 
      'title': $gettext('Sent'), 'color': 'warning'
    },
    { 
      'enums': 'Active', 'value': 'A', 
      'title': $gettext('Active'), 'color': 'success', 
      'titleInvoice': $gettext('Sent'), 'colorInvoice': 'warning' 
    },
    { 
      'enums': 'Done', 'value': 'D', 
      'title': $gettext('Paid'), 'color': 'success',
      'titleInvoice': $gettext('Paid'), 'colorInvoice': 'success',
    }
]
export const enums = list.reduce(function(result, item, index) {
  result[item.enums] = item.value;
  return result;
}, {})
export const getList = list.map(({value, title}) => {return {value, title}})
export const getListInvocie = list.filter(i => i.titleInvoice).map(i => { return {value: i.value, title: i.titleInvoice}})
export const findByValue = (findValue) => {
  if(!findValue) return null
  return list.find(({value}) => value === findValue)
}

