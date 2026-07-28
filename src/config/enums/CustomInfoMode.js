import { gettext } from '@/plugins/gettext';
const { $gettext } = gettext
const list = [
  { 'enums': 'GeneralInfo', 'value': 'G', 'title': $gettext('Use general information') + '(' + $gettext('default') + ')' },
  { 'enums': 'InvoiceInfo', 'value': 'I', 'title': $gettext('Use invoicing information') },
  { 'enums': 'CustomInfo', 'value': 'C', 'title': $gettext('Custom information') }
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
