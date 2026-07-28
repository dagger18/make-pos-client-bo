const list = [
    { 'enums': 'AGENT', 'value': 'A', 'title': $gettext('Agent') },
    { 'enums': 'DIRECT', 'value': 'D', 'title': $gettext('Direct') },
    { 'enums': 'FORWARDER', 'value': 'F', 'title': $gettext('Forwarder') },
    { 'enums': 'CLIENT', 'value': 'C', 'title': $gettext('Client') },
    { 'enums': 'OTHER', 'value': 'O', 'title': $gettext('Other') }
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

