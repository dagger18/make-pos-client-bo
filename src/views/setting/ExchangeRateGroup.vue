<script setup>
import { layout, makeDefaultEntity } from '@/config/forms/setting/ExchangeRate';
import { transformArray, transformPreSubmit } from '@/services/CommonService';
import ExchangeRateGroupService from '@/services/ExchangeRateGroupService';
import { useAppStore } from '@/stores/appStore';
import { onMounted } from 'vue';
const props = defineProps({
  initMode: { type: Boolean, default: false }
})
const emit = defineEmits(['saved'])
const appStore = useAppStore()
const state = reactive({
  exchangeRateGroups: []
})
const reloader = ref(0)
const saveBtn = ref(null)
let current = reactive({
  exchangeRates: [], 
  currency: null 
})

onMounted(async () => {
  const exchangeRateGroups = await appStore.fetchList('exchangeRateGroups')
  if(exchangeRateGroups.length > 0) {
    state.exchangeRateGroups = exchangeRateGroups
    const { exchangeRates, currency} = exchangeRateGroups[exchangeRateGroups.length - 1]
    current.exchangeRates = exchangeRates
    current.currency = currency
  }
  reloader.value += 1
})
function initRate(exchangeRate, USDRate) {
  console.log(JSON.parse(JSON.stringify(exchangeRate)))
  const {fromCurrency, toCurrency, rate} = exchangeRate
  let fromRate, toRate = null
  if(fromCurrency.code === 'USD') {
    fromRate = 1
    toRate = rate ?? 1
  }
  else if(toCurrency.code === 'USD') {
    fromRate = rate
    toRate = 1
  } else {
    toRate = USDRate.rate
    fromRate = toRate / rate
  }
  return {fromCurrency, toCurrency, fromRate, toRate, rate}
}
let updateTimeout = null
function onUpdate() {
  clearTimeout(updateTimeout)
  updateTimeout = setTimeout(async () => {
    if(!current.exchangeRates) {
      console.log('nothing here, return')
      return
    }
    const lastElement = current.exchangeRates[current.exchangeRates.length - 1]
    if(!lastElement) return
    if(lastElement.fromCurrency === null
      && lastElement.rate === null
    ) {
      console.log('you are updating it here', JSON.parse(JSON.stringify(toRaw(current.exchangeRates))))
      
      //reloader.value += 1
    } else {
      
      console.log('I add one more', lastElement)
      current.exchangeRates.push(await makeDefaultEntity({defaultCurrency: current.currency}))
    }
  }, 10)
}
function itemSlot (item) {
  return item.code + ' (' + item.symbol + ') - ' + item.name
}
async function doSave() {

  if (!props.initMode) {
    const confirmed = await appStore.confirm.open(
      $gettext('Confirm your action'),
      $gettext('Do you want to save new exchange rate ? We hope you know what you are doing.'),
      { color: 'warning' }
    )
    if (!confirmed) {
      saveBtn.value.disabled = false
      return
    }
  }
  const validRates = current.exchangeRates.filter(
    exchangeRate => 
      exchangeRate.fromCurrency !== null
      && exchangeRate.toCurrency!== null
      && exchangeRate.rate!== null
  )
  if(validRates.length === 0) {
    await appStore.confirm.open(
      $gettext('Confirm your action'),
      $gettext('Error spotted at exchange rate configuration. Please re-check'),
      { color: 'error' }
    )
    saveBtn.value.disabled = false
    return
  }
  const USDRate = validRates.find(rate => rate.fromCurrency.code === 'USD')
  validRates.forEach((exchangeRate, index) => {
    validRates[index] = initRate(exchangeRate, USDRate)
  })
  saveBtn.value.addToQueuingList()
  const entity = { exchangeRates: validRates, currency: current.currency }
  console.log(JSON.parse(JSON.stringify(entity)))
  transformPreSubmit(entity)
  
  console.log(JSON.parse(JSON.stringify(entity)))
  transformArray(entity, 'exchangeRates')
  console.log(JSON.parse(JSON.stringify(entity)))
  const result = await ExchangeRateGroupService.add(entity)
  console.log(result)
  emit('saved')
}
// rework
async function onDefaultCurrencyChanged() {
  // still not init
  if(reloader.value === 0) return
  const USDRow = await makeDefaultEntity({defaultCurrency: current.currency}, 'USD')
  const EmptyRow = await makeDefaultEntity({defaultCurrency: current.currency})
  current.exchangeRates = [
    // default USD row
    USDRow,
    EmptyRow
  ]
  console.log('currency changed, reset exchange rates', JSON.parse(JSON.stringify(current.exchangeRates)))
  reloader.value += 1
}
function remove(index) {
  current.exchangeRates.splice(index, 1)
  reloader.value += 1
}
</script>
<template>
  <VCard :title="$gettext('Exchange Rate')">
    <VCardText v-if="current">
      {{ $gettext('Default currency') }}
      <CurrencySearchSelect
        v-model="current.currency"
        @update:modelValue="onDefaultCurrencyChanged"
        :itemTitle="itemSlot"
      />
      <br>
      <br>
      <div v-if="current.currency">
        <div 
          v-for="(item, index) in current.exchangeRates"  
          :key="index+'-'+reloader"
          class="d-flex mb-1"
        >
          <SubForm 
            v-model="current.exchangeRates[index]"
            :layout="layout"
            :makeDefaultEntity="makeDefaultEntity"
            @update:modelValue="onUpdate"
            :context="{exchangeRates: current.exchangeRates}"
            class="flex-grow-1"
          >
          </SubForm>
          <VBtn 
            @click="remove(index)"
            variant="text" size="40" 
            class="removeBtn" color="warning" 
            v-if="(index !== current.exchangeRates.length - 1) && current.exchangeRates[index].fromCurrency?.code !== 'USD'"
          >
            <VIcon icon="tabler-trash" size="16"></VIcon>
          </VBtn>
          <VBtn 
            variant="text" size="40" 
            class="removeBtn" color="error"
            v-else
          >
            &nbsp;
          </VBtn>
        </div>
      </div>
    </VCardText>
    <VCardActions class="px-4">
      <SubmitBtn
        @click="doSave"
        :title="$gettext('Save')"
        variant="elevated" class="px-4"
        :autoQueue="false"
        ref="saveBtn"
      >
        <VIcon icon="tabler-device-floppy" class="ms-n2 me-2" size="24" />
        {{ $gettext('Save') }}
      </SubmitBtn>
    </VCardActions>
  </VCard>
</template>
