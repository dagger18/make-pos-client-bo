const list = [
    { 'enums': 'Cash', 'value': 'C', 'title': $gettext('Cash') },
    { 'enums': 'Bank', 'value': 'B', 'title': $gettext('Bank') },
    { 'enums': 'Other', 'value': 'O', 'title': $gettext('Other') }
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

