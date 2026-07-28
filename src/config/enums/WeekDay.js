const list = [
    { 'enums': 'Mon', 'value': 'Mon', 'title': $gettext('Monday') },
    { 'enums': 'Tue', 'value': 'Tue', 'title': $gettext('Tuesday') },
    { 'enums': 'Wed', 'value': 'Wed', 'title': $gettext('Wednesday') },
    { 'enums': 'Thu', 'value': 'Thu', 'title': $gettext('Thursday') },
    { 'enums': 'Fri', 'value': 'Fri', 'title': $gettext('Friday') },
    { 'enums': 'Sat', 'value': 'Sat', 'title': $gettext('Saturday') },
    { 'enums': 'Sun', 'value': 'Sun', 'title': $gettext('Sunday') }
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

