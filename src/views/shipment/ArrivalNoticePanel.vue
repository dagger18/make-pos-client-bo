<script setup>
import ArrivalNoticeService from '@/services/ArrivalNoticeService'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  shipment: { type: Object, required: true },
})

const notice = ref(null)
const loading = ref(false)
const saving = ref(false)
const form = ref({
  issueDate: null,
  consigneeName: '',
  consigneeAddress: '',
  destinationChargesNote: '',
  requiredDocuments: [],
  note: '',
})
const newDoc = ref('')

async function load() {
  loading.value = true
  const list = await ArrivalNoticeService.list(`filter_shipment=${props.shipment.id}`)
  if (list && list.length > 0) {
    notice.value = list[0]
    form.value = {
      issueDate: notice.value.issueDate,
      consigneeName: notice.value.consigneeName ?? '',
      consigneeAddress: notice.value.consigneeAddress ?? '',
      destinationChargesNote: notice.value.destinationChargesNote ?? '',
      requiredDocuments: notice.value.requiredDocuments ?? [],
      note: notice.value.note ?? '',
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
  if (notice.value) {
    payload.id = notice.value.id
    notice.value = await ArrivalNoticeService.update(payload)
  } else {
    notice.value = await ArrivalNoticeService.add(payload)
  }
  saving.value = false
}

function addDoc() {
  if (newDoc.value.trim()) {
    form.value.requiredDocuments.push(newDoc.value.trim())
    newDoc.value = ''
  }
}

function removeDoc(index) {
  form.value.requiredDocuments.splice(index, 1)
}

function downloadPdf(language) {
  if (!notice.value) return
  window.open(ArrivalNoticeService.downloadPdf(props.shipment, notice.value.id, language), '_blank')
}

onMounted(load)
</script>
<template>
<VRow>
  <VCol cols="12" lg="3" style="max-inline-size: 250px;">
    <VCard :elevation="0">
      <VCardText class="mt-n3">
        <VMenu v-if="notice">
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
              v-model="form.destinationChargesNote"
              :label="$gettext('Destination Charges Note')"
              density="compact"
              rows="3"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12">
            <div class="text-subtitle-2 mb-2">{{ $gettext('Required Documents') }}</div>
            <VChip
              v-for="(doc, i) in form.requiredDocuments"
              :key="i"
              closable
              class="me-2 mb-2"
              @click:close="removeDoc(i)"
            >{{ doc }}</VChip>
            <div class="d-flex gap-2 mt-2">
              <VTextField
                v-model="newDoc"
                :placeholder="$gettext('Add document...')"
                density="compact"
                hide-details
                @keyup.enter="addDoc"
              />
              <VBtn size="small" @click="addDoc">{{ $gettext('Add') }}</VBtn>
            </div>
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
