import { gettext } from '@/plugins/gettext';
import { useAppStore } from '@/stores/appStore';
const { $gettext } = gettext
const list = [
  {
    enums: 'AirFreight',
    value: 'AF',
    alias: 'ST',
    title: $gettext('Air Freight'),
    transportTypes: ['AIR']
  },
  {
    enums: 'OceanFreight',
    value: 'OF',
    alias: 'ST',
    title: $gettext('Ocean Freight'),
    transportTypes: ['OCN']
  },
  {
    enums: 'Trucking',
    value: 'TK',
    alias: 'ST',
    title: $gettext('Trucking'),
    transportTypes: ['RD', 'RAL', 'COU', 'MMD']
  },
  {
    enums: 'OriginCharge',
    value: 'OC',
    alias: 'LC',
    title: $gettext('Origin Charge'),
    transportTypes: ['OCN', 'AIR', 'RD', 'RAL', 'COU', 'MMD']
  },
  {
    enums: 'DestinationCharge',
    value: 'DC',
    alias: 'LC',
    title: $gettext('Destination Charge'),
    transportTypes: ['OCN', 'AIR', 'RD', 'RAL', 'COU', 'MMD']
  },
  {
    enums: 'Trucking',
    value: 'TK',
    alias: 'TK',
    title: $gettext('Trucking'),
    transportTypes: ['OCN', 'AIR']
  },
  {
    enums: 'Service',
    value: 'SV',
    alias: 'SV',
    title: $gettext('Service'),
    transportTypes: ['OCN', 'AIR', 'RD', 'RAL', 'COU', 'MMD']
  }
]
export const enums = list.reduce(function(result, item, index) {
  result[item.enums] = item.value;
  return result;
}, {})
export const getList = (transportType) => {
  const appStore = useAppStore()
  // except id 5, which is service made by mistake
  const customChargeTypes = appStore
    .getList('customChargeTypes')
    .filter(({id}) => id != 5)
    .map(({id, name}) => {return {value: '' + id, title: name, alias: 'CT'}})
  return list
    .filter(({transportTypes}) => transportTypes.includes(transportType))
    .concat(customChargeTypes)
}
export const findByValue= (findValue) => {
  return list.find(({value}) => value === findValue)
}
