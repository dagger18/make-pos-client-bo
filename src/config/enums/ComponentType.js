import { getTableConfig } from '@/config/forms/report/Dataset';
import { useAppStore } from '@/stores/appStore';
const list = [
    {
      'enums': 'Table',       'value': 'Table',       'title': $gettext('Table'),
      componentConfig (entity) {
        const appStore = useAppStore()
        const {
          showInTableColumns, finalFilterConfigs,
          finalEntityService, staffProperty
        } = getTableConfig(entity)
        return {
          headers: showInTableColumns,
          showPureArray: entity.rowType === 'Group' || entity.rowType === 'GroupColumnEntity',
          isReportTable: true,
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
          hideTitle: true
        }
      }
    },
    { 
      'enums': 'ColumnLine',  'value': 'ColumnLine',  'title': $gettext('Column/Line'),
      componentConfig (entity) {
        return {
          dataset: entity
        }
      }
    },
    { 
      'enums': 'Pie',  'value': 'Pie',  'title': $gettext('Pie'),
      componentConfig (entity) {
        return {
          dataset: entity
        }
      }
    },
    { 'enums': 'AreaStacked', 'value': 'AreaStacked', 'title': $gettext('Area Stacked') },
    { 'enums': 'HeatMap',     'value': 'HeatMap',     'title': $gettext('HeatMap') },
]
export const enums = list.reduce(function(result, item, index) {
  result[item.enums] = item.value;
  return result;
}, {})
export const findByValue= (findValue) => {
  return list.find(({value}) => value === findValue)
}
export const getList = list.map(({value, title}) => {return {value, title}})
export const getTitle = (findValue) => {
  if(!findValue) return null
  return list.find(({value}) => value === findValue).title
}

