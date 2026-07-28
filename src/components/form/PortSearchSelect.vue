<script setup>
import GoodSearchSelect from './GoodSearchSelect.vue'
import PortService from '@/services/library/PortService'

const props = defineProps({
  modelValue: {},
  callParams: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue'])

// Session state — reset whenever the search query changes or page resets to 1
let session = createSession()

function createSession() {
  return {
    q: '',
    localExhausted: false,
    localLastPage: 0,   // virtual page number at which local ended
    shownLocalIds: [],  // all local port IDs collected across pages (for master excludeIds)
    masterOffset: 0,    // current offset into master results
  }
}

function parseQ(params) {
  for (const [key, val] of new URLSearchParams(params).entries()) {
    if (/^filters\[\d+\]\[2\]$/.test(key)) return val
  }
  return ''
}

function parsePortTypes(params) {
  return new URLSearchParams(params).get('filter_portTypes_like') ?? undefined
}

const combinedEndpoint = {
  listCacheable: async (params) => {
    const urlParams = new URLSearchParams(params)
    const page = parseInt(urlParams.get('page') ?? '1')
    const limit = parseInt(urlParams.get('limit') ?? '20')
    const q = parseQ(params)
    const portTypes = parsePortTypes(params)

    // Reset session on new search term or first page
    if (page === 1 || q !== session.q) {
      session = createSession()
      session.q = q
    }

    // --- Local phase ---
    if (!session.localExhausted) {
      const localResult = await PortService.listCacheable(params)
      const localList = localResult.list ?? []

      // Accumulate IDs so master can exclude already-shown ports
      localList.forEach(p => {
        if (!session.shownLocalIds.includes(p.id)) session.shownLocalIds.push(p.id)
      })

      const isLastLocalPage = (localResult.currentPage ?? page) >= (localResult.totalPages ?? 1)

      if (isLastLocalPage) {
        session.localExhausted = true
        session.localLastPage = page
        session.masterOffset = 0

        if (!q || q.length < 2) return localResult

        // On last local page: fill remainder from master immediately and inflate
        // totalPages so GoodSearchSelect will scroll if master has even more results.
        const fill = limit - localList.length
        try {
          const masterResult = await $api('port/master-search', {
            params: {
              q,
              limit: fill > 0 ? fill + limit : limit, // fetch a full master page ahead
              offset: 0,
              excludeIds: session.shownLocalIds.join(','),
              ...(portTypes ? { portTypes } : {}),
            },
          })
          const masterRaw = masterResult?.list ?? []
          // Keep only what's needed to fill this page
          const fillList = masterRaw.slice(0, fill > 0 ? fill : 0).map(p => ({ ...p, _fromMaster: true }))
          // The rest are "pre-fetched" — track their offset for the next scroll
          session.masterOffset = fillList.length

          const combined = [...localList, ...fillList]
          // If master returned more than we used, there are more master results
          const masterHasMore = masterRaw.length > fillList.length
          return {
            ...localResult,
            list: combined,
            currentPage: page,
            totalPages: masterHasMore ? page + 1 : page,
          }
        } catch {
          return localResult
        }
      }

      return localResult
    }

    // --- Master phase (scroll beyond last local page) ---
    if (!q || q.length < 2) {
      return { list: [], currentPage: page, totalPages: page }
    }

    try {
      const masterResult = await $api('port/master-search', {
        params: {
          q,
          limit,
          offset: session.masterOffset,
          excludeIds: session.shownLocalIds.join(','),
          ...(portTypes ? { portTypes } : {}),
        },
      })
      const masterList = (masterResult?.list ?? []).map(p => ({ ...p, _fromMaster: true }))
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

async function onSelect(port) {
  if (!port) {
    emit('update:modelValue', null)
    return
  }
  if (port._fromMaster) {
    try {
      await $api('port/save-from-master', {
        method: 'POST',
        body: {
          id: port.id,
          name: port.name,
          code: port.code,
          codeFull: port.codeFull,
          subdiv: port.subdiv,
          location: port.location,
          portTypes: port.portTypes,
        },
      })
    } catch {}
    const { _fromMaster, ...cleanPort } = port
    emit('update:modelValue', cleanPort)
  } else {
    emit('update:modelValue', port)
  }
}
</script>
<template>
  <GoodSearchSelect
    v-bind="$attrs"
    :modelValue="modelValue"
    :callParams="callParams"
    :apiEndpoint="combinedEndpoint"
    hint="Type 3 or more letters to search for a port"
    @update:modelValue="onSelect"
  />
</template>
