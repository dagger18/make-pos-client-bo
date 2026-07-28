<script setup>
import DeliveryOrderService from '@/services/DeliveryOrderService'

const props = defineProps({
  shipment: { type: Object, required: true },
})

const order = ref(null)
const loading = ref(false)
const saving = ref(false)
const form = ref({
  issueDate: null,
  consigneeName: '',
  consigneeAddress: '',
  releaseDate: null,
  releaseNote: '',
  note: '',
})

async function load() {
  loading.value = true
  const list = await DeliveryOrderService.list(`filter_shipment=${props.shipment.id}`)
  if (list && list.length > 0) {
    order.value = list[0]
    form.value = {
      issueDate: order.value.issueDate,
      consigneeName: order.value.consigneeName ?? '',
      consigneeAddress: order.value.consigneeAddress ?? '',
      releaseDate: order.value.releaseDate,
      releaseNote: order.value.releaseNote ?? '',
      note: order.value.note ?? '',
    }
  }
  loading.value = false
}

async function save() {
  saving.value = true
  const payload = {
    ...form.value,
    shipment: props.shipment.id,
  }
  if (order.value) {
    payload.id = order.value.id
    order.value = await DeliveryOrderService.update(payload)
  } else {
    order.value = await DeliveryOrderService.add(payload)
  }
  saving.value = false
}

function downloadPdf(language) {
  if (!order.value) return
  window.open(DeliveryOrderService.downloadPdf(props.shipment, order.value.id, language), '_blank')
}

onMounted(load)
</script>
<template>
<VRow>
  <VCol cols="12" lg="3" style="max-inline-size: 250px;">
    <VCard :elevation="0">
      <VCardText class="mt-n3">
        <VMenu v-if="order">
          <template #activator="{ props }">
            <VBtn v-bind="props" block class="mb-2 d-flex" variant="tonal" color="secondary">
              <VIcon icon="tabler-file-download" size="24" class="me-4 ms-n4"/>
              {{ $gettext('Download PDF') }}
            </VBtn>
          </template>
          <VList>
            <VListItem @click="downloadPdf('en')">
              <VListItemTitle>English</VListItemTitle>
            </VListItem>
            <VListItem @click="downloadPdf('vi')">
              <VListItemTitle>Vietnamese</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </VCardText>
    </VCard>
  </VCol>

  <VCol cols="12" lg="9">
    <VCard :elevation="0" :loading="loading">
      <VCardText>
        <VRow>
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.issueDate"
              :label="$gettext('Issue Date')"
              type="date"
              density="compact"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.releaseDate"
              :label="$gettext('Release Date')"
              type="date"
              density="compact"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.consigneeName"
              :label="$gettext('Consignee Name')"
              density="compact"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextarea
              v-model="form.consigneeAddress"
              :label="$gettext('Consignee Address')"
              density="compact"
              rows="3"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12">
            <VTextarea
              v-model="form.releaseNote"
              :label="$gettext('Release Note')"
              density="compact"
              rows="2"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12">
            <VTextarea
              v-model="form.note"
              :label="$gettext('Note')"
              density="compact"
              rows="2"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12">
            <SubmitBtn :loading="saving" @click="save">
              {{ $gettext('Save') }}
            </SubmitBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VCol>
</VRow>
</template>
