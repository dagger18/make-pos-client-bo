const list = [
    { 'enums': 'Origin',      'value': 'ORIGIN',      'title': $gettext('Origin only') },
    { 'enums': 'Destination', 'value': 'DESTINATION', 'title': $gettext('Destination only') },
    { 'enums': 'All',         'value': 'ALL',         'title': $gettext('All') },
]
export const enums = list.reduce(function(result, item) {
  result[item.enums] = item.value;
  return result;
}, {})
export const getList = list.map(({value, title}) => ({value, title}))
export const getTitle = (findValue) => {
  if (!findValue) return null
  return list.find(({value}) => value === findValue)?.title ?? findValue
}
