import Filters from "@/components/common/Filters.vue"
import {
  findByValue as findEntityValue,
  getColumns,
  getDateSegments, getList as getEntityTypes,
  getGroupableColumns, getRowTypes
} from "@/config/enums/DatasetType"
import CommonService, {availableCurrencies} from "@/services/CommonService"
import { useAppStore } from "@/stores/appStore"
export const makeDefaultEntity = async () => {
  return {
    name: ''
  }
}
export const getTableConfig = (entity) => {
  const entityType = findEntityValue(entity.entityType)
  const columns = getColumns(entity)
  const groupableColumns = getGroupableColumns(entity.entityType, entity.rowType)
  const dateSegments = getDateSegments(entity.entityType, entity.rowType, entity.groupColumn)
  const groupedColumnConfig = entity.groupColumn 
                              ? groupableColumns
                                 .find(gC => gC.value === entity.groupColumn)
                              : null
  const groupedColumn = (entity.rowType === 'Group' 
                          || entity.rowType === 'GroupColumnEntity'
                        ) && entity.groupColumn 
                        ? [
                            {
                              key: entity.groupColumn , 
                              text: groupedColumnConfig.title,
                              wrapperClass: 'text-no-wrap' 
                            }
                        ] : []
  let pickedColumns = []
  let staffProperty = null
  if(entity.rowType !== 'GroupColumnEntity') {
    pickedColumns = entity.columns?.map(i => {
      const found = columns.find(c => c.value === i)
      if(!found) return null
      return {key: found.value, text: found.title, ...found}
    })
  } else {
    if(entity.groupColumn === 'shipment.completedDate') {
      const firstStaffFilter = entity.filters
      ?.find(f => ['accountManager','createdBy'].includes(f.property))
      let pickedStaffs = firstStaffFilter?.value
      
      staffProperty = firstStaffFilter?.property
      if(!Array.isArray(pickedStaffs))                      
        pickedStaffs = [pickedStaffs]
      const users = useAppStore().getList('users')
      pickedColumns = pickedStaffs
                      ?.filter(i => i)
                      .map(i => {
                        const user = users.find(user => user.id == i)
                        if(!user) return null
                        return {key: i, text: user.firstName}
                      })
                      .filter(i => i)
    } else if (entity.groupColumn === 'activity.createdDate') {
      staffProperty = 'userId'
      let pickedStaffs = entity.filters
                          ?.find(f => ['userId'].includes(f.property))
                          ?.value
      if(!Array.isArray(pickedStaffs))                      
        pickedStaffs = [pickedStaffs]
      const users = useAppStore().getList('users')
      pickedColumns = pickedStaffs?.map(i => {
        if(!i) return
        const user = users.find(user => user.id == i)
        if(!user) return null
        return {key: i, text: user.firstName}
      }).filter(i => i)
    }
    
  }
  const showInTableColumns = [...groupedColumn, ...(pickedColumns ?? [])]
    .filter(i => i)
    .map(i => {
      return {
        ...i,
        ...(i.sortable ? {sortable: true} : {sortable: false})
      }
    })
  const finalFilterConfigs = 
    // incase grouped column need its filter config
    (groupedColumnConfig && groupedColumnConfig.filterConfigs) 
    ? groupedColumnConfig.filterConfigs()
    : entityType?.filterConfigs()
  const finalEntityService = 
    // incase grouped column need its entity service config
    (groupedColumnConfig && groupedColumnConfig.service) 
    ? groupedColumnConfig.service
    : entityType?.service
  return {columns, groupableColumns, dateSegments,
    showInTableColumns, finalFilterConfigs, finalEntityService, staffProperty}
}
export const fetchDataset = async (entity) => {
  const {showInTableColumns, staffProperty, finalEntityService} = getTableConfig(entity)
  const params = {
    rowType: entity.rowType,
    groupColumn: entity.groupColumn,
    dateSegment: entity.dateSegment,
    groupColumnEntity: entity.rowType === 'GroupColumnEntity' 
                      ? (entity.columns?.length > 0 ? entity.columns[0] : [])
                      : null,
    staffProperty
  }
  entity.filters.forEach((filter, index) => {
    params[`filters[${index}][0]`] = filter.property
    params[`filters[${index}][1]`] = filter.operator
    params[`filters[${index}][2]`] = encodeURIComponent((''+filter.value).trim())
  })
  showInTableColumns.forEach((header, index) => {
    if(index === 0) return
    params[`columns[${index}]`] = encodeURIComponent(header.key)
  })
  params['timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return await finalEntityService.list(CommonService.serialize(params))
}
export const layout = (entity) => {
  const appStore = useAppStore()
  const { required, requiredArray } = CommonService.rules()
  const {
    columns, groupableColumns, dateSegments,
    showInTableColumns, finalFilterConfigs, finalEntityService, staffProperty
  } = getTableConfig(entity)
  return [  
    [
      [
        {
          type: 'table',
          headers: showInTableColumns,
          showPureArray: entity.rowType === 'Group' || entity.rowType === 'GroupColumnEntity',
          isReportTable: true,
          isReportTableInDatasetForm: true,
          filterConfigs: finalFilterConfigs,
          filterValues: entity.filters,
          apiCallParam: {
            reportCurrency: entity.currency ?? appStore.exchangeRatesConfig.currency.code,
            rowType: entity.rowType,
            groupColumn: entity.groupColumn,
            dateSegment: entity.dateSegment,
            groupColumnEntity: entity.rowType === 'GroupColumnEntity'
                              ? (entity.columns?.length > 0 ? entity.columns[0] : [])
                              : null,
            staffProperty
          },
          reportName: entity.name,
          apiService: finalEntityService,
          hideTitle: true,
          class:"ms-2",
          columnSpan: 7,
        }
      ],
      [
        {
          name: 'name',
          text: $gettext('Name'),
          rules: [required],
          columnSpan: 5
        },
        {
          name: 'currency',
          text: $gettext('Currency'),
          type: 'select',
          items: availableCurrencies(appStore.exchangeRatesConfig.exchangeRates),
          returnObject: false,
          rules: [required]
        },
        {
          name: 'entityType',
          text: $gettext('Dataset Type'),
          type: 'select',
          items: getEntityTypes,
          returnObject: false,
          rules: [required]
        },
        {
          show: !!entity.entityType,
          name: 'rowType',
          text: $gettext('Row Type'),
          type: 'select',
          items: getRowTypes(entity.entityType),
          returnObject: false,
          rules: [required]
        },
        {
          name: 'groupColumn',
          show: groupableColumns.length > 0,
          text: $gettext('Group Type'),
          type: 'select',
          items: groupableColumns,
          returnObject: false,
          rules: groupableColumns.length > 0 ? [required] : []
        },
        {
          name: 'dateSegment',
          show: dateSegments.length > 0,
          text: $gettext('Date Segment'),
          type: 'select',
          items: dateSegments,
          returnObject: false,
          rules: dateSegments.length > 0 ? [required] : []
        },
        {
          name: 'filters',
          text: $gettext('Filters'),
          type: 'custom',
          filterConfigs: finalFilterConfigs,
          component: Filters,
          show: !!entity.entityType
        },
        {
          name: 'columns',
          text: $gettext('Columns'),
          type: 'orderedMultiSelect',
          show: columns.length > 0,
          items: columns,
          rules: [requiredArray],
          showSelectAll: true
        }
      ],
    ]
  ]
}
