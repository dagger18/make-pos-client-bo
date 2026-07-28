<script setup>
import { fetchDataset } from '@/config/forms/report/Dataset';
import { printPersonName } from '@/services/CommonService';
import { useAppStore } from '@/stores/appStore';
const headingColor = 'rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity))'
const labelColor = 'rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity))'
const borderColor = 'rgba(var(--v-border-color), var(--v-border-opacity))'

const props = defineProps({
  dataset: {type: Object, default: () => {}},
  componentConfig: {type: Object, default: () => {}},
  yAxis: {type: Object, default: () => {}},
})
const rows = ref([])
const chart = ref(null)
onMounted(async () => {
  await useAppStore().fetchList('users')
  const response = await fetchDataset(props.dataset)
  rows.value = [response.total]
})
const reloader = ref(0)
const computedData = computed(() => {
  const series = props.componentConfig.series
                .map(({column}) => { 
                  return {name: column, data: null}
                })
  const seriesMap = series.reduce((result, item, index) => {
    result[item.name] = index
    return result
  }, {})
  let columnMap = {}
  if(props.dataset.rowType !== 'GroupColumnEntity') {
    columnMap = props.dataset.columns.reduce((result, item, index) => {
      // why +1, because first column is grouped, used for y axis
      result[index + 1] = item
      return result
    }, {})
  } else {
    let filterProps = []
    if(props.dataset.groupColumn === 'activity.createdDate') {
      filterProps = ['userId']
    } else {
      filterProps = ['createdBy', 'accountManager']
    }
    const pickedUsers = props.dataset.filters.find(f => filterProps.includes(f.property)).value
    columnMap = pickedUsers.reduce((result, item, index) => {
      result[index + 1] = item
      return result
    }, {})
  }
  
  const xAxis = []
  let maxValue = 0
  console.log('columnMap', columnMap)
  console.log('seriesMap', seriesMap)
  rows.value.forEach(row => {
    row.forEach((columnValue, index) => {
      if(index === 0) {
        return
      }
      const columnName = columnMap[index]
      if(seriesMap.hasOwnProperty(columnName)) {
        const cellValue = 
          typeof columnValue === 'string' 
          ? parseInt(columnValue.replaceAll(',', '').replaceAll(' x KGS', '')) 
          : columnValue
        if(typeof columnValue === 'string' && columnValue.includes('KGS')) {
          series[seriesMap[columnName]].name = columnName + '(KGS)'
        } else {
          // todo: show name translated here instead of variable
          if(props.dataset.rowType === 'GroupColumnEntity') {
            if(props.dataset.groupColumn === 'activity.createdDate'
              || props.dataset.groupColumn === 'shipment.completedDate'
            ) {
              const user = useAppStore().getList('users').find(u => u.id == columnName)
              if(user) {
                series[seriesMap[columnName]].name = printPersonName(user)
              } else {
                console.log('what, you dont see it')
              }
            }
          }
        }
        series[seriesMap[columnName]].data = cellValue
      }
    })
  })
  reloader.value += 1
  return {
    series: series.map(c => c.data),
    labels: series.map(c => c.name)
  }
})
const chartConfig = computed(() => {
  const reloaderd = reloader.value
  return {
    labels: computedData.value.labels,
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom'
        }
      }
    }]
  }
  
})

</script>

<template>
  <VueApexCharts
    v-if="rows.length > 0"
    ref="chart"
    type="pie"
    height="420"
    :options="chartConfig"
    :series="computedData.series"
  />
</template>

