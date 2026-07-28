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
  rows.value = response.data
})
const reloader = ref(0)
const computedData = computed(() => {
  const series = props.componentConfig.series
                .map(({color, column, type}) => { 
                  return {type, color, name: column, data: []}
                })
  let chartType = 'bar'
  let isAllLine = true
  const seriesMap = series.reduce((result, item, index) => {
    result[item.name] = index
    if(item.type === 'line') {
      chartType = 'line'
    } else {
      console.log('hehe')
      isAllLine = false
    }
    return result
  }, {})
  console.log(props.componentConfig.stacked, 'props.componentConfig.stacked')
  if(isAllLine && props.componentConfig.stacked) {
    //chartType = 'area'
  }
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
    let rowTotalValue = 0
    row.forEach((columnValue, index) => {
      if(index === 0) {
        xAxis.push(columnValue)
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
        series[seriesMap[columnName]].data.push(cellValue)
        rowTotalValue += cellValue
        maxValue = Math.max(maxValue, cellValue)
      }
    })
    if(props.componentConfig?.stacked) {
      maxValue = Math.max(maxValue, rowTotalValue)
    }
  })
  if(props.componentConfig?.stacked) {
  console.log('columnMap Stacked', columnMap, maxValue)
  }
  reloader.value += 1
  const closest10 = Math.pow(10, maxValue.toString().length - (maxValue > 1e9 ? 1 : 2))
  const yAxisMax = Math.ceil(maxValue / closest10)*closest10
  const yAxisLastMin = yAxisMax / 10
  
  let thousandShorthand = ''
  if(yAxisLastMin % 1000 === 0) {
    thousandShorthand = 'K'
  }
  if(yAxisLastMin % 1000000 === 0) {
    thousandShorthand = 'M'
  }
  if(yAxisLastMin % 1000000000 === 0) {
    thousandShorthand = 'B'
  }
  console.log(yAxisLastMin, thousandShorthand, yAxisLastMin % 1000000)
  return {
    series,
    yAxisMin: 0,
    yAxisMax: yAxisMax,
    thousandShorthand,
    xAxis,
    chartType
  }
})
const chartConfig = computed(() => {
  const reloaderd = reloader.value
  const xAxisCategories = computedData.value.xAxis
  console.log('what is this', computedData.value.xAxis)
  return {
  chart: {
    type: computedData.value.chartType,
    stacked: props.componentConfig?.stacked ?? false,
    parentHeightOffset: 0,
    toolbar: { show: false },
    zoom: { enabled: false },
  },
 /*
  markers: {
    size: 5,
    colors: ['#fff'],
    strokeColors: computedData.value.series.find(serie => serie.type === 'line')?.color,
    hover: { size: 6 },
    borderRadius: 4,
  },
  */
  stroke: {
    curve: 'smooth',
    width: computedData.value.chartType === 'bar' 
          ? 3 
          : computedData.value.series.map((serie) => { 
              return serie.type === 'line' ? 3 : 0 
            }),
    lineCap: 'round',
  },
  legend: {
    show: true,
    position: 'bottom',
    markers: {
      width: 12,
      height: 12,
      offsetX: -3,
    },
    height: 40,
    itemMargin: {
      horizontal: 10,
      vertical: 0,
    },
    fontSize: '15px',
    fontWeight: 400,
    labels: {
      colors: [headingColor],
      useSeriesColors: !1,
    },
    offsetY: 10,
  },
  grid: {
    strokeDashArray: 8,
    borderColor,
  },
  colors: computedData.value.series.map(s => s.color),
  plotOptions: {
    bar: {
      columnWidth: '30%',
      startingShape: 'rounded',
      endingShape: 'rounded',
      borderRadius: props.componentConfig?.stacked ? 0 : 4
    },
  },
  dataLabels: { enabled: false },
  xaxis: {
    tickAmount: xAxisCategories?.length,
    categories: xAxisCategories,
    labels: {
      style: {
        colors: [labelColor],
        fontSize: '13px',
        fontWeight: 400,
      },
    },
    axisBorder: { show: false },
    axisTicks: { show: true },
    tooltip: {
      enabled: false
    }
  },
  yaxis: {
    min: computedData.value.yAxisMin,
    max: computedData.value.yAxisMax,
    tickAmount: 10,
    labels: {
      style: {
        colors: [labelColor],
        fontSize: '13px',
        fontWeight: 400,
      },
      formatter: (val) => {
        if(computedData.value.thousandShorthand === 'B') {
          return (val/1e9).round(2) + 'B'
        }
        if(computedData.value.thousandShorthand === 'M') {
          return (val/1e6).round(2) + 'M'
        }
        if(computedData.value.thousandShorthand === 'K') {
          return (val/1e3).round(0) + 'K'
        }
        return val.round(2)
      },
    }
  },
  responsive: [
    {
      breakpoint: 1400,
      options: {
        chart: { height: 420 },
        xaxis: { labels: { style: { fontSize: '10px' } } },
        legend: {
          itemMargin: {
            vertical: 0,
            horizontal: 10,
          },
          fontSize: '13px',
          offsetY: 12,
        },
      },
    },
    {
      breakpoint: 1025,
      options: {
        chart: { height: 415 },
        plotOptions: { bar: { columnWidth: '50%' } },
      },
    },
    {
      breakpoint: 982,
      options: { plotOptions: { bar: { columnWidth: '30%' } } },
    },
    {
      breakpoint: 480,
      options: {
        chart: { height: 250 },
        legend: { offsetY: 7 },
      },
    },
  ]
}
})

</script>

<template>
  <VueApexCharts
    v-if="rows.length > 0"
    ref="chart"
    :type="computedData.chartType"
    height="420"
    :options="chartConfig"
    :series="computedData.series"
  />
</template>

