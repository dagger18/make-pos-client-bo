<script setup>
import { getList as getChargeTypes } from '@/config/enums/PriceDetailChargeType';
import { enums as ShipmentType } from '@/config/enums/ShipmentType';
import { valueToVolumeType } from '@/config/enums/TransportType';
import { layout, makeDefaultEntity } from '@/config/forms/quote/Quote';
import { getCurrencyRate, getSubTotal, printPort, transformArray, transformObject, transformPreSubmit } from '@/services/CommonService';
// QuoteService removed - freight-specific service
const EntityService = null;
import ClientService from '@/services/ClientService';
import { useAppStore } from '@/stores/appStore';
import { $gettext } from '@/utils/api';
const appStore = useAppStore()
const props = defineProps({
  currentTransportType: { type: String, default: '' },
  inlineForm: { type: Boolean, default: false },
  makeShipment: { type: Boolean, default: false },
  isSaveable: { type: Boolean, default: true },
  layout: { type: Function, default: layout },
  submitBtnSaveText: { type: String, default: $gettext('Save') },
  entityName: { type: String, default: $gettext('Quote') },
  context: { type: Object, default: () => {} },
})
const form = ref(null)
const creditCheckResult = ref(null)
const creditCheckDialog = ref(false)
const creditApproved = ref(false)
const router = useRouter()
let entityId = null
let preEntityUrl = null
function entityPreForm (entity) {
  if(!entity.transportType) {
    entity.transportType = props.currentTransportType === 'all' ? 'AIR' : props.currentTransportType
  }
  if(!entity.cargoVolumeType) {
    entity.cargoVolumeType = valueToVolumeType(entity.transportType, entity.serviceType)
  }
  if(!entity.shipmentType) entity.shipmentType = ShipmentType.Export
  console.log('entityPreForm', JSON.parse(JSON.stringify(toRaw(entity))))
  return entity
}
async function entityPreSubmit (reactedAntity) {
  let entity = JSON.parse(JSON.stringify(reactedAntity))

  // Credit check gate (new quotes only)
  if (!reactedAntity.id && creditCheckResult.value) {
    const decision = creditCheckResult.value.decision
    if (decision === 'HARD_BLOCK') {
      creditCheckDialog.value = true
      return null
    }
    if (decision === 'REQUIRE_APPROVAL' && !creditApproved.value) {
      creditCheckDialog.value = true
      return null
    }
  }

  console.log('start presubmit', JSON.parse(JSON.stringify(entity)))
  transformPreSubmit(entity)
  console.log('after transform', JSON.parse(JSON.stringify(entity)))
  const chargeTypes = getChargeTypes(entity.transportType)
  if (entity.prices && entity.prices.length > 0) {
    entity.prices.forEach((price, pDIdx) => {
      const theChargeType = chargeTypes.find(({value}) => value === price.chargeType)
      if(theChargeType) {
        price.chargeTypeName = theChargeType.title
      }
      if(price.provider) {
        price.providerName = price.provider.name
      } else {
        price.providerName = ''
      }
      price.clientName = price.client ? price.client.name : '...'
      if (price.buying && price.buying.amount) {
        price.amountBuying = {
          currency: price.buying.currency,
          amount: price.buying.amount * price.quantity,
          rate: price.buying.rate
        }
      } else {
        price.amountBuying = {
          currency: price.buying?.currency ?? appStore.exchangeRatesConfig.currency.code,
          amount: null,
          rate: price.buying?.rate ?? entity.exchangeRates[appStore.exchangeRatesConfig.currency.code]
        }
        price.buying = {
          currency: price.buying?.currency ?? appStore.exchangeRatesConfig.currency.code,
          amount: null,
          rate: price.buying?.rate ?? entity.exchangeRates[appStore.exchangeRatesConfig.currency.code]
        }
      }
      if (price.selling && price.selling.amount) {
        price.amountSelling = {
          currency: price.selling.currency,
          amount: price.selling.amount * price.quantity,
          rate: price.selling.rate
        }
      } else {
        price.amountSelling = {
          currency: price.selling?.currency ?? appStore.exchangeRatesConfig.currency.code,
          amount: null,
          rate: price.selling?.rate ?? entity.exchangeRates[appStore.exchangeRatesConfig.currency.code]
        }
        price.selling = {
          currency: price.selling?.currency ?? appStore.exchangeRatesConfig.currency.code,
          amount: null,
          rate: price.selling?.rate ?? entity.exchangeRates[appStore.exchangeRatesConfig.currency.code]
        }
      }
      delete entity.prices[pDIdx].quote
      if(!entity.prices[pDIdx].position) delete entity.prices[pDIdx].position
    })
    transformArray(entity, 'prices')
  }
  
  if (entity.cargoVolume) {
    transformObject(entity, 'cargoVolume')
  }
  if (entity.subTotal) {
    transformObject(entity, 'subTotal')
  }
  if(!entity.subDestinationPort) {
    entity.subDestinationPort = ''
  }
  if(!entity.subOriginPort) {
    entity.subOriginPort = ''
  }
  console.log('final object', JSON.parse(JSON.stringify(entity)))
  if(props.makeShipment) {
    entity.makeShipment = true
  }
  return entity
}
function onTransportTypeChanged(entity, columns, value) {
  entity.serviceType = null
  entity.cargoVolume = null
  entity.cargoVolumeType = valueToVolumeType(value)
  entity.prices = []
}
function onServiceTypeChanged(entity, columns, value) {
  entity.cargoVolume = null
  entity.cargoVolumeType = valueToVolumeType(entity.transportType, value)
}
function onCargoVolumeTypeChanged(entity, columns, value) {
  console.log('onCargoVolumeTypeChanged, so i set null')
  entity.cargoVolume = null
}
function onExchangeRatesChanged(entity, columns, value) {
  console.log('exchangeRate changed', entity.exchangeRates)
  entity.prices.forEach(price => {
    ['buying', 'selling', 'amountBuying', 'amountSelling'].forEach(key => {
      if(price[key]) {
        price[key].rate = entity.exchangeRates[price[key].currency]*1
      }
    })
  })
}
function onOriginPortChanged(entity, columns, value) {
  entity.originDoor = printPort(entity.originPort)
}
function onDestinationPortChanged(entity, columns, value) {
  entity.destinationDoor = printPort(entity.destinationPort)
}
function onPricesChanged(entity, columns, value) {
  console.log('should check for rates here')
  const profit = {
    buying: 0,
    selling: 0,
    profit: 0,
    exchangeRates: {},
    subTotal: getSubTotal(entity.prices)
  }
  const currentRate = useAppStore()
    .exchangeRatesConfig
    // todo: check for racing condition here
  if(currentRate) {
    Object.keys(profit.subTotal).forEach(currency => {
      const subTotal = profit.subTotal[currency]
      const rate = entity.exchangeRates.hasOwnProperty(currency) 
                  ? (1*entity.exchangeRates[currency])
                  : getCurrencyRate(currentRate.exchangeRates, currency)
      profit.buying += subTotal.buying / rate
      profit.selling += subTotal.selling / rate
      profit.exchangeRates[currency] = rate
    })
    // one important thing here, you check if quoteCurrency is not in the profit.exchangeRates, then you need to add to it (using current exchangeRate from appStore), otherwise it will be lost when saving
    if(entity.quoteCurrency && !profit.exchangeRates.hasOwnProperty(entity.quoteCurrency)) {
      profit.exchangeRates[entity.quoteCurrency] = getCurrencyRate(currentRate.exchangeRates, entity.quoteCurrency)
    }
    entity.totalSelling = profit.selling.round(2)
    entity.totalBuying = profit.buying.round(2)
    entity.totalProfit = (profit.selling - profit.buying).round(2)
    if(JSON.stringify(profit.exchangeRates) !== JSON.stringify(entity.exchangeRates)) {
      console.log('profit.exchangeRates', profit.exchangeRates)
      entity.exchangeRates = profit.exchangeRates
    }
    if(JSON.stringify(profit.subTotal) !== JSON.stringify(entity.subTotal)) {
      console.log('profit.subTotal', profit.subTotal)
      entity.subTotal = profit.subTotal
    }
    console.log('entity', entity)
  }
}
function confirmCreditOverride() {
  creditApproved.value = true
  creditCheckDialog.value = false
  form.value.submit()
}
async function onClientChanged(entity, columns, value) {
  creditApproved.value = false
  creditCheckResult.value = null
  if (value?.id) {
    try {
      creditCheckResult.value = await ClientService.getCreditCheck(value.id)
    } catch (e) {
      // ignore
    }
  }
}
function setEntity(entity = null) {
  if(entity && entity.id && !props.inlineForm) {
    console.log(entity.id, 'why not update')
    document.querySelector('html').classList.add('overflow-y-hidden');
    preEntityUrl = window.location.pathname + window.location.search + window.location.hash
    history.pushState(
      {},
      null,
      router.resolve({ name: 'quote-update-id', params: { id: entity.id } }).href
    )
    entityId = entity.id
  }
  form.value.setEntity(entity)
}
defineExpose({
  setEntity
})
const emit = defineEmits(['entitySubmitted', 'formClosed', 'closed'])
function entitySubmitted(data) {
  emit('entitySubmitted', data)
  if(entityId && !props.inlineForm) {
    router.push({name: 'quote-preview-id', params: {id: entityId}})
  }
}
function onFormClosed() {
  if(preEntityUrl) {
    history.replaceState({}, null, preEntityUrl)
    preEntityUrl = null
  }
  if(entityId && !props.inlineForm) {
    emit('closed', {name: 'quote-preview-id', params: {id: entityId}})
  }
}
</script>
<template>
  <AppForm
    :isDialog="!inlineForm"
    :layout="props.layout"
    :entityName="entityName"
    :isSaveable="isSaveable"
    :makeDefaultEntity="makeDefaultEntity"
    :entityPreForm="entityPreForm"
    :entityPreSubmit="entityPreSubmit"
    :service="EntityService"
    ref="form" :width="'800px'"
    @formClosed="onFormClosed"
    @entitySubmitted="entitySubmitted"
    :inputCallBack="{
      'transportType': onTransportTypeChanged,
      'serviceType': onServiceTypeChanged,
      'cargoVolumeType': onCargoVolumeTypeChanged,
      'exchangeRates': onExchangeRatesChanged,
      'originPort': onOriginPortChanged,
      'destinationPort': onDestinationPortChanged,
      'prices': onPricesChanged,
      'client': onClientChanged,
    }"
    :submitBtnSaveText="submitBtnSaveText"
    :context="context"
  />

  <!-- Credit Check Dialog -->
  <VDialog v-model="creditCheckDialog" max-width="480" persistent>
    <VCard>
      <VCardTitle class="d-flex align-center gap-2 pa-4">
        <VIcon
          :icon="creditCheckResult?.decision === 'HARD_BLOCK' ? 'tabler-lock' : 'tabler-alert-triangle'"
          :color="creditCheckResult?.decision === 'HARD_BLOCK' ? 'error' : 'warning'"
          size="28"
        />
        <span>
          {{ creditCheckResult?.decision === 'HARD_BLOCK' ? $gettext('Credit Blocked') : $gettext('Credit Limit Exceeded') }}
        </span>
      </VCardTitle>
      <VCardText>
        <p class="mb-3">{{ creditCheckResult?.reason }}</p>
        <template v-if="creditCheckResult?.limit">
          <VList density="compact" class="pa-0">
            <VListItem>
              <VListItemTitle>{{ $gettext('Outstanding Exposure') }}</VListItemTitle>
              <template #append>
                <strong>{{ creditCheckResult.currency }} {{ Number(creditCheckResult.exposure).toLocaleString() }}</strong>
              </template>
            </VListItem>
            <VListItem>
              <VListItemTitle>{{ $gettext('Credit Limit') }}</VListItemTitle>
              <template #append>
                <strong>{{ creditCheckResult.currency }} {{ Number(creditCheckResult.limit).toLocaleString() }}</strong>
              </template>
            </VListItem>
            <VListItem>
              <VListItemTitle>{{ $gettext('Utilisation') }}</VListItemTitle>
              <template #append>
                <strong class="text-error">{{ creditCheckResult.utilisation }}%</strong>
              </template>
            </VListItem>
          </VList>
        </template>
      </VCardText>
      <VCardActions class="justify-end pa-4 gap-2">
        <VBtn variant="tonal" @click="creditCheckDialog = false">
          {{ $gettext('Cancel') }}
        </VBtn>
        <VBtn
          v-if="creditCheckResult?.decision === 'REQUIRE_APPROVAL'"
          color="warning"
          @click="confirmCreditOverride"
        >
          {{ $gettext('Proceed Anyway') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
