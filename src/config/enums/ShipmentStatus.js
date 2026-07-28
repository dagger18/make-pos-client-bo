const list = [
    { 
      'enums': 'Draft', 'value': 'DR', 'title': $gettext('Draft'), 'color': 'secondary',
      'nextStatuses': ['PE','AC']
    },
    { 
      'enums': 'Pending', 'value': 'PE', 'title': $gettext('Pending'), 'color': 'warning',
      'nextStatuses': ['AC', 'DR']
    },
    { 
      'enums': 'Active', 'value': 'AC', 'title': $gettext('Active'), 'color': 'success',
      'nextStatuses': ['CO', 'CA']
    },
    { 
      'enums': 'Completed', 'value': 'CO', 'title': $gettext('Completed'), 'color': 'primary',
      'nextStatuses': ['AC']
    },
    { 
      'enums': 'Cancelled', 'value': 'CA', 'title': $gettext('Cancelled'), 'color': 'error',
      'nextStatuses': ['AC']
    }
]
export const enums = list.reduce(function(result, item, index) {
  result[item.enums] = item.value;
  return result;
}, {})
export const getList = list.map(({value, title}) => {return {value, title}})
export const findByValue = (findValue) => {
  if(!findValue) return null
  const status = list.find(({value}) => value === findValue)
  const nextStatuses = status.nextStatuses?.map(t => {
    return list.find(({value}) => value === t)
  }) ?? []
  return {...status, nextStatuses}
}

