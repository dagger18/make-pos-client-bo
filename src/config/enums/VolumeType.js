import { gettext } from '@/plugins/gettext';
const { $gettext } = gettext
const list = [
    { 'enums': 'Container', 'value': 'C', 'title': $gettext('Container') },
    { 'enums': 'Unit', 'value': 'U', 'title': $gettext('By Unit') },
    { 'enums': 'TotalShip', 'value': 'S', 'title': $gettext('By Total Shipment') },
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

