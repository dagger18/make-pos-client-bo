import { gettext } from '@/plugins/gettext';
import { enums as VolumeType } from "./VolumeType";

const { $gettext } = gettext
const list = [
  {
    enums: 'Ocean',      value: 'OCN',
    title: $gettext('OCN'),   slug: 'ocn',
    titleFull: $gettext('Ocean'),
    icon: 'far fa-ship', volumeType: VolumeType.Container,
    carrierTitle: $gettext('Carrier')
  },
  {
    enums: 'AIR',        value: 'AIR',
    title: $gettext('AIR'),   slug: 'air',
    titleFull: $gettext('Air'),
    icon: 'far fa-plane-departure', volumeType: VolumeType.TotalShip,
    carrierTitle: $gettext('Air-line')
  },
  {
    enums: 'Road',       value: 'RD',
    title: $gettext('RD'),    slug: 'rd',
    titleFull: $gettext('Road'),
    icon: 'far fa-truck', volumeType: VolumeType.Unit,
    carrierTitle: $gettext('Truck Vendor')
  },
  {
    enums: 'Rail',       value: 'RAL',
    title: $gettext('RAL'),   slug: 'ral',
    titleFull: $gettext('Rail'),
    icon: 'far fa-train', volumeType: VolumeType.Container,
    carrierTitle: $gettext('Rail Operator')
  },
  {
    enums: 'Courier',    value: 'COU',
    title: $gettext('COU'),   slug: 'cou',
    titleFull: $gettext('Courier'),
    icon: 'far fa-box', volumeType: VolumeType.Unit,
    carrierTitle: $gettext('Courier Provider')
  },
  {
    enums: 'Multimodal', value: 'MMD',
    title: $gettext('MMD'),   slug: 'mmd',
    titleFull: $gettext('Multimodal'),
    icon: 'far fa-hashtag', volumeType: VolumeType.Other,
    carrierTitle: $gettext('Carrier')
  }
]
export const enums = list.reduce(function(result, item) {
  result[item.enums] = item.value;
  return result;
}, {})
export const getList = list.map(e => e)
export const getTitle = (findValue) => {
  if(!findValue) return null
  const item = list.find(({value}) => value === findValue)
  return item ? item.title : findValue
}
export const getCarrierTitle = (findValue) => {
  if(!findValue) return null
  const item = list.find(({value}) => value === findValue)
  return item ? item.carrierTitle : null
}
export const slugToValue = (findSlug) => {
  const item = list.find(({slug}) => slug === findSlug)
  return item ? item.value : null
}
export const valueToSlug = (findValue) => {
  const item = list.find(({value}) => value === findValue)
  return item ? item.slug : null
}
export const slugToTransportType = (findSlug) => {
  return {...list.find(({slug}) => slug === findSlug)}
}
export const findByValue = (findValue) => {
  return list.find(({value}) => value === findValue)
}
export const valueToVolumeType = (transportType, serviceType = null) => {
  if(serviceType) {
    if(['FCL', 'RORO', 'OOG', 'FCL-RAIL'].includes(serviceType)) return VolumeType.Container
    if(['FTL', 'BLOCK', 'WAGON'].includes(serviceType)) return VolumeType.Unit
    if(['LCL', 'LTL', 'GROUPAGE', 'COURIER-RD', 'LCL-RAIL', 'BULK'].includes(serviceType)) return VolumeType.Unit
    if(['DIRECT', 'CONSOL', 'EXPRESS', 'CHARTER', 'EXPRESS-COU', 'ECONOMY', 'OVERNIGHT', 'SAME-DAY'].includes(serviceType)) return VolumeType.TotalShip
  }
  const item = list.find(({value}) => value === transportType)
  return item ? item.volumeType : VolumeType.Other
}
export const getPackageTypeTabs = () => {
  return list.filter(({slug}) => ['air', 'rd'].includes(slug))
}
export const getPackageTypeList = () => {
  return list
    .filter(({slug}) => ['air', 'rd'].includes(slug))
    .map(({value, title, icon}) => {return {value, title, icon}})
}
export const toPortType = (transportType) => {
  if(transportType === 'OCN') return 'S'
  if(transportType === 'AIR') return 'A'
  return ''
}
