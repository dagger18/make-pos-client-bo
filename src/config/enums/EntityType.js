const list = [
    { 'enums': 'Shipment', 'value': 'shipment', 'title': $gettext('Shipment') },
    { 'enums': 'Charge', 'value': 'charge', 'title': $gettext('Charge') },
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

