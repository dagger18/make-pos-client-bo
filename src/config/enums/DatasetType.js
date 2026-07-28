import {
  reportMultipleStaffColumns,
  reportStaffColumns,
  reportStaffFilterConfigs
} from "@/config/tables/report/Staff";
import {
  reportColumns as shipmentColumnConfigs,
  reportFilterConfigs as shipmentFilterConfigs,
  reportGroupColumns as shipmentGroupColumnConfigs
} from "@/config/tables/shipment/Shipment";
// ShipmentActivityService and ShipmentService removed (freight-forwarder specific)
const ShipmentActivityService = null;
const ShipmentService = null;
import { $gettext } from "@/utils/api";
const list = [
  { 
    enums: 'Shipment', value: 'shipment', title: $gettext('Shipment'),
    rowTypes: [
      { 
        title: $gettext('Show record'), value: 'Entity',
        columns: shipmentColumnConfigs
      },
      { 
        title: $gettext('Show grouped data'), value: 'Group',
        groupableColumns: [
          {
            title: $gettext('Completed Date'), value: 'completedDate',
            dateSegments: [
              { title: $gettext('Daily'), value: 'Daily' },
              { title: $gettext('Monthly'), value: 'Monthly' },
              { title: $gettext('Yearly'), value: 'Yearly' },
            ]
          },
          {
            title: $gettext('ETD'), value: 'etd',
            dateSegments: [
              { title: $gettext('Daily'), value: 'Daily' },
              { title: $gettext('Monthly'), value: 'Monthly' },
              { title: $gettext('Yearly'), value: 'Yearly' },
            ]
          },
          { title: $gettext('Staff(Creator)'), value: 'createdBy' },
          { title: $gettext('Staff(Account Manager)'), value: 'accountManager' },
          { title: $gettext('Client'), value: 'client' },
          { title: $gettext('Provider'), value: 'provider' },
          { title: $gettext('Origin'), value: 'origin' },
          { title: $gettext('Destination'), value: 'destination' },
          { title: $gettext('Route'), value: 'route' },
        ],
        columns: shipmentGroupColumnConfigs
      },
    ],
    filterConfigs: shipmentFilterConfigs,
    service: ShipmentService,
  },
  { 
    enums: 'User', value: 'user', title: $gettext('Staff'),
    rowTypes: [
      { 
        title: $gettext('Report Single Staff'), 
        value: 'Group',
        groupableColumns: [
          {
            title: $gettext('Activity Date'), value: 'createdDate',
            dateSegments: [
              { title: $gettext('Daily'), value: 'Daily' },
              { title: $gettext('Monthly'), value: 'Monthly' },
              { title: $gettext('Yearly'), value: 'Yearly' },
            ]
          },
        ],
        columns: reportStaffColumns
      },
      { 
        title: $gettext('Report Multiple Staffs'), 
        value: 'GroupColumnEntity',
        groupableColumns: [
          {
            title: $gettext('Shipment Completed Date'), value: 'shipment.completedDate',
            dateSegments: [
              { title: $gettext('Daily'), value: 'Daily' },
              { title: $gettext('Monthly'), value: 'Monthly' },
              { title: $gettext('Yearly'), value: 'Yearly' },
            ],
            filterConfigs: shipmentFilterConfigs,
            service: ShipmentService,
          },
          {
            title: $gettext('Activity Date'), value: 'activity.createdDate',
            dateSegments: [
              { title: $gettext('Daily'), value: 'Daily' },
              { title: $gettext('Monthly'), value: 'Monthly' },
              { title: $gettext('Yearly'), value: 'Yearly' },
            ],
          },
        ],
        columns: reportMultipleStaffColumns
      },
    ],
    filterConfigs: reportStaffFilterConfigs,
    service: ShipmentActivityService,
  },
  { enums: 'Charge', value: 'charge', title: $gettext('Charge') }
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
export const findByValue = (findValue) => {
  if(!findValue) return null
  return list.find(({value}) => value === findValue)
}
export const getRowTypes = (findValue) => {
  if(!findValue) return []
  return list.find(({value}) => value === findValue)?.rowTypes ?? []
}
export const findRowType = (entity, rowTypeValue) => {
  if(!entity || !entity.rowTypes) return null
  return entity.rowTypes.find(({value}) => value === rowTypeValue)
}
export const getColumns = (entity) => {
  const {entityType, rowType, groupColumn} = entity
  return findRowType(
    findByValue(entityType), 
    rowType
  )?.columns(entityType, rowType, groupColumn) ?? []
}
export const getGroupableColumns = (entityValue, rowTypeValue) => {
  return findRowType(
    findByValue(entityValue), 
    rowTypeValue
  )?.groupableColumns ?? []
}
export const findGroupColumn = (rowType, groupColumnValue) => {
  return rowType?.groupableColumns?.find(({value}) => value === groupColumnValue) ?? null
}
export const getDateSegments = (entityValue, rowTypeValue, groupColumnValue) => {
  return findGroupColumn(
    findRowType(findByValue(entityValue), rowTypeValue),
    groupColumnValue
  )?.dateSegments ?? []
}
