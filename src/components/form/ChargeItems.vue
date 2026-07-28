<script setup>
import { enums as EbitNoteType } from '@/config/enums/EbitNoteType';
import { getList as getChargeTypes } from '@/config/enums/PriceDetailChargeType';
import { layout, makeDefaultEntity } from '@/config/forms/shipment/ChargeItem';
import CommonService, { chargeTaxToTaxGroup, recalculateChargeItemPrice } from '@/services/CommonService';
import { useAuthStore } from '@/stores/authStore';
const user = useAuthStore().user
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  // context here should be shipment
  context: { type: Object, default: () => {}}
})

const state = reactive({
  items: props.modelValue.concat([makeDefaultEntity()]),
  headerPositions: (user.tableConfig?.chargeItems?.columns ?? '').split(',')
})
const reloader = ref(0)
function add() {
  const newEntity = makeDefaultEntity()
  state.items.push(newEntity)
}
function remove(index) {
  state.items.splice(index, 1)
  reloader.value += 1
  emit('update:modelValue', state.items
  .filter((i, idx) => idx !== state.items.length - 1))
}
const rowRefs = reactive([]);
function getRowRef(el, index) {
  rowRefs[index] = el;
}

const emit = defineEmits(['update:modelValue'])
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
  const chargeTypes = getChargeTypes(props.context.quote.transportType)
  entity.chargeTypeName = chargeTypes.find(({value}) => value === entity.chargeType).title
  entity.charge = null
  entity.chargeName = null
  entity.calculationType = null
  entity.description = null
}
function onChargeNameChanged(entity, columns, value) {
  if(value.id) {
    entity.charge = value

    if(entity.charge.calculationType) {
      entity.calculationType = entity.charge.calculationType.name
    }
    if(entity.charge.description) {
      entity.description = entity.charge.description
    }
    if(
      props.context.ebitNoteType === EbitNoteType.Debit
      || props.context.ebitNoteType === EbitNoteType.COBO
    ) {
      const taxGroup = chargeTaxToTaxGroup(entity.charge.debitTax ?? 0)
      entity.taxGroup = taxGroup
    }
    if(props.context.ebitNoteType === EbitNoteType.Credit
    || props.context.ebitNoteType === EbitNoteType.POBO
    ) {
      const taxGroup = chargeTaxToTaxGroup(entity.charge.creditTax ?? 0)
      entity.taxGroup = taxGroup
    }
    entity.chargeName = value.name
  } else {
    entity.charge = 'isEmpty'
  }
  
}
// recalculate amount and tax
function onQuantityChanged(entity, columns, value) {
  recalculateChargeItemPrice(entity,props.context)
}
// recalculate charge price, amount and tax
function onPriceChanged(entity, columns, value) {
  recalculateChargeItemPrice(entity,props.context)
}
function onTaxGroupChanged(entity, columns, value) {
  const currencyRate = props.context.exchangeRates[props.context.currency]
  entity.tax = {
    amount: (entity.amount.amount * (entity.taxGroup.amount / 100)).round(props.context.moneyScale),
    currency: props.context.currency,
    rate: currencyRate
  }
}
watch(() => props.context.currency, () => {
  console.log('currency changed')
  state.items = (props.modelValue && props.modelValue.length > 0 ? props.modelValue : []).concat([makeDefaultEntity()])
})
watch(() => props.modelValue, (newValue, oldValue) => {
  if(JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
    state.items = (props.modelValue && props.modelValue.length > 0 ? props.modelValue : []).concat([makeDefaultEntity()])
    reloader.value += 1
  }
  
}, {deep: true})
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
  console.log('I update position here')
  let position = 1
  items.forEach(item => {
    if(item.charge || item.chargeName) {
      item.position = position
      position++
    }
  })
  emit('update:modelValue',items
  .filter((i, idx) => idx !== state.items.length - 1))
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
      {chargeType: 'dummy', chargePrice: null},
      {
        headerPositions: state.headerPositions, 
        quote: {transportType: 'dummy'},
        currency: props.context.currency
      }
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
  useAuthStore().saveTableConfig('columns', headerPositions, {fullPath: 'chargeItems'})
}
</script>
<template>
<div id="quotePrices" class="mt-2 chargeItems">
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
              chargeName: onChargeNameChanged,
              price: onPriceChanged,
              quantity: onQuantityChanged,
              taxGroup: onTaxGroupChanged,
            }"
            :fullWidth="false"
            :ref="(el) => getRowRef(el, index)"
            :context="{...context, headerPositions: state.headerPositions}"
            :turnOffAllTitle="true"
            class="ps-4"
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
  <div class="mt-4 mb-2 text-h6" style="max-inline-size: 1250px;">
    <div class="d-flex flex-row pb-1" >
      <VSpacer />
      <div class="pe-4">
        {{ $gettext('Total') }}
      </div>
      <div class="pe-4">{{ context.currency }}</div>
      <div style="inline-size:135px;" class="text-right">
        {{ context.amountNoTax?.amount?.toMoneyFormat(context.amountNoTax.currency, false) }}
      </div>
    </div>
    <div class="d-flex flex-row pb-1" >
      <VSpacer />
      <div class="pe-4">
        {{ $gettext('Tax') }}
      </div>
      <div class="pe-4">{{ context.currency }}</div>
      <div style="inline-size:135px;" class="text-right">
        {{ context.tax?.amount?.toMoneyFormat(context.tax.currency, false) }}
      </div>
    </div>
    <div class="d-flex flex-row pb-1" >
      <VSpacer />
      <div class="pe-4">
        {{ $gettext('Total (Include Tax)') }}
      </div>
      <div class="pe-4">{{ context.currency }}</div>
      <div style="inline-size:135px;" class="text-right">
        {{ context.amount?.amount?.toMoneyFormat(context.amount.currency, false) }}
      </div>
    </div>
  </div>
</div>
</template>
