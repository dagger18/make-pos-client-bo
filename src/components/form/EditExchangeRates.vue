<script setup>
import { convertMoney, isCurrencyZeroDecimal } from '@/services/CommonService';
import { watch } from 'vue';
const props = defineProps({
  modelValue: {type: Object, default: () => {}},
  toCurrency: {
    type: String, 
    default: 'USD',
  },
  popupModalOnly: {type: Boolean, default: false},
  saveableInitState: {type: Boolean, default: false},
  attach: {},
})
const [saveable, toggleSaveable] = useToggle(props.saveableInitState)
const [menu, toggleMenu] = useToggle()
let exchangeRateMap = reactive(JSON.parse(JSON.stringify({
                            ...(props.modelValue ?? {}),
                            USD: 1
                          }
                        )
                      )
                    )
const emit = defineEmits(['update:modelValue'])
function save () {
  emit('update:modelValue', exchangeRateMap)
  toggleMenu(false)
}
watch(() => props.modelValue, () => {
  console.log('exchangeRateMap changed')
  exchangeRateMap = reactive(JSON.parse(JSON.stringify({
                            ...(props.modelValue ?? {}),
                            USD: 1
                          }
                        )
                      )
                    )
}, {
  deep: true
})
const updateTimeoutMap = {}
function onUpdateRateOfCurrencyToQuoteCurrency(currency, rateCurrencyToCurrency) {
  toggleSaveable(false)
  if(updateTimeoutMap.hasOwnProperty(currency)) {
    clearTimeout(updateTimeoutMap[currency])
  }
  updateTimeoutMap[currency] = setTimeout(() => {
    console.log('update exchange rate of', currency, 'to quoteCurrency', props.toCurrency, 'with rateCurrencyToCurrency', rateCurrencyToCurrency)
    toggleSaveable(true)
    if(currency === 'USD') {
      exchangeRateMap[props.toCurrency] = rateCurrencyToCurrency ?? 0
      return
    }
    exchangeRateMap[currency] = rateCurrencyToCurrency
      ? exchangeRateMap[props.toCurrency] / rateCurrencyToCurrency
      : 0
  }, 800)
}
defineExpose({toggleMenu})
</script>
<template>
<div> 
  <div v-if="!popupModalOnly" class="font-italic mt-2">{{ $gettext('Exchange rate') }}: 
    <template 
      v-for="currency in Object.keys(exchangeRateMap)"
    >
      <span v-if="currency !== toCurrency">
        1 {{ currency }} =
        {{ 
          convertMoney(
            {
              amount: 1, rate: exchangeRateMap[currency]
            }, 
            exchangeRateMap[toCurrency]
          ).toMoneyFormat(toCurrency, false) 
        }}
        {{ toCurrency }};
      </span>
    </template>
  </div>
  
  <VMenu
    v-model="menu"
    location="top" 
    :close-on-content-click="false"
    :attach="props.attach"
    width="400" scrim
  >
    <template v-if="!popupModalOnly" #activator="{ props }">
      <VBtn v-bind="props" density="compact" variant="text" class="ps-0 pe-2 text-body-2" >
        <VIcon icon="tabler-pencil-dollar" class="me-2"/><i>{{ $gettext('Edit Exchange Rates') }}</i>
      </VBtn>
    </template>

    <VCard max-width="320">
      <VCardText>
        <div v-for="(rate, currency) in exchangeRateMap">
          <div class="d-flex align-center" v-if="currency !== toCurrency">
            1 {{ currency }} =
            <VTextField 
              class="mx-2" type="number"
              :modelValue="(convertMoney(
                            {
                              amount: 1, rate: exchangeRateMap[currency]
                            }, 
                            exchangeRateMap[toCurrency]
                          )).round(isCurrencyZeroDecimal(toCurrency) ? 0 : 7)"
              @update:modelValue="onUpdateRateOfCurrencyToQuoteCurrency(currency, $event)"
              />
            {{ toCurrency }}
          </div>
        </div>
      </VCardText>
      <VCardActions>
        <VBtn 
          variant="elevated" color="primary" 
          :disabled="!saveable"
          @click="save"
        >{{ $gettext('Save') }}</VBtn>
      </VCardActions>
    </VCard>
  </VMenu>
</div>
</template>
