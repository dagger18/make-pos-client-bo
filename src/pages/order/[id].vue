<template>
  <VCard :loading="loading">
    <VCardTitle class="d-flex align-center pa-4">
      <span>Order #{{ order?.id }}</span>
      <VChip v-if="order" class="ml-3" :color="statusColor(order.status)" size="small" label>
        {{ order.status }}
      </VChip>
      <VSpacer />
      <VBtn variant="tonal" :to="{ name: 'order' }">Back</VBtn>
    </VCardTitle>

    <VCardText v-if="order">
      <VRow>
        <VCol cols="12" md="8">
          <!-- Items -->
          <p class="text-subtitle-1 font-weight-bold mb-2">Items</p>
          <VTable density="compact" class="mb-6">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="item in order.items" :key="item.id">
                <tr>
                  <td>{{ item.productName }}</td>
                  <td class="text-disabled">{{ item.productSku }}</td>
                  <td class="text-right">{{ Number(item.unitPrice).toFixed(2) }}</td>
                  <td class="text-right">{{ item.quantity }}</td>
                  <td class="text-right font-weight-medium">{{ Number(item.itemTotal).toFixed(2) }}</td>
                </tr>
                <tr v-if="item.modifiers?.length">
                  <td colspan="5" class="text-caption text-disabled pl-6">
                    Modifiers: {{ item.modifiers.map(m => m.name).join(', ') }}
                  </td>
                </tr>
              </template>
            </tbody>
          </VTable>

          <!-- Payments -->
          <p class="text-subtitle-1 font-weight-bold mb-2">Payments</p>
          <VTable density="compact">
            <thead>
              <tr>
                <th>Method</th>
                <th class="text-right">Amount</th>
                <th>Reference</th>
                <th>Paid At</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in order.payments" :key="p.id">
                <td><VChip size="x-small" label>{{ p.method }}</VChip></td>
                <td class="text-right">{{ Number(p.amount).toFixed(2) }}</td>
                <td class="text-disabled">{{ p.reference ?? '—' }}</td>
                <td>{{ p.paidAt }}</td>
                <td>
                  <VBtn v-if="order.status !== 'paid'" icon size="x-small" variant="text" color="error"
                    @click="deletePayment(p)">
                    <VIcon icon="tabler-x" />
                  </VBtn>
                </td>
              </tr>
              <tr v-if="!order.payments.length">
                <td colspan="5" class="text-disabled text-center">No payments recorded</td>
              </tr>
            </tbody>
          </VTable>

          <!-- Add payment (if not paid) -->
          <div v-if="order.status === 'open'" class="mt-4">
            <VBtn color="primary" prepend-icon="tabler-plus" @click="paymentDialog = true">
              Add Payment
            </VBtn>
          </div>
        </VCol>

        <VCol cols="12" md="4">
          <VCard variant="outlined" class="pa-4">
            <div class="d-flex justify-space-between mb-2">
              <span class="text-disabled">Subtotal</span>
              <span>{{ Number(order.subtotal).toFixed(2) }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2" v-if="order.discountAmount > 0">
              <span class="text-disabled">Discount</span>
              <span class="text-error">-{{ Number(order.discountAmount).toFixed(2) }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2" v-if="order.taxAmount > 0">
              <span class="text-disabled">Tax</span>
              <span>{{ Number(order.taxAmount).toFixed(2) }}</span>
            </div>
            <VDivider class="my-2" />
            <div class="d-flex justify-space-between font-weight-bold text-h6 mb-2">
              <span>Total</span>
              <span>{{ Number(order.total).toFixed(2) }}</span>
            </div>
            <div class="d-flex justify-space-between text-success">
              <span>Paid</span>
              <span>{{ Number(order.paidAmount).toFixed(2) }}</span>
            </div>
            <div class="d-flex justify-space-between text-warning" v-if="order.total - order.paidAmount > 0.001">
              <span>Balance due</span>
              <span>{{ (Number(order.total) - Number(order.paidAmount)).toFixed(2) }}</span>
            </div>
            <div class="mt-3 text-caption text-disabled" v-if="order.notes">
              Notes: {{ order.notes }}
            </div>
            <div class="mt-1 text-caption text-disabled">
              Created: {{ order.createdAt }}<br>
              By: {{ order.createdBy?.name ?? 'Unknown' }}
            </div>
          </VCard>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>

  <!-- Add Payment Dialog -->
  <VDialog v-model="paymentDialog" max-width="380">
    <VCard>
      <VCardTitle>Add Payment</VCardTitle>
      <VCardText>
        <VBtnToggle v-model="payForm.method" mandatory class="mb-4" density="compact">
          <VBtn value="cash">Cash</VBtn>
          <VBtn value="card">Card</VBtn>
          <VBtn value="qr_code">QR</VBtn>
          <VBtn value="other">Other</VBtn>
        </VBtnToggle>
        <VTextField v-model.number="payForm.amount" label="Amount" type="number" step="0.01" prefix="$" class="mb-2" />
        <VTextField v-if="payForm.method !== 'cash'" v-model="payForm.reference"
          label="Reference (optional)" />
        <div v-if="payForm.method === 'cash' && payForm.amount > order?.total" class="text-success mt-2">
          Change: ${{ (payForm.amount - order.total).toFixed(2) }}
        </div>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="paymentDialog = false">Cancel</VBtn>
        <VBtn color="primary" @click="submitPayment">Confirm</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SalesService from '@/services/SalesService'

const route = useRoute()
const order = ref(null)
const loading = ref(false)
const paymentDialog = ref(false)
const payForm = ref({ method: 'cash', amount: 0, reference: '' })

const statusColor = (s) => ({ open: 'warning', paid: 'success', cancelled: 'error' }[s] ?? 'default')

const load = async () => {
  loading.value = true
  order.value = await SalesService.getOrder(route.params.id)
  payForm.value.amount = order.value ? Math.max(0, Number(order.value.total) - Number(order.value.paidAmount)) : 0
  loading.value = false
}

const submitPayment = async () => {
  await SalesService.addPayment(route.params.id, payForm.value)
  paymentDialog.value = false
  await load()
}

const deletePayment = async (p) => {
  if (!confirm('Remove this payment?')) return
  await SalesService.deletePayment(route.params.id, p.id)
  await load()
}

onMounted(load)
</script>
