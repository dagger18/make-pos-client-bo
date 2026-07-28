const list = [
    { 'enums': 'Prepaid', 'value': 'P', 'title': $gettext('Freight Prepaid') },
    { 'enums': 'Collect', 'value': 'C', 'title': $gettext('Freight Collect') },
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

