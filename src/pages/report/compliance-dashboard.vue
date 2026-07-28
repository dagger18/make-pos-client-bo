<script setup>
import { useGettext } from 'vue3-gettext'
// ComplianceService removed - freight-specific service
const ComplianceService = null
definePage({ meta: { action: 'GET', subject: 'EbitNote', navActiveLink: 'report-vat-report' } })

const { $gettext } = useGettext()

const dashboard = ref(null)
const loading   = ref(false)
const checkDialog = ref(false)
const checking    = ref(false)
const checkForm   = ref({ orgName: '', countryCode: '' })
const checkResult = ref(null)
const clearDialog = ref(false)
const clearForm   = ref({ entryId: null, reason: '' })
const gdprDialog  = ref(false)
const gdprForm    = ref({ email: '', requestRef: '' })
const gdprResult  = ref(null)
const gdprSaving  = ref(false)

const RESULT_COLOR   = { SUCCESS: 'success', FAILURE: 'error', BLOCKED: 'warning' }
const STATUS_COLOR   = { CLEAR: 'success', POSSIBLE_MATCH: 'warning', CONFIRMED_HIT: 'error' }

async function load() {
  loading.value = true
  dashboard.value = await ComplianceService.getDashboard()
  loading.value = false
}

async function runSanctionsCheck() {
  checking.value = true
  checkResult.value = null
  try {
    checkResult.value = await ComplianceService.checkSanctions(checkForm.value)
  } finally {
    checking.value = false
  }
}

async function openClear(entryId) {
  clearForm.value = { entryId, reason: '' }
  clearDialog.value = true
}

async function submitClear() {
  await ComplianceService.clearSanctionHit(clearForm.value.entryId, { reason: clearForm.value.reason })
  clearDialog.value = false
  checkResult.value = null
}

async function runGdprErase() {
  gdprSaving.value = true
  gdprResult.value = null
  try {
    gdprResult.value = await ComplianceService.eraseContact({
      email: gdprForm.value.email,
      requestRef: gdprForm.value.requestRef || ('GDPR-' + new Date().toISOString().slice(0, 10)),
    })
  } finally {
    gdprSaving.value = false
  }
}

const totals = computed(() => dashboard.value?.totals ?? {})

const complianceByPeriod = computed(() => {
  const stats = dashboard.value?.complianceStats ?? []
  const grouped = {}
  for (const row of stats) {
    const k = row.period || row[0]
    if (!grouped[k]) grouped[k] = {}
    const et = row.event_type || row[1]
    grouped[k][et] = (grouped[k][et] || 0) + Number(row.event_count || row[3] || 0)
  }
  return Object.entries(grouped).slice(0, 6).map(([period, events]) => ({ period, ...events }))
})

onMounted(load)
</script>

<template>
  <VContainer fluid class="px-0">
    <VRow align="center" class="mb-4">
      <VCol>
        <div class="text-caption text-disabled">{{ $gettext('Last 30 days activity · Compliance officer view') }}</div>
      </VCol>
      <VCol cols="auto" class="d-flex gap-2">
        <VBtn color="warning" prepend-icon="tabler-shield-search" @click="checkDialog = true">
          {{ $gettext('Sanctions Check') }}
        </VBtn>
        <VBtn color="error" prepend-icon="tabler-user-x" variant="tonal" @click="gdprDialog = true">
          {{ $gettext('GDPR Erasure') }}
        </VBtn>
        <VBtn color="default" prepend-icon="tabler-refresh" @click="load" :loading="loading">
          {{ $gettext('Refresh') }}
        </VBtn>
      </VCol>
    </VRow>

    <!-- Totals row -->
    <VRow class="mb-4" v-if="totals.total !== undefined">
      <VCol cols="6" sm="2">
        <VCard variant="outlined">
          <VCardText class="pa-3">
            <div class="text-caption text-disabled">{{ $gettext('Total Events (30d)') }}</div>
            <div class="text-h6 font-weight-bold">{{ totals.total ?? 0 }}</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="6" sm="2">
        <VCard variant="outlined">
          <VCardText class="pa-3">
            <div class="text-caption text-disabled">{{ $gettext('Auth Events') }}</div>
            <div class="text-h6 font-weight-bold text-info">{{ totals.auth_events ?? 0 }}</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="6" sm="2">
        <VCard variant="outlined">
          <VCardText class="pa-3">
            <div class="text-caption text-disabled">{{ $gettext('Compliance Events') }}</div>
            <div class="text-h6 font-weight-bold text-warning">{{ totals.compliance_events ?? 0 }}</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="6" sm="2">
        <VCard variant="outlined">
          <VCardText class="pa-3">
            <div class="text-caption text-disabled">{{ $gettext('Financial Events') }}</div>
            <div class="text-h6 font-weight-bold text-primary">{{ totals.financial_events ?? 0 }}</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="6" sm="2">
        <VCard color="warning" variant="tonal">
          <VCardText class="pa-3">
            <div class="text-caption">{{ $gettext('Blocked') }}</div>
            <div class="text-h6 font-weight-bold">{{ totals.blocked_events ?? 0 }}</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="6" sm="2">
        <VCard color="error" variant="tonal">
          <VCardText class="pa-3">
            <div class="text-caption">{{ $gettext('Failures') }}</div>
            <div class="text-h6 font-weight-bold">{{ totals.failure_events ?? 0 }}</div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Compliance event stats table -->
    <VCard class="mb-4">
      <VCardTitle class="pa-4 text-subtitle-1">{{ $gettext('Compliance Events — Last 12 Months') }}</VCardTitle>
      <VTable density="compact">
        <thead>
          <tr>
            <th>{{ $gettext('Period') }}</th>
            <th>{{ $gettext('Event Type') }}</th>
            <th>{{ $gettext('Result') }}</th>
            <th class="text-right">{{ $gettext('Count') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!dashboard?.complianceStats?.length">
            <td colspan="4" class="text-center text-disabled pa-4">{{ $gettext('No compliance events in the last 12 months') }}</td>
          </tr>
          <tr v-for="(row, i) in (dashboard?.complianceStats ?? []).slice(0, 50)" :key="i">
            <td class="text-caption">{{ row.period ?? row[0] }}</td>
            <td><VChip size="x-small" color="warning">{{ row.event_type ?? row[1] }}</VChip></td>
            <td><VChip size="x-small" :color="RESULT_COLOR[row.result ?? row[2]] ?? 'default'">{{ row.result ?? row[2] }}</VChip></td>
            <td class="text-right font-weight-bold">{{ row.event_count ?? row[3] }}</td>
          </tr>
        </tbody>
      </VTable>
    </VCard>

    <!-- Sanctions Check Dialog -->
    <VDialog v-model="checkDialog" max-width="620px">
      <VCard :title="$gettext('Sanctions Screening')">
        <VCardText>
          <VRow dense>
            <VCol cols="12" md="8">
              <VTextField v-model="checkForm.orgName" :label="$gettext('Organisation / Party Name')" density="compact"
                :placeholder="$gettext('Enter exact or partial name')" />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField v-model="checkForm.countryCode" :label="$gettext('Country Code (2-letter)')"
                density="compact" maxlength="2" clearable placeholder="e.g. IR, RU, KP" />
            </VCol>
          </VRow>

          <template v-if="checkResult">
            <VAlert
              :type="checkResult.status === 'CLEAR' ? 'success' : checkResult.status === 'POSSIBLE_MATCH' ? 'warning' : 'error'"
              variant="tonal"
              class="mt-3 mb-3"
            >
              <strong>{{ checkResult.status }}</strong>
              — {{ checkResult.totalChecked }} {{ $gettext('entries reviewed') }}
            </VAlert>

            <div v-if="checkResult.exactMatches?.length" class="mb-3">
              <div class="text-subtitle-2 mb-2">{{ $gettext('Exact Matches') }}</div>
              <VTable density="compact">
                <thead><tr><th>{{ $gettext('List') }}</th><th>{{ $gettext('Name') }}</th><th>{{ $gettext('Country') }}</th><th>{{ $gettext('Type') }}</th><th></th></tr></thead>
                <tbody>
                  <tr v-for="m in checkResult.exactMatches" :key="m.id">
                    <td><VChip size="x-small" color="error">{{ m.listName }}</VChip></td>
                    <td class="font-weight-bold">{{ m.listedName }}</td>
                    <td>{{ m.countryCode ?? '—' }}</td>
                    <td>{{ m.entityType ?? '—' }}</td>
                    <td>
                      <VBtn size="x-small" color="success" variant="tonal" @click="openClear(m.id)">
                        {{ $gettext('Clear Hit') }}
                      </VBtn>
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </div>

            <div v-if="checkResult.fuzzyMatches?.length">
              <div class="text-subtitle-2 mb-2">{{ $gettext('Possible Matches') }}</div>
              <VTable density="compact">
                <thead><tr><th>{{ $gettext('List') }}</th><th>{{ $gettext('Name') }}</th><th>{{ $gettext('Similarity') }}</th><th></th></tr></thead>
                <tbody>
                  <tr v-for="m in checkResult.fuzzyMatches" :key="m.id">
                    <td><VChip size="x-small" color="warning">{{ m.listName }}</VChip></td>
                    <td>{{ m.listedName }}</td>
                    <td>{{ m.score }}%</td>
                    <td>
                      <VBtn size="x-small" color="success" variant="tonal" @click="openClear(m.id)">
                        {{ $gettext('Clear') }}
                      </VBtn>
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </div>
          </template>
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="checkDialog = false; checkResult = null">{{ $gettext('Close') }}</VBtn>
          <VBtn color="warning" :loading="checking" @click="runSanctionsCheck">{{ $gettext('Run Check') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Clear Sanctions Hit Dialog -->
    <VDialog v-model="clearDialog" max-width="440px">
      <VCard :title="$gettext('Clear Sanctions Hit')">
        <VCardText>
          <p class="text-caption text-disabled mb-3">
            {{ $gettext('Document your reasoning. This decision is logged in the audit trail.') }}
          </p>
          <VTextarea
            v-model="clearForm.reason"
            :label="$gettext('Reason for clearing (required)')"
            density="compact" rows="3"
          />
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="clearDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="success" :disabled="!clearForm.reason" @click="submitClear">{{ $gettext('Confirm Clear') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- GDPR Erasure Dialog -->
    <VDialog v-model="gdprDialog" max-width="520px">
      <VCard :title="$gettext('GDPR Right-to-Erasure Request')">
        <VCardText>
          <p class="text-caption text-disabled mb-3">
            {{ $gettext('Anonymises personal fields on the contact record. Financial and operational records are retained per legal requirement.') }}
          </p>
          <VRow dense>
            <VCol cols="12">
              <VTextField v-model="gdprForm.email" :label="$gettext('Contact Email Address')" density="compact" type="email" />
            </VCol>
            <VCol cols="12">
              <VTextField v-model="gdprForm.requestRef" :label="$gettext('Request Reference (optional)')"
                density="compact" placeholder="e.g. DSR-2026-001" clearable />
            </VCol>
          </VRow>

          <VAlert v-if="gdprResult" :type="gdprResult.status === 'ERASED' ? 'success' : 'error'" variant="tonal" class="mt-3">
            <strong>{{ gdprResult.status }}</strong>
            <div v-if="gdprResult.erased" class="text-caption mt-1">
              {{ $gettext('Erased:') }} {{ gdprResult.erased?.join(', ') }}
            </div>
            <div v-if="gdprResult.retained" class="text-caption">
              {{ $gettext('Retained:') }} {{ gdprResult.retained?.join(', ') }}
            </div>
          </VAlert>
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="gdprDialog = false; gdprResult = null">{{ $gettext('Close') }}</VBtn>
          <VBtn color="error" :loading="gdprSaving" :disabled="!gdprForm.email" @click="runGdprErase">
            {{ $gettext('Erase Personal Data') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>
