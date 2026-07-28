<script setup>
import { availableCurrencies, getCurrencyRate } from '@/services/CommonService'
import { useAppStore } from '@/stores/appStore'
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: { type: Object, default: () => {} },
  xrateMap: { type: Object, default: () => {} },
  currencyChangeable: { type: Boolean, default: true },
  showCurrencySelect: { type: Boolean, default: true },
  defaultCurrency: { type: String, default: '' }
})
const currency = ref('USD')
const amount = ref()
const rate = ref()
const state = reactive({
  currencies: [],
  currentRate: {}
})

onMounted(async () => {
  state.currentRate = useAppStore().exchangeRatesConfig
  state.currencies = availableCurrencies(state.currentRate.exchangeRates)
  currency.value = props.modelValue?.currency 
                  ?? (props.defaultCurrency === '' 
                      ? state.currentRate.currency.code
                      : props.defaultCurrency
                      )
  amount.value = props.modelValue?.amount ?? null
  rate.value = props.modelValue?.rate 
                ?? props.xrateMap?.[currency.value] 
                ?? getCurrencyRate(state.currentRate.exchangeRates, currency.value)
})
function onAmountChanged(amount) {
  emit(
    'update:modelValue', 
    {
      currency: currency.value, 
      //amount: amount ? useFloat(amount).round(2) : null, 
      amount: amount ?? null, 
      rate: rate.value
    }
  )
}
function onCurrencyChanged(currency) {
  if(!props.modelValue || currency !== props.modelValue.currency) {
    rate.value = props.xrateMap?.[currency] ?? getCurrencyRate(state.currentRate.exchangeRates, currency)
  }
  emit(
    'update:modelValue', 
    {
      currency, 
      amount: amount.value ?? null, 
      rate: rate.value
    }
  )
}

watch(() => props.modelValue, (newValue, oldValue) => {
  console.log(props.modelValue, 'props.modelValue')
  if(props.modelValue.amount !== amount.value) amount.value = props.modelValue.amount
  if(props.modelValue.currency !== currency.value) currency.value = props.modelValue.currency
  if(props.modelValue.rate !== rate.value) rate.value = props.modelValue.rate
}, {
  deep: true
})
watch(() => props.defaultCurrency, (newValue, oldValue) => {
  if(props.defaultCurrency !== currency.value 
    && props.defaultCurrency !== '' 
    && props.currencyChangeable
  ) {
    currency.value = props.defaultCurrency
    rate.value = props.xrateMap?.[currency] ?? getCurrencyRate(state.currentRate.exchangeRates, currency.value)
  }
})
</script>

<template>
  <AppTextField
    class="money-input"
    type="number" min="0"
    :modelValue="amount"
    @update:modelValue="onAmountChanged"
  >
    <template v-if="showCurrencySelect" #append-inner>
      <div class="money-currency-sep" />
      <VMenu :close-on-content-click="true">
        <template #activator="{ props: menuProps }">
          <button
            type="button"
            class="money-currency-btn"
            v-bind="menuProps"
            @click.stop
          >
            {{ currency }}
            <VIcon icon="tabler-chevron-down" size="14" />
          </button>
        </template>
        <VList density="compact" min-width="80">
          <VListItem
            v-for="curr in state.currencies"
            :key="curr"
            @click="onCurrencyChanged(curr); currency = curr"
          >
            {{ curr }}
          </VListItem>
        </VList>
      </VMenu>
    </template>
  </AppTextField>
</template>
<style lang="scss">
.money-input {
  .v-field__append-inner {
    padding-inline-end: 0;
  }

  .money-currency-sep {
    inline-size: 1px;
    align-self: stretch;
    background-color: rgba(var(--v-border-color), var(--v-border-opacity));
    margin-block: 8px;
    margin-inline-start: 6px;
    flex-shrink: 0;
  }

  .money-currency-btn {
    display: flex;
    align-items: center;
    gap: 2px;
    padding-inline: 6px 8px;
    min-inline-size: 60px;
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    font-size: inherit;
    white-space: nowrap;
    height: 100%;
  }
}
</style>
