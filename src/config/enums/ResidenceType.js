import { gettext } from '@/plugins/gettext';
const { $gettext } = gettext
const list = [
  { 'enums': 'Domestic', 'value': 'D', 'title': $gettext('Domestic') },
  { 'enums': 'Overseas', 'value': 'O', 'title': $gettext('Overseas') },
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
