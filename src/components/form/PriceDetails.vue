<script setup>
import { layout, makeDefaultEntity } from '@/config/forms/quote/PriceDetail';
import { dateAdapter } from "@/plugins/vuetify";
import CommonService, { getCurrencyRate, getSubTotal } from '@/services/CommonService';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  quote: { type: Object, default: () => {}}
})
const appStore = useAppStore()
if(props.modelValue && props.modelValue.length > 0) {
  props.modelValue.forEach(i => {
    if(i.id) {
      i.quote = {...props.quote, id: i.quote.id}
    }
  })
}
const user = useAuthStore().user
const state = reactive({
  items: props.modelValue.concat([makeDefaultEntity(props.quote)]),
  headerPositions: (user.tableConfig?.priceDetails?.columns ?? '').split(',')
})
const reloader = ref(0)
function add() {
  const newEntity = makeDefaultEntity(props.quote)
  state.items.push(newEntity)
}
function remove(index) {
  state.items.splice(index, 1)
  reloader.value += 1
  emit('update:modelValue', state.items
  .filter((i, idx) => idx !== state.items.length - 1))
}
appStore.getList('rates')
const emit = defineEmits(['update:modelValue'])
const rowRefs = reactive([]);
function getRowRef(el, index) {
  rowRefs[index] = el;
}
let updateTimeout = null
function onUpdate() {
  clearTimeout(updateTimeout)
  updateTimeout = setTimeout(() => {
    const lastElement = state.items[state.items.length - 1]
    if(!lastElement) return
    if(lastElement.chargeType === null
      && lastElement.charge === null
      && lastElement.calculationType === null
      && lastElement.description === null
      && lastElement.quantity === null
    ) {
      console.log('you are updating it here', JSON.parse(JSON.stringify(toRaw(state.items))))
      const items = state.items
        .filter((i, idx) => idx !== state.items.length - 1)
      emit('update:modelValue', items)
    } else {
      console.log('you are adding')
      add()
    }
  }, 800)
}
function onChargeTypeChanged(entity, columns, value) {
  entity.charge = null
  entity.chargeName = null
  entity.calculationType = null
  entity.description = null
}
function onChargeNameChanged(entity, columns, value) {
  console.log(value)
  if(value.id) {
    entity.charge = value
    console.log('value calType', entity, value)
    // calculate quantity
    
    if(value.calculationType) {
      let quantity = 0
      // for CBM or KGS
      if(['by_kgs', 'by_p_45', 'by_p_100', 'by_p_300', 'by_p_500', 'by_min', 'by_normal']
          .includes(value.calculationType.code)) {
        // chargeableWeight
        quantity = props.quote.cargoVolume?.chargeableWeight ?? 0
      }
      
      if(value.calculationType.code === 'by_cbm') {
        // chargeableWeight
        quantity = props.quote.cargoVolume.totalCBM
      }
      if(value.calculationType.code === 'by_shipment') {
        quantity = 1
      }
      // for container type
      if(value.calculationType.code.startsWith('by_container_type_')) {
        const contCode = value.calculationType.code.replace('by_container_type_', '')
        const container = props.quote.cargoVolume.items.find(({value}) => value === contCode)
        if(container) {
          quantity = container.amount
        }
      }
      entity.quantity = quantity
    }
    // for origin charge AWB
    if(value.customCalcType === 'By Shipment') {
      entity.quantity = 1
    }
    if(value.customCode === 'XRAY' ) { 
      entity.quantity = props.quote.cargoVolume?.chargeableWeight ?? 0
    }
    entity.calculationType = entity.charge.calculationType?.name ?? entity.charge.customCalcType
    if(entity.charge.description) {
      entity.description = entity.charge.description
    }
    entity.chargeName = value.name

    // apply rate if available
    console.log('start apply rate')
    const rate = appStore.getList('rates').find(rate => {
      const isLocalChargeTypeMatch = 
              !rate.localChargeType 
              || (rate.localChargeType === 'O' 
                  && entity.chargeType === 'OC'
                  )
              || (rate.localChargeType === 'D' 
                  && entity.chargeType === 'DC'
                  )
      const isLocalChargePortMatch = 
              !rate.localChargeType 
              || (rate.localChargeType === 'O' 
                  && props.quote.originPort
                  && rate.localChargePort.id === props.quote.originPort.id
                )
              || (rate.localChargeType === 'D' 
                  && props.quote.destinationPort
                  && rate.localChargePort.id === props.quote.destinationPort.id
                )
      const isProviderMatch = 
              !rate.provider 
              || (rate.provider.id === entity.provider.id)
      const now = dateAdapter.date()
      
      const isValidDate = 
              (!rate.validFrom || now.isAfter(dateAdapter.date(rate.validFrom)))
              && now.isBefore(dateAdapter.date(rate.validUntil))
      return rate.charge.id === entity.charge.id
              && isLocalChargeTypeMatch
              && isLocalChargePortMatch
              && isProviderMatch
              && isValidDate
    })
    // you have rate here, please apply pricing
    if(rate) {
      console.log('you found a rate that can be applied to price here', rate)
      if(rate.buying.amount)
        entity.buying = JSON.parse(JSON.stringify(rate.buying))
      if(rate.selling.amount)
        entity.selling = JSON.parse(JSON.stringify(rate.selling))
    }
  } else {
    entity.charge = 'isEmpty'
  }
  
}

const profit = computed(() => {
  const dummy = reloader.value
  const profit = {
    buying: 0,
    selling: 0,
    profit: 0,
    exchangeRates: {},
    subTotal: getSubTotal(state.items)
  }
  const currentRate = appStore.exchangeRatesConfig
  if(!currentRate) return profit
  Object.keys(profit.subTotal).forEach(currency => {
    const subTotal = profit.subTotal[currency]
    const rate = props.quote.exchangeRates.hasOwnProperty(currency) 
                  ? 1*props.quote.exchangeRates[currency] 
                  : getCurrencyRate(currentRate.exchangeRates, currency)
    profit.buying += subTotal.buying / rate
    profit.selling += subTotal.selling / rate
    profit.exchangeRates[currency] = rate
  })
  profit.profit = profit.selling - profit.buying
  return profit
})
watch(() => props.quote.exchangeRates, () => {
  reloader.value += 1
}, {
  deep: true
})
function validate() {
  console.log('you called me ??')
  let valid = true
  rowRefs.forEach(rowRef => {
    if(!rowRef) return
    if(!rowRef.form.doValidate()) {
      valid = false;
      return
    }
  })
  return {
    valid,
    errors: [
      {'id': 'quotePrices'}
    ]
  }
}
defineExpose({
  validate
})
const [dragging, toggleDragging] = useToggle()
function onPosition(items) {
  let position = 1
  items.forEach(item => {
    if(item.charge || item.chargeName) {
      item.position = position
      position++
    }
  })
  emit('update:modelValue', items)
}
function getItemIndex(item) {
  const prop = item.id ? 'id' : 'tempId'
  return state.items.findIndex(i => item[prop] === i[prop])
}
function isInputRequired(input) {
    if (input.rules === undefined)
        return false;
    const { required } = CommonService.rules();
    return input.rules.some(rule => rule.toString() === required.toString());
}
const [draggingHeader, toggleDraggingHeader] = useToggle()
const computedHeaders = computed(() => {
  const coreConfigs = layout(
      {chargeType: 'dummy', quote: {transportType: 'dummy'}},
      {headerPositions: state.headerPositions}
    )[0][0]
    .map(config => {
      const {name, text, groupedWidth, rules, groupedInputsLabelClass} = config
      return {name, text, groupedWidth, rules, groupedInputsLabelClass}
    })
  return coreConfigs.sort((a, b) => {
    const aPosition = state.headerPositions.findIndex(pos => pos === a.name)
    const bPosition = state.headerPositions.findIndex(pos => pos === b.name)
    if(aPosition !== -1 && bPosition !== -1) return aPosition - bPosition
    if(aPosition !== -1 && bPosition === -1) return -1
    if(aPosition === -1 && bPosition !== -1) return 1
    return 0
  })
})
async function onPositionHeader(items) {
  const headerPositions = []
  items.forEach(item => {
    headerPositions.push(item.name)
  })
  state.headerPositions = headerPositions
  useAuthStore().saveTableConfig('columns', headerPositions, {fullPath: 'priceDetails'})
}
</script>
<template>
<div id="quotePrices">
<div class="dragger pt-2" style=" display: grid; overflow-x: scroll;">
  <VRow class="ps-5 pe-10">
    <Draggable
      class="list-group v-col groupedInputs scrollable"
      tag="div"
      :component-data="{
        type: 'transition-group',
        name: !draggingHeader ? 'flip-list' : null
      }"
      :modelValue="computedHeaders"
      @update:modelValue="onPositionHeader($event)"
      v-bind="{
          animation: 200,
          group: 'description',
          disabled: false,
          ghostClass: 'ghost'
        }"
      @start="toggleDraggingHeader(true)"
      @end="toggleDraggingHeader(false)"
      :itemKey="(item) => item.name + item.text"
    >
      <template #item="{ element: headerConfig , index }">
        <VRow 
          :style="{'width': headerConfig.groupedWidth}" 
          class="v-row flex-grow-0">
          <VCol 
            class="text-body-2 text-high-emphasis" 
            :class="headerConfig.groupedInputsLabelClass"
          >
            <span class="pb-1">
              {{ headerConfig.text }}
              <span v-if="isInputRequired(headerConfig)" class="text-error">&nbsp;*</span>
            </span>
          </VCol>
        </VRow>
      </template>
    </Draggable>
  </VRow>
  <Draggable
    class="list-group"
    :component-data="{
      tag: 'div',
      type: 'transition-group',
      name: !dragging ? 'flip-list' : null
    }"
    :modelValue="state.items.sort((a, b) => {
      if(!a.id && !a.position) return 1
      if(a.position || b.position) {
        return (a.position ?? 999) - (b.position ?? 999)
      }
      return (a.id ?? 0) - (b.id ?? 0)
    })"
    @update:modelValue="onPosition($event)"
    v-bind="{
        animation: 200,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost'
      }"
    @start="toggleDragging(true)"
    @end="toggleDragging(false)"
    :itemKey="(item) => item.id ?? item.tempId"
    handle=".handle"
  >
    <template #item="{ element, index }">
      <div class="list-group-item" :key="element">
        <div class="handle" 
          v-if="index < state.items.length -1"
        >
          <VIcon icon="tabler-menu-2" size="13"></VIcon>
        </div>
        <SubForm 
          v-model="state.items[getItemIndex(element)]"
          :layout="layout"
          :makeDefaultEntity="makeDefaultEntity"
          @update:modelValue="onUpdate"
          :inputCallBack="{
            chargeType: onChargeTypeChanged,
            chargeName: onChargeNameChanged
          }"
          :fullWidth="false"
          :ref="(el) => getRowRef(el, index)"
          :turnOffAllTitle="true"
          class="ps-4"
          :context="{headerPositions: state.headerPositions}"
          style="margin-block-start: -1px;"
        >
        </SubForm>
        <VBtn 
          @click="remove(getItemIndex(element))"
          variant="text" size="40" 
          class="mt-n10 mb-0 stickyRemoveBtn" color="warning" 
          v-if="index !== state.items.length - 1"
        >
          <VIcon icon="tabler-trash" size="20"></VIcon>
        </VBtn>
        <VBtn 
          variant="text" size="40" 
          class="mt-n10 mb-0 stickyRemoveBtn" color="warning"
          v-else
        >
          &nbsp;
        </VBtn>
      </div>
    </template>
  </Draggable>
</div>
<div class="mt-2" style="max-inline-size: 1406px;">
  <div class="d-flex flex-row mb-2">
    <VSpacer />
    <div></div>
    <div></div>
    <div style="inline-size:115px;" class="text-right">{{ $gettext('Buying') }}</div>
    <div style="inline-size:108px;" class="text-right">{{ $gettext('Selling') }}</div>
    <div style="inline-size:35px;">&nbsp;</div>
  </div>
  <div 
    class="d-flex flex-row" 
    v-for="(currency, idx) in Object.keys(profit.subTotal)"
  >
    <VSpacer />
    <div class="pe-4" v-if="idx === 0">
      {{ $gettext('Sub-total') }}
    </div>
    <div class="pe-4">{{ currency }}</div>
    <div style="inline-size:115px;" class="text-right">
      {{ profit.subTotal[currency].buying.toMoneyFormat(currency) }}
    </div>
    <div style="inline-size:108px;" class="text-right">
      {{ profit.subTotal[currency].selling.toMoneyFormat(currency) }}
    </div>
    <div style="inline-size:35px;">&nbsp;</div>
  </div>
</div>
<div class="v-col pb-2 text-secondary text-uppercase text-h6 form-legend ms-n3 mb-2">
  {{ $gettext('Profit Calculation') }}
</div>
<v-sheet border class="py-4">
  <VRow>
    <VCol class="text-center text-h5">
      <div class="font-weight-medium">{{ $gettext('Total Buying') }}</div>
      <div class="text-error font-weight-bold">{{ profit.buying.toMoneyFormat('USD') }}</div>
    </VCol>
    <VCol class="text-center text-h5 ">
      <div class="font-weight-medium">{{ $gettext('Total Selling') }}</div>
      <div class="font-weight-bold">{{ profit.selling.toMoneyFormat('USD') }}</div>
    </VCol>
      
    <VCol class="text-center text-h5">
      <div class="font-weight-medium">{{ $gettext('Total Profit') }}</div>
      <div class="text-success font-weight-bold">{{ profit.profit.toMoneyFormat('USD') }}</div>
    </VCol>
  </VRow>
</v-sheet>
</div>
</template>
<style type="scss">
.priceDetail {
  .removeBtn {
    position:sticky;
    border-radius: 0;
    background: white; 
    inset-inline-end: -20px;
    margin-block: 0;
  }
}

</style>
