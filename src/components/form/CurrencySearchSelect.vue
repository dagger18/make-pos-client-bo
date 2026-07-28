<script setup>
import GoodSearchSelect from './GoodSearchSelect.vue'
import CurrencyService from '@/services/CurrencyService'

const props = defineProps({
  modelValue: {},
  callParams: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue'])

let session = createSession()

function createSession() {
  return {
    q: null,
    localExhausted: false,
    localLastPage: 0,
    shownLocalIds: [],
    masterOffset: 0,
  }
}

function parseQ(params) {
  for (const [key, val] of new URLSearchParams(params).entries()) {
    if (/^filters\[\d+\]\[2\]$/.test(key)) return val
  }
  return ''
}

const combinedEndpoint = {
  listCacheable: async (params) => {
    const urlParams = new URLSearchParams(params)
    const page = parseInt(urlParams.get('page') ?? '1')
    const limit = parseInt(urlParams.get('limit') ?? '20')
    const q = parseQ(params)

    if (page === 1 || q !== session.q) {
      session = createSession()
      session.q = q
    }

    // --- Local phase ---
    if (!session.localExhausted) {
      const localResult = await CurrencyService.listCacheable(params)
      const localList = localResult.list ?? []

      localList.forEach(c => {
        if (!session.shownLocalIds.includes(c.id)) session.shownLocalIds.push(c.id)
      })

      const isLastLocalPage = (localResult.currentPage ?? page) >= (localResult.totalPages ?? 1)

      if (isLastLocalPage) {
        session.localExhausted = true
        session.localLastPage = page
        session.masterOffset = 0

        const fill = limit - localList.length
        try {
          const masterResult = await $api('currency/master-search', {
            params: {
              q,
              limit: fill > 0 ? fill + limit : limit,
              offset: 0,
              excludeIds: session.shownLocalIds.join(','),
            },
          })
          const masterRaw = masterResult?.list ?? []
          const fillList = masterRaw.slice(0, fill > 0 ? fill : 0).map(c => ({ ...c, _fromMaster: true }))
          session.masterOffset = fillList.length

          const masterHasMore = masterRaw.length > fillList.length
          return {
            ...localResult,
            list: [...localList, ...fillList],
            currentPage: page,
            totalPages: masterHasMore ? page + 1 : page,
          }
        } catch {
          return localResult
        }
      }

      return localResult
    }

    // --- Master phase ---
    try {
      const masterResult = await $api('currency/master-search', {
        params: {
          q,
          limit,
          offset: session.masterOffset,
          excludeIds: session.shownLocalIds.join(','),
        },
      })
      const masterList = (masterResult?.list ?? []).map(c => ({ ...c, _fromMaster: true }))
      session.masterOffset += masterList.length

      const hasMore = masterList.length >= limit
      return {
        list: masterList,
        currentPage: page,
        totalPages: hasMore ? page + 1 : page,
      }
    } catch {
      return { list: [], currentPage: page, totalPages: page }
    }
  },
}

async function onSelect(currency) {
  if (!currency) {
    emit('update:modelValue', null)
    return
  }
  if (currency._fromMaster) {
    try {
      await $api('currency/save-from-master', {
        method: 'POST',
        body: { id: currency.id, name: currency.name, symbol: currency.symbol, code: currency.code, rate: currency.rate, thousandSeparator: currency.thousandSeparator, decimalSeparator: currency.decimalSeparator, decimalPlaces: currency.decimalPlaces },
      })
    } catch {}
    const { _fromMaster, ...clean } = currency
    emit('update:modelValue', clean)
  } else {
    emit('update:modelValue', currency)
  }
}
</script>
<template>
  <GoodSearchSelect
    v-bind="$attrs"
    :modelValue="modelValue"
    :callParams="callParams"
    :apiEndpoint="combinedEndpoint"
    :searchCriterias="[{ property: 'name,code', operator: 'like' }]"
    :lazyLoad="true"
    @update:modelValue="onSelect"
    :showXOnSelected="false"
  />
</template>
