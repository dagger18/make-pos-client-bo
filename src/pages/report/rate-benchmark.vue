<script setup>
import { useGettext } from 'vue3-gettext'
import RateBenchmarkService from '@/services/RateBenchmarkService'

definePage({ meta: { action: 'GET', subject: 'Quote' } })

const { $gettext } = useGettext()

// ── shared ──────────────────────────────────────────────────────────────────
const tab = ref('buy')
const modeOptions = ['', 'OCN', 'AIR', 'RD', 'RAL', 'COU']
const containerOptions = ['', '20GP', '40GP', '40HC', '45HC']

const fmt = v => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtPct = v => v == null ? '—' : (v > 0 ? '+' : '') + v.toFixed(1) + '%'

// ── buy vs market ────────────────────────────────────────────────────────────
const buyMode      = ref('')
const buyContainer = ref('')
const buyRows      = ref([])
const buyLoading   = ref(false)

async function runBuy() {
  buyLoading.value = true
  try {
    buyRows.value = (await RateBenchmarkService.buyComparison(buyMode.value, buyContainer.value)) ?? []
  } finally {
    buyLoading.value = false
  }
}

// ── sell vs market ───────────────────────────────────────────────────────────
const _now    = new Date()
const _pad    = n => String(n).padStart(2, '0')
const sellFrom = ref(`${_now.getFullYear()}-${_pad(_now.getMonth() + 1)}-01`)
const sellTo   = ref(`${_now.getFullYear()}-${_pad(_now.getMonth() + 1)}-${_pad(_now.getDate())}`)
const sellMode = ref('')
const sellRows = ref([])
const sellLoading = ref(false)

async function runSell() {
  sellLoading.value = true
  try {
    sellRows.value = (await RateBenchmarkService.sellComparison(sellFrom.value, sellTo.value, sellMode.value)) ?? []
  } finally {
    sellLoading.value = false
  }
}

// ── market trend ─────────────────────────────────────────────────────────────
const trendPol       = ref('')
const trendPod       = ref('')
const trendContainer = ref('40GP')
const trendDays      = ref(180)
const trendRows      = ref([])
const trendLoading   = ref(false)

async function runTrend() {
  if (!trendPol.value || !trendPod.value) return
  trendLoading.value = true
  try {
    trendRows.value = (await RateBenchmarkService.trend(
      trendPol.value.toUpperCase(),
      trendPod.value.toUpperCase(),
      trendContainer.value,
      trendDays.value,
    )) ?? []
  } finally {
    trendLoading.value = false
  }
}
</script>

<template>
  <VContainer fluid class="px-0">
    <VTabs v-model="tab" class="mb-4">
      <VTab value="buy">{{ $gettext('Buy vs Market') }}</VTab>
      <VTab value="sell">{{ $gettext('Sell vs Market') }}</VTab>
      <VTab value="trend">{{ $gettext('Market Trend') }}</VTab>
    </VTabs>

    <!-- ── Tab 1: Buy vs Market ─────────────────────────────────────────── -->
    <VWindow v-model="tab">
      <VWindowItem value="buy">
        <VRow class="mb-4" align="center">
          <VCol cols="12" sm="2">
            <VSelect v-model="buyMode" :items="modeOptions" :label="$gettext('Mode')" density="compact" hide-details />
          </VCol>
          <VCol cols="12" sm="2">
            <VSelect v-model="buyContainer" :items="containerOptions" :label="$gettext('Container Type')" density="compact" hide-details />
          </VCol>
          <VCol cols="auto">
            <VBtn color="primary" :loading="buyLoading" @click="runBuy">{{ $gettext('Run Report') }}</VBtn>
          </VCol>
        </VRow>

        <VCard>
          <VTable>
            <thead>
              <tr>
                <th>{{ $gettext('Carrier') }}</th>
                <th>{{ $gettext('POL') }}</th>
                <th>{{ $gettext('POD') }}</th>
                <th>{{ $gettext('Mode') }}</th>
                <th>{{ $gettext('Container') }}</th>
                <th class="text-right">{{ $gettext('Buy Rate') }}</th>
                <th>{{ $gettext('Ccy') }}</th>
                <th class="text-right">{{ $gettext('Market Rate') }}</th>
                <th>{{ $gettext('Index') }}</th>
                <th>{{ $gettext('Index Date') }}</th>
                <th class="text-right">{{ $gettext('vs Market') }}</th>
                <th class="text-right">{{ $gettext('Premium %') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="buyLoading">
                <td colspan="12" class="text-center pa-4"><VProgressCircular indeterminate size="24" /></td>
              </tr>
              <tr v-else-if="!buyRows.length">
                <td colspan="12" class="text-center text-medium-emphasis pa-4">
                  {{ $gettext('Select filters and click Run Report. Ensure active rate cards exist.') }}
                </td>
              </tr>
              <tr v-for="(r, i) in buyRows" :key="i">
                <td class="font-weight-medium">{{ r.carrier }}</td>
                <td>{{ r.pol_code }}<span class="text-caption text-medium-emphasis ml-1">{{ r.pol_name }}</span></td>
                <td>{{ r.pod_code }}<span class="text-caption text-medium-emphasis ml-1">{{ r.pod_name }}</span></td>
                <td>{{ r.transport_type }}</td>
                <td>{{ r.container_type ?? '—' }}</td>
                <td class="text-right">{{ r.buy_rate != null ? fmt(r.buy_rate) : '—' }}</td>
                <td>{{ r.buying_currency }}</td>
                <td class="text-right">{{ r.market_rate != null ? fmt(r.market_rate) : '—' }}</td>
                <td>{{ r.market_index ?? '—' }}</td>
                <td>{{ r.market_date ?? '—' }}</td>
                <td class="text-right" :class="r.buy_vs_market != null && r.buy_vs_market < 0 ? 'text-success' : r.buy_vs_market != null ? 'text-error' : ''">
                  {{ r.buy_vs_market != null ? fmt(r.buy_vs_market) : '—' }}
                </td>
                <td class="text-right font-weight-bold" :class="r.buy_premium_pct != null && r.buy_premium_pct < 0 ? 'text-success' : r.buy_premium_pct != null ? 'text-error' : ''">
                  {{ fmtPct(r.buy_premium_pct) }}
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCard>

        <p class="text-caption text-medium-emphasis mt-2">
          {{ $gettext('Premium % < 0: buying below market (good). Premium % > 0: buying above market (review with carrier). Market rates provided by master index when available.') }}
        </p>
      </VWindowItem>

      <!-- ── Tab 2: Sell vs Market ──────────────────────────────────────── -->
      <VWindowItem value="sell">
        <VRow class="mb-4" align="center">
          <VCol cols="12" sm="2">
            <VTextField v-model="sellFrom" type="date" :label="$gettext('From')" density="compact" hide-details />
          </VCol>
          <VCol cols="12" sm="2">
            <VTextField v-model="sellTo" type="date" :label="$gettext('To')" density="compact" hide-details />
          </VCol>
          <VCol cols="12" sm="2">
            <VSelect v-model="sellMode" :items="modeOptions" :label="$gettext('Mode')" density="compact" hide-details />
          </VCol>
          <VCol cols="auto">
            <VBtn color="primary" :loading="sellLoading" @click="runSell">{{ $gettext('Run Report') }}</VBtn>
          </VCol>
        </VRow>

        <VCard>
          <VTable>
            <thead>
              <tr>
                <th>{{ $gettext('POL') }}</th>
                <th>{{ $gettext('POD') }}</th>
                <th>{{ $gettext('Mode') }}</th>
                <th class="text-right">{{ $gettext('Avg Sell') }}</th>
                <th>{{ $gettext('Ccy') }}</th>
                <th class="text-right">{{ $gettext('Market Rate') }}</th>
                <th>{{ $gettext('Index') }}</th>
                <th class="text-right">{{ $gettext('Sell Premium %') }}</th>
                <th class="text-right">{{ $gettext('Quotes') }}</th>
                <th class="text-right">{{ $gettext('Won') }}</th>
                <th class="text-right">{{ $gettext('Win Rate') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="sellLoading">
                <td colspan="11" class="text-center pa-4"><VProgressCircular indeterminate size="24" /></td>
              </tr>
              <tr v-else-if="!sellRows.length">
                <td colspan="11" class="text-center text-medium-emphasis pa-4">
                  {{ $gettext('Select date range and click Run Report.') }}
                </td>
              </tr>
              <tr v-for="(r, i) in sellRows" :key="i">
                <td>{{ r.pol_code }}</td>
                <td>{{ r.pod_code }}</td>
                <td>{{ r.transport_type }}</td>
                <td class="text-right">{{ r.avg_sell != null ? fmt(r.avg_sell) : '—' }}</td>
                <td>{{ r.quote_currency }}</td>
                <td class="text-right">{{ r.market_rate != null ? fmt(r.market_rate) : '—' }}</td>
                <td>{{ r.market_index ?? '—' }}</td>
                <td class="text-right font-weight-bold"
                    :class="r.sell_premium_pct != null && r.sell_premium_pct > 0 ? 'text-success' : r.sell_premium_pct != null && r.sell_premium_pct < 0 ? 'text-warning' : ''">
                  {{ fmtPct(r.sell_premium_pct) }}
                </td>
                <td class="text-right">{{ r.quotes_count }}</td>
                <td class="text-right">{{ r.won }}</td>
                <td class="text-right">{{ fmtPct(r.win_rate_pct) }}</td>
              </tr>
            </tbody>
          </VTable>
        </VCard>

        <p class="text-caption text-medium-emphasis mt-2">
          {{ $gettext('Sell Premium % > 0: pricing above market (strong margin). < 0: pricing below market (check if winning). Only quotes with ports on both sides are included.') }}
        </p>
      </VWindowItem>

      <!-- ── Tab 3: Market Trend ────────────────────────────────────────── -->
      <VWindowItem value="trend">
        <VRow class="mb-4" align="center">
          <VCol cols="12" sm="2">
            <VTextField v-model="trendPol" :label="$gettext('POL (UN/LOCODE)')" density="compact" hide-details placeholder="SGSIN" @keyup.enter="runTrend" />
          </VCol>
          <VCol cols="12" sm="2">
            <VTextField v-model="trendPod" :label="$gettext('POD (UN/LOCODE)')" density="compact" hide-details placeholder="NLRTM" @keyup.enter="runTrend" />
          </VCol>
          <VCol cols="12" sm="2">
            <VSelect v-model="trendContainer" :items="containerOptions.filter(c => c)" :label="$gettext('Container')" density="compact" hide-details />
          </VCol>
          <VCol cols="12" sm="1">
            <VTextField v-model.number="trendDays" type="number" :label="$gettext('Days')" density="compact" hide-details min="7" max="365" />
          </VCol>
          <VCol cols="auto">
            <VBtn color="primary" :loading="trendLoading" :disabled="!trendPol || !trendPod" @click="runTrend">
              {{ $gettext('Fetch Trend') }}
            </VBtn>
          </VCol>
        </VRow>

        <VCard>
          <VTable>
            <thead>
              <tr>
                <th>{{ $gettext('Date') }}</th>
                <th>{{ $gettext('Index') }}</th>
                <th class="text-right">{{ $gettext('Rate') }}</th>
                <th>{{ $gettext('Currency') }}</th>
                <th class="text-right">{{ $gettext('Week Change') }}</th>
                <th class="text-right">{{ $gettext('Change %') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="trendLoading">
                <td colspan="6" class="text-center pa-4"><VProgressCircular indeterminate size="24" /></td>
              </tr>
              <tr v-else-if="!trendRows.length">
                <td colspan="6" class="text-center text-medium-emphasis pa-4">
                  {{ $gettext('Enter POL and POD then click Fetch Trend.') }}
                </td>
              </tr>
              <tr v-for="(r, i) in trendRows" :key="i">
                <td>{{ r.rate_date }}</td>
                <td>{{ r.index_source }}</td>
                <td class="text-right">{{ fmt(r.rate_amount) }}</td>
                <td>{{ r.currency }}</td>
                <td class="text-right" :class="r.week_change > 0 ? 'text-error' : r.week_change < 0 ? 'text-success' : ''">
                  {{ r.week_change != null ? fmt(r.week_change) : '—' }}
                </td>
                <td class="text-right font-weight-medium" :class="r.week_change_pct > 0 ? 'text-error' : r.week_change_pct < 0 ? 'text-success' : ''">
                  {{ fmtPct(r.week_change_pct) }}
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCard>

        <p class="text-caption text-medium-emphasis mt-2">
          {{ $gettext('Trend data sourced from master market index (FBX, Drewry WCI, etc.). Rate rising = red (cost going up). Rate falling = green (cost going down).') }}
        </p>
      </VWindowItem>
    </VWindow>
  </VContainer>
</template>
