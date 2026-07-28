<script setup>
import { useGettext } from 'vue3-gettext'
import PortalInvoiceService from '@/services/portal/PortalInvoiceService'

definePage({ meta: { layout: 'portal' } })

const { $gettext } = useGettext()
const invoices = ref([])
const loading = ref(true)

onMounted(async () => {
  invoices.value = await PortalInvoiceService.list() ?? []
  loading.value = false
})

function statusColor(status) {
  if (status === 'D') return 'success'
  if (status === 'S') return 'info'
  return 'warning'
}
</script>
<template>
  <div>
    <h1 class="text-h5 mb-6">{{ $gettext('Invoices') }}</h1>
    <VCard :loading="loading">
      <VTable density="compact">
        <thead>
          <tr>
            <th>{{ $gettext('Invoice No.') }}</th>
            <th>{{ $gettext('Shipment') }}</th>
            <th>{{ $gettext('Amount') }}</th>
            <th>{{ $gettext('Currency') }}</th>
            <th>{{ $gettext('Status') }}</th>
            <th>{{ $gettext('Date') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inv in invoices" :key="inv.id">
            <td class="font-weight-medium">{{ inv.code }}</td>
            <td>
              <RouterLink :to="`/portal/shipments/${inv.shipmentId}`" class="text-decoration-none">
                {{ inv.shipmentCode }}
              </RouterLink>
            </td>
            <td>{{ Number(inv.amount).toLocaleString() }}</td>
            <td>{{ inv.currency }}</td>
            <td><VChip size="small" :color="statusColor(inv.status)">{{ inv.status }}</VChip></td>
            <td>{{ inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '—' }}</td>
          </tr>
          <tr v-if="!invoices.length && !loading">
            <td colspan="6" class="text-center text-medium-emphasis py-6">{{ $gettext('No invoices found') }}</td>
          </tr>
        </tbody>
      </VTable>
    </VCard>
  </div>
</template>
