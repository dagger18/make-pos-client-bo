const list = [
  { 'enums': 'ACTIVE', 'value': 'A', 'title': $gettext('Active') },
  { 'enums': 'INACTIVE', 'value': 'I', 'title': $gettext('Inactive') },
  { 'enums': 'PENDING', 'value': 'P', 'title': $gettext('Pending') },
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
