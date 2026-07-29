<template>
  <VCard>
    <VCardTitle class="d-flex align-center pa-4">
      <span>Loyalty Program</span>
      <VSpacer />
      <VBtn color="primary" prepend-icon="tabler-plus" @click="openCreate">
        Add Customer
      </VBtn>
    </VCardTitle>

    <VCardText class="pb-0">
      <VRow dense>
        <VCol cols="12" sm="5">
          <VTextField
            v-model="filters.q"
            label="Search by name, phone or email"
            clearable
            density="compact"
            prepend-inner-icon="tabler-search"
            @update:modelValue="debouncedLoad"
          />
        </VCol>
        <VCol cols="12" sm="2" class="d-flex align-center">
          <VBtn variant="tonal" size="small" @click="clearFilters">Clear</VBtn>
        </VCol>
      </VRow>
    </VCardText>

    <VDataTable
      :headers="headers"
      :items="items"
      :loading="loading"
      item-value="id"
    >
      <template #item.points="{ item }">
        <VChip :color="item.points > 0 ? 'success' : 'default'" size="small">
          {{ item.points }}
        </VChip>
      </template>

      <template #item.actions="{ item }">
        <VBtn size="small" variant="tonal" color="success" class="mr-1" @click="openEarn(item)">
          Earn
        </VBtn>
        <VBtn size="small" variant="tonal" color="warning" class="mr-1"
          :disabled="item.points <= 0" @click="openRedeem(item)">
          Redeem
        </VBtn>
        <VBtn size="small" variant="text" icon @click="openEdit(item)">
          <VIcon icon="tabler-edit" />
        </VBtn>
        <VBtn size="small" variant="text" icon @click="openTx(item)">
          <VIcon icon="tabler-list" />
        </VBtn>
      </template>
    </VDataTable>
  </VCard>

  <!-- ── Create / Edit Dialog ───────────────────────────────────── -->
  <VDialog v-model="formDialog" max-width="420">
    <VCard>
      <VCardTitle>{{ editTarget ? 'Edit Customer' : 'Add Customer' }}</VCardTitle>
      <VCardText>
        <VTextField v-model="form.name" label="Full Name" density="compact" class="mb-3" />
        <VTextField v-model="form.phone" label="Phone (optional)" density="compact" class="mb-3" />
        <VTextField v-model="form.email" label="Email (optional)" type="email" density="compact" />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="formDialog = false">Cancel</VBtn>
        <VBtn color="primary" :disabled="!form.name" @click="submitForm">
          {{ editTarget ? 'Save' : 'Add' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- ── Earn Points Dialog ─────────────────────────────────────── -->
  <VDialog v-model="earnDialog" max-width="360">
    <VCard>
      <VCardTitle>Earn Points — {{ earnTarget?.name }}</VCardTitle>
      <VCardText>
        <VTextField v-model.number="earnForm.points" label="Points to earn" type="number" min="1"
          density="compact" class="mb-3" />
        <VTextField v-model="earnForm.reference" label="Reference (e.g. Order ID)" density="compact" />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="earnDialog = false">Cancel</VBtn>
        <VBtn color="success" :disabled="!earnForm.points || earnForm.points < 1" @click="submitEarn">
          Confirm
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- ── Redeem Points Dialog ───────────────────────────────────── -->
  <VDialog v-model="redeemDialog" max-width="360">
    <VCard>
      <VCardTitle>Redeem Points — {{ redeemTarget?.name }}</VCardTitle>
      <VCardText>
        <p class="text-caption text-disabled mb-3">
          Available: <strong>{{ redeemTarget?.points ?? 0 }}</strong> points
        </p>
        <VTextField v-model.number="redeemForm.points" label="Points to redeem" type="number" min="1"
          :max="redeemTarget?.points" density="compact" class="mb-3" />
        <VTextField v-model="redeemForm.reference" label="Reference (optional)" density="compact" />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="redeemDialog = false">Cancel</VBtn>
        <VBtn color="warning"
          :disabled="!redeemForm.points || redeemForm.points < 1 || redeemForm.points > (redeemTarget?.points ?? 0)"
          @click="submitRedeem">
          Confirm
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- ── Transactions Dialog ────────────────────────────────────── -->
  <VDialog v-model="txDialog" max-width="520">
    <VCard>
      <VCardTitle>Transactions — {{ txTarget?.name }}</VCardTitle>
      <VCardText>
        <VTable density="compact">
          <thead>
            <tr>
              <th>Type</th>
              <th class="text-right">Points</th>
              <th>Reference</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in txList" :key="t.id">
              <td>
                <VChip size="x-small" :color="t.type === 'earn' ? 'success' : 'warning'" label>
                  {{ t.type }}
                </VChip>
              </td>
              <td class="text-right font-weight-medium"
                :class="t.points > 0 ? 'text-success' : 'text-warning'">
                {{ t.points > 0 ? '+' : '' }}{{ t.points }}
              </td>
              <td class="text-disabled">{{ t.reference ?? '—' }}</td>
              <td>{{ t.createdAt }}</td>
            </tr>
            <tr v-if="!txList.length">
              <td colspan="4" class="text-disabled text-center py-4">No transactions yet</td>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="txDialog = false">Close</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import LoyaltyService from '@/services/LoyaltyService'

const items   = ref([])
const loading = ref(false)
const filters = ref({ q: '' })

const headers = [
  { title: 'Name',   key: 'name',    sortable: true },
  { title: 'Phone',  key: 'phone',   sortable: false },
  { title: 'Email',  key: 'email',   sortable: false },
  { title: 'Points', key: 'points',  sortable: true },
  { title: '',       key: 'actions', sortable: false },
]

// Create/Edit
const formDialog = ref(false)
const editTarget = ref(null)
const form       = ref({ id: null, name: '', phone: '', email: '' })

// Earn
const earnDialog = ref(false)
const earnTarget = ref(null)
const earnForm   = ref({ points: null, reference: '' })

// Redeem
const redeemDialog = ref(false)
const redeemTarget = ref(null)
const redeemForm   = ref({ points: null, reference: '' })

// Transactions
const txDialog = ref(false)
const txTarget = ref(null)
const txList   = ref([])

const load = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filters.value.q) params.set('q', filters.value.q)
    const res = await LoyaltyService.listCustomers(params.toString())
    items.value = res?.list ?? res ?? []
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = { q: '' }
  load()
}

const debouncedLoad = useDebounceFn(load, 300)

const openCreate = () => {
  editTarget.value = null
  form.value       = { id: null, name: '', phone: '', email: '' }
  formDialog.value = true
}

const openEdit = (item) => {
  editTarget.value = item
  form.value       = { id: item.id, name: item.name, phone: item.phone ?? '', email: item.email ?? '' }
  formDialog.value = true
}

const submitForm = async () => {
  if (editTarget.value) {
    await LoyaltyService.updateCustomer(form.value)
  } else {
    await LoyaltyService.createCustomer(form.value)
  }
  formDialog.value = false
  await load()
}

const openEarn = (item) => {
  earnTarget.value = item
  earnForm.value   = { points: null, reference: '' }
  earnDialog.value = true
}

const submitEarn = async () => {
  await LoyaltyService.earn(earnTarget.value.id, earnForm.value)
  earnDialog.value = false
  await load()
}

const openRedeem = (item) => {
  redeemTarget.value = item
  redeemForm.value   = { points: null, reference: '' }
  redeemDialog.value = true
}

const submitRedeem = async () => {
  await LoyaltyService.redeem(redeemTarget.value.id, redeemForm.value)
  redeemDialog.value = false
  await load()
}

const openTx = async (item) => {
  txTarget.value = item
  txList.value   = []
  txDialog.value = true
  const detail  = await LoyaltyService.getCustomer(item.id)
  txList.value   = detail?.transactions ?? []
}

onMounted(load)
</script>
