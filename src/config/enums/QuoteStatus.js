const list = [
    { 'enums': 'Draft', 'value': 'D', 'title': $gettext('Draft'), 'color': 'secondary'},
    { 'enums': 'Sent', 'value': 'S', 'title': $gettext('Sent'), 'color': 'primary' },
    { 'enums': 'Booked', 'value': 'B', 'title': $gettext('Booked'), 'color': 'success' },
    { 'enums': 'Rejected', 'value': 'R', 'title': $gettext('Rejected'), 'color': 'error' },
    { 'enums': 'Deleted', 'value': 'X', 'title': $gettext('Deleted'), 'color': 'error' },
]
export const enums = list.reduce(function(result, item, index) {
  result[item.enums] = item.value;
  return result;
}, {})
export const getList = list.map(({value, title}) => {return {value, title}})
export const findByValue = (findValue) => {
  if(!findValue) return null
  return list.find(({value}) => value === findValue)
}

