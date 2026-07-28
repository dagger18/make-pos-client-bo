import { gettext } from '@/plugins/gettext';
const { $gettext } = gettext

const list = [
  // OCN
  { enums: 'FCL',        value: 'FCL',         transportMode: 'OCN', title: $gettext('FCL — Full Container Load') },
  { enums: 'LCL',        value: 'LCL',         transportMode: 'OCN', title: $gettext('LCL — Less than Container Load') },
  { enums: 'Bulk',       value: 'BULK',        transportMode: 'OCN', title: $gettext('Bulk / Break-bulk') },
  { enums: 'RoRo',       value: 'RORO',        transportMode: 'OCN', title: $gettext('RoRo — Roll-on Roll-off') },
  { enums: 'OOG',        value: 'OOG',         transportMode: 'OCN', title: $gettext('OOG — Out of Gauge') },
  // AIR
  { enums: 'Direct',     value: 'DIRECT',      transportMode: 'AIR', title: $gettext('DIRECT — Direct Booking') },
  { enums: 'Consol',     value: 'CONSOL',      transportMode: 'AIR', title: $gettext('CONSOL — Consolidation') },
  { enums: 'Charter',    value: 'CHARTER',     transportMode: 'AIR', title: $gettext('CHARTER — Air Charter') },
  { enums: 'AirExpress', value: 'EXPRESS',     transportMode: 'AIR', title: $gettext('EXPRESS — Air Express') },
  // RD
  { enums: 'FTL',        value: 'FTL',         transportMode: 'RD',  title: $gettext('FTL — Full Truck Load') },
  { enums: 'LTL',        value: 'LTL',         transportMode: 'RD',  title: $gettext('LTL — Less than Truck Load') },
  { enums: 'Groupage',   value: 'GROUPAGE',    transportMode: 'RD',  title: $gettext('Groupage / Part Load') },
  { enums: 'CourierRD',  value: 'COURIER-RD',  transportMode: 'RD',  title: $gettext('Road Courier / Express Van') },
  // RAL
  { enums: 'FCLRail',    value: 'FCL-RAIL',    transportMode: 'RAL', title: $gettext('FCL-RAIL — Full Container on Rail') },
  { enums: 'LCLRail',    value: 'LCL-RAIL',    transportMode: 'RAL', title: $gettext('LCL-RAIL — Shared Rail Container') },
  { enums: 'Block',      value: 'BLOCK',       transportMode: 'RAL', title: $gettext('BLOCK — Block Train') },
  { enums: 'Wagon',      value: 'WAGON',       transportMode: 'RAL', title: $gettext('WAGON — Full Wagon Load') },
  // COU
  { enums: 'Economy',    value: 'ECONOMY',     transportMode: 'COU', title: $gettext('Economy (3–7 days)') },
  { enums: 'ExpressCOU', value: 'EXPRESS-COU', transportMode: 'COU', title: $gettext('Express (1–3 days)') },
  { enums: 'Overnight',  value: 'OVERNIGHT',   transportMode: 'COU', title: $gettext('Overnight') },
  { enums: 'SameDay',    value: 'SAME-DAY',    transportMode: 'COU', title: $gettext('Same Day') },
  // MMD
  { enums: 'SeaAir',      value: 'SEA-AIR',      transportMode: 'MMD', title: $gettext('Sea → Air') },
  { enums: 'SeaRoad',     value: 'SEA-ROAD',     transportMode: 'MMD', title: $gettext('Sea → Road') },
  { enums: 'AirRoad',     value: 'AIR-ROAD',     transportMode: 'MMD', title: $gettext('Air → Road') },
  { enums: 'RailRoad',    value: 'RAIL-ROAD',    transportMode: 'MMD', title: $gettext('Rail → Road') },
  { enums: 'SeaRailRoad', value: 'SEA-RAIL-ROAD', transportMode: 'MMD', title: $gettext('Sea → Rail → Road') },
]

export const enums = list.reduce(function(result, item) {
  result[item.enums] = item.value;
  return result;
}, {})

export const getList = list.map(e => e)

export const getListByMode = (transportMode) => {
  if(!transportMode) return []
  return list.filter(item => item.transportMode === transportMode)
}

export const getTitle = (findValue) => {
  if(!findValue) return null
  const item = list.find(({value}) => value === findValue)
  return item ? item.title : findValue
}

export const findByValue = (findValue) => {
  return list.find(({value}) => value === findValue)
}
