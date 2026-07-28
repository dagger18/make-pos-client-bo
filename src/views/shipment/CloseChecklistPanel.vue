<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  shipment: { type: Object, required: true },
})

const emit = defineEmits(['closed'])

const loading = ref(false)
const closing = ref(false)
const result = ref(null)

const isClosed = computed(() => !!props.shipment?.accountingClosedAt)
const allPassed = computed(() => result.value?.allPassed === true)

async function runChecklist() {
  loading.value = true
  try {
    result.value = await $api(`report/accounting-close/${props.shipment.id}/checklist`)
  } finally {
    loading.value = false
  }
}

async function closeAccounting() {
  closing.value = true
  try {
    const data = await $api(`report/accounting-close/${props.shipment.id}`, { method: 'POST' })
    emit('closed', data.accountingClosedAt)
  } finally {
    closing.value = false
  }
}

const checkMeta = {
  ap_matched:      { icon: 'tabler-file-invoice', color: 'blue',   label: 'AP Bills' },
  ar_settled:      { icon: 'tabler-receipt-dollar', color: 'green', label: 'AR Invoices' },
  journals_posted: { icon: 'tabler-book', color: 'purple',          label: 'Journal Entries' },
}
</script>

<template>
  <VCard flat>
    <VCardText>
      <!-- Already closed banner -->
      <VAlert
        v-if="isClosed"
        type="success"
        variant="tonal"
        class="mb-4"
        icon="tabler-lock-check"
      >
        Accounting closed on {{ shipment.accountingClosedAt }}. All EbitNotes are locked.
      </VAlert>

      <!-- Intro text -->
      <p class="text-body-2 text-medium-emphasis mb-4">
        Run the close checklist to verify all AP bills are matched, AR invoices have payments
        recorded, and journal entries are posted before locking this job's accounting.
      </p>

      <!-- Run button -->
      <div class="d-flex align-center gap-3 mb-6">
        <VBtn
          color="primary"
          variant="tonal"
          prepend-icon="tabler-refresh"
          :loading="loading"
          @click="runChecklist"
        >
          Run Checklist
        </VBtn>

        <VBtn
          v-if="!isClosed"
          color="error"
          prepend-icon="tabler-lock"
          :disabled="!result || !allPassed"
          :loading="closing"
          @click="closeAccounting"
        >
          Close Accounting
        </VBtn>
      </div>

      <!-- Results -->
      <template v-if="result">
        <VRow>
          <VCol
            v-for="check in result.checks"
            :key="check.code"
            cols="12"
            md="4"
          >
            <VCard
              :color="check.passed ? 'success' : 'error'"
              variant="tonal"
              rounded="lg"
            >
              <VCardText>
                <div class="d-flex align-center gap-2 mb-2">
                  <VIcon :icon="checkMeta[check.code]?.icon" size="20" />
                  <span class="text-subtitle-2 font-weight-bold">
                    {{ checkMeta[check.code]?.label }}
                  </span>
                  <VSpacer />
                  <VIcon
                    :icon="check.passed ? 'tabler-circle-check' : 'tabler-alert-circle'"
                    :color="check.passed ? 'success' : 'error'"
                    size="22"
                  />
                </div>

                <p class="text-body-2 mb-1">{{ check.label }}</p>

                <div class="text-caption text-medium-emphasis">
                  <span v-if="check.passed">
                    All {{ check.total }} {{ checkMeta[check.code]?.label.toLowerCase() }} passed
                  </span>
                  <span v-else class="text-error">
                    {{ check.failing }} of {{ check.total }} failing
                  </span>
                </div>

                <!-- Failing items list -->
                <VList
                  v-if="!check.passed && check.items.length"
                  density="compact"
                  class="mt-2 bg-transparent pa-0"
                >
                  <VListItem
                    v-for="item in check.items"
                    :key="item.id"
                    class="pa-0"
                  >
                    <template #prepend>
                      <VIcon icon="tabler-point-filled" size="10" color="error" class="me-1" />
                    </template>
                    <VListItemTitle class="text-caption">
                      {{ item.code || item.journalNumber }}
                      <span v-if="item.varianceStatus" class="text-medium-emphasis ms-1">
                        ({{ item.varianceStatus ?? 'unmatched' }})
                      </span>
                    </VListItemTitle>
                  </VListItem>
                </VList>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <!-- Overall result -->
        <VAlert
          :type="allPassed ? 'success' : 'warning'"
          variant="tonal"
          class="mt-4"
          :icon="allPassed ? 'tabler-circle-check' : 'tabler-alert-triangle'"
        >
          <template v-if="allPassed">
            All checks passed. You may now close accounting for this shipment.
          </template>
          <template v-else>
            {{ result.checks.filter(c => !c.passed).length }} check(s) failed. Resolve the issues above before closing.
          </template>
        </VAlert>
      </template>
    </VCardText>
  </VCard>
</template>
