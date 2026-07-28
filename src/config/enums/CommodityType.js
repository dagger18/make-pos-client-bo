const list = [
    { 'enums': 'Dangerous', 'value': 'D', 'title': $gettext('Dangerous Cargo') },
    { 'enums': 'General', 'value': 'G', 'title': $gettext('General Cargo') }
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

