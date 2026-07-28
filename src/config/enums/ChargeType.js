import { gettext } from '@/plugins/gettext';
const { $gettext } = gettext
const list = [
  {
    enums: 'Local',
    value: 'LC',
    title: $gettext('Local Charges'),
    singularTitle: $gettext('Local Charge'),
    shortTitle: $gettext('Local'),
    slug: 'local',
    transportTypes: ['OCN', 'AIR']
  },
  {
    enums: 'Service',
    value: 'SV',
    title: $gettext('Service Charges'),
    singularTitle: $gettext('Service Charge'),
    shortTitle: $gettext('Service'),
    slug: 'service',
    transportTypes: ['OCN', 'AIR', 'RD', 'RAL', 'COU', 'MMD']
  },
  {
    enums: 'Customs',
    value: 'CT',
    title: $gettext('Customs Charges'),
    singularTitle: $gettext('Customs Charge'),
    shortTitle: $gettext('Customs'),
    slug: 'customs',
    transportTypes: ['OCN', 'AIR', 'RD', 'RAL', 'COU', 'MMD']
  },
  {
    enums: 'Freight',
    value: 'FR',
    title: $gettext('Freight Charges'),
    singularTitle: $gettext('Freight Charge'),
    shortTitle: $gettext('Freight'),
    slug: 'freight',
    transportTypes: ['OCN', 'AIR', 'RD', 'RAL', 'COU', 'MMD']
  },
]
export const enums = list.reduce(function(result, item, index) {
  result[item.enums] = item.value;
  return result;
}, {})
export const getList = list
export const getTitle = (findValue) => {
  if(!findValue) return null
  return list.find(({value}) => value === findValue).title
}
export const slugToValue = (findSlug) => {
  return list.find(({slug}) => slug === findSlug).value
}
export const findByValue= (findValue) => {
  return list.find(({value}) => value === findValue)
}
export const valueToSlug = (findValue) => {
  return list.find(({value}) => value === findValue).slug
}
export const slugToChargeType = (findSlug) => {
  return {...list.find(({slug}) => slug === findSlug)}
}
