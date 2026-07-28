const list = [
    { 'enums': 'Export', 'value': 'EXP', 'title': $gettext('Export') },
    { 'enums': 'Import', 'value': 'IMP', 'title': $gettext('Import') },
    { 'enums': 'CrossTrade', 'value': 'XTD', 'title': $gettext('Cross Trade') },
    { 'enums': 'Domestic', 'value': 'DOM', 'title': $gettext('Domestic') },
    { 'enums': 'Transshipment', 'value': 'TSH', 'title': $gettext('Transshipment') },
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

