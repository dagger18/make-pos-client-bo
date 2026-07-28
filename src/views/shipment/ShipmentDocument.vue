<script setup>
import { enums as ShipmentStatus } from '@/config/enums/ShipmentStatus'
import { enums as TransportType } from '@/config/enums/TransportType'
import { headers } from '@/config/tables/shipment/Document'
import MediaService from '@/services/MediaService'
// InstructionService removed - freight-specific service
const InstructionService = null;
// ShipmentDocumentService removed - freight-specific service
const ShipmentDocumentService = null;
import { useAppStore } from '@/stores/appStore'

const props = defineProps({
  shipment: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['shipmentChanged'])

const shipmentEditable = computed(() =>
  props.shipment
    && props.shipment.status !== ShipmentStatus.Completed
    && props.shipment.status !== ShipmentStatus.Cancelled
)

// ─── Document Checklist ──────────────────────────────────────────────────────
const docList = ref([])
const checklistLoading = ref(false)

const requiredCount = computed(() => docList.value.filter(d => d.isRequired).length)
const requiredReceivedCount = computed(() => docList.value.filter(d => d.isRequired && d.isReceived).length)

async function loadChecklist() {
  checklistLoading.value = true
  docList.value = await ShipmentDocumentService.list(props.shipment.id) ?? []
  checklistLoading.value = false
}

const allDocTypes = [
  { value: 'CI',                  title: 'Commercial Invoice' },
  { value: 'PL',                  title: 'Packing List' },
  { value: 'BL',                  title: 'Bill of Lading / AWB' },
  { value: 'COO',                 title: 'Certificate of Origin' },
  { value: 'LC',                  title: 'Letter of Credit' },
  { value: 'ISF',                 title: 'ISF Filing' },
  { value: 'CUSTOMS_ENTRY',       title: 'Customs Entry' },
  { value: 'ARRIVAL_NOTICE',      title: 'Arrival Notice' },
  { value: 'DO',                  title: 'Delivery Order' },
  { value: 'SLI',                 title: 'Shipper Letter of Instruction' },
  { value: 'INSURANCE',           title: 'Insurance Certificate' },
  { value: 'FUMIGATION',          title: 'Fumigation Certificate' },
  { value: 'PHYTO',               title: 'Phytosanitary Certificate' },
  { value: 'HEALTH',              title: 'Health Certificate' },
  { value: 'MSDS',                title: 'MSDS / Safety Data Sheet' },
  { value: 'DANGEROUS_GOODS_DECL', title: 'Dangerous Goods Declaration' },
  { value: 'TELEX_RELEASE',       title: 'Telex Release' },
  { value: 'SEAWAY_BILL',         title: 'Sea Waybill' },
  { value: 'DELIVERY_DOCKET',     title: 'Delivery Docket' },
]

// Add optional doc
const addDocDialog = ref(false)
const addDocType = ref('')
const addDocSaving = ref(false)

async function addDoc() {
  if (!addDocType.value) return
  addDocSaving.value = true
  await ShipmentDocumentService.create(props.shipment.id, { docType: addDocType.value, isRequired: false })
  addDocDialog.value = false
  addDocType.value = ''
  addDocSaving.value = false
  await loadChecklist()
}

// Edit doc details
const editDocDialog = ref(false)
const editingDoc = ref(null)
const editDocSaving = ref(false)

function openEditDoc(doc) {
  editingDoc.value = { ...doc }
  editDocDialog.value = true
}

async function saveEditDoc() {
  editDocSaving.value = true
  await ShipmentDocumentService.update(props.shipment.id, editingDoc.value.id, {
    docReference: editingDoc.value.docReference,
    issueDate:    editingDoc.value.issueDate,
    expiryDate:   editingDoc.value.expiryDate,
    remarks:      editingDoc.value.remarks,
  })
  editDocDialog.value = false
  editDocSaving.value = false
  await loadChecklist()
}

async function toggleReceived(doc) {
  await ShipmentDocumentService.update(props.shipment.id, doc.id, { isReceived: !doc.isReceived })
  await loadChecklist()
}

async function deleteDoc(doc) {
  const ok = await useAppStore().confirm.open(
    $gettext('Remove Document'),
    $gettext('Remove this document entry from the checklist?'),
    { color: 'warning' }
  )
  if (!ok) return
  await ShipmentDocumentService.delete(props.shipment.id, doc.id)
  await loadChecklist()
}

// PDF generation
const isAir = computed(() => props.shipment?.quote?.transportType === TransportType.AIR)

const PDF_DOC_TYPES = ['HBL', 'HAWB', 'PACKING_LIST', 'BL', 'PL']

function canGeneratePdf(docType) {
  return PDF_DOC_TYPES.includes(docType)
}

function downloadDocPdf(doc, language) {
  if (!props.shipment?.instruction?.id) return
  const dt = doc.docType
  let url
  if (dt === 'PACKING_LIST' || dt === 'PL') {
    url = InstructionService.downloadPackingListPdf(props.shipment, language)
  } else if (dt === 'HAWB' || (dt === 'HBL' && isAir.value) || (dt === 'BL' && isAir.value)) {
    url = InstructionService.downloadHawbPdf(props.shipment, language)
  } else {
    url = InstructionService.downloadPdf(props.shipment, language)
  }
  window.open(url, '_blank')
}

// Per-row file attachment
const attachDocDialog = ref(false)
const attachTargetId = ref(null)
const attachFile = ref(null)
const attachSaving = ref(false)

function openAttachDoc(doc) {
  attachTargetId.value = doc.id
  attachFile.value = null
  attachDocDialog.value = true
}

async function saveAttach() {
  if (!attachFile.value?.id) return
  attachSaving.value = true
  await ShipmentDocumentService.update(props.shipment.id, attachTargetId.value, { mediaId: attachFile.value.id })
  attachDocDialog.value = false
  attachSaving.value = false
  await loadChecklist()
}

// ─── Legacy attachments ──────────────────────────────────────────────────────
const dialog = ref(false)
const saving = ref(false)
const editingId = ref(null)
const uploadedFile = ref(null)
const formCategory = ref('')
const formNote = ref('')

const categoryItems = [
  { title: $gettext('None'), value: '' },
  { title: 'MAWB', value: 'MAWB' },
  { title: $gettext('Others'), value: 'OTHERS' },
]

const canSave = computed(() =>
  editingId.value ? true : uploadedFile.value?.status === 'done'
)

function openNew() {
  editingId.value = null
  uploadedFile.value = null
  formCategory.value = ''
  formNote.value = ''
  dialog.value = true
}

function openEdit(file) {
  editingId.value = file.id
  uploadedFile.value = null
  formCategory.value = file.category ?? ''
  formNote.value = file.note ?? ''
  dialog.value = true
}

async function save() {
  const id = editingId.value ?? uploadedFile.value?.id
  if (!id) return
  saving.value = true
  const result = await MediaService.update(id, {
    parentId: props.shipment.id,
    parentType: 'shipment',
    parentProperty: 'document',
    note: formNote.value || null,
    category: formCategory.value || null,
  })
  saving.value = false
  if (!result?.id) return
  dialog.value = false
  emit('shipmentChanged')
}

async function deleteEntity(id, btn) {
  const confirmed = await useAppStore().confirm.open(
    $gettext('Confirm your action'),
    $gettext('Do you want to permanently delete this file? You might need to download and backup this file first.'),
    { color: 'warning' }
  )
  if (!confirmed) {
    btn.disabled = false
    return
  }
  btn.addToQueuingList()
  const result = await MediaService.delete(id, {
    parentId: props.shipment.id,
    parentType: 'shipment',
    parentProperty: 'document',
  })
  if (result.error) return
  emit('shipmentChanged')
}

onMounted(loadChecklist)
</script>

<template>
  <div>
    <!-- Document Checklist -->
    <VCard variant="outlined">
      <VCardTitle class="d-flex align-center px-4 pt-3 pb-0">
        <VIcon icon="tabler-checklist" size="18" class="me-2" />
        {{ $gettext('Document Checklist') }}
        <VChip
          size="x-small" class="ms-2"
          :color="requiredCount > 0 && requiredReceivedCount === requiredCount ? 'success' : 'warning'"
        >
          {{ requiredReceivedCount }}/{{ requiredCount }} {{ $gettext('required') }}
        </VChip>
        <VSpacer />
        <VBtn v-if="shipmentEditable" size="small" variant="outlined" @click="addDocDialog = true">
          <VIcon start icon="tabler-plus" size="14" />{{ $gettext('Add') }}
        </VBtn>
      </VCardTitle>

      <VCardText class="pt-2 px-0">
        <div v-if="!checklistLoading && docList.length === 0" class="text-caption text-disabled px-4 py-2">
          {{ $gettext('No documents configured. Required documents are generated when the shipment becomes Active.') }}
        </div>

        <VTable v-else density="compact">
          <thead>
            <tr>
              <th>{{ $gettext('Type') }}</th>
              <th>{{ $gettext('Reference') }}</th>
              <th>{{ $gettext('Status') }}</th>
              <th>{{ $gettext('Issue Date') }}</th>
              <th>{{ $gettext('Expiry') }}</th>
              <th>{{ $gettext('File') }}</th>
              <th v-if="shipmentEditable" style="width:120px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doc in docList" :key="doc.id">
              <td>
                <VIcon
                  :icon="doc.isRequired ? 'tabler-star-filled' : 'tabler-star'"
                  size="12"
                  :color="doc.isRequired ? 'warning' : 'default'"
                  class="me-1"
                />
                <span class="text-body-2">{{ doc.docTypeLabel }}</span>
              </td>
              <td class="text-caption text-medium-emphasis">{{ doc.docReference ?? '—' }}</td>
              <td>
                <VChip
                  size="x-small"
                  :color="doc.isReceived ? 'success' : 'default'"
                  :prepend-icon="doc.isReceived ? 'tabler-circle-check' : 'tabler-clock'"
                >
                  {{ doc.isReceived ? $gettext('Received') : $gettext('Pending') }}
                </VChip>
              </td>
              <td class="text-caption text-medium-emphasis">{{ doc.issueDate ?? '—' }}</td>
              <td class="text-caption text-medium-emphasis">{{ doc.expiryDate ?? '—' }}</td>
              <td>
                <a
                  v-if="doc.media"
                  :href="doc.media.path"
                  target="_blank"
                  class="d-flex align-center text-caption gap-1"
                >
                  <VIcon icon="tabler-file" size="13" />{{ $gettext('View') }}
                </a>
                <span v-else class="text-caption text-disabled">—</span>
              </td>
              <td v-if="shipmentEditable">
                <VBtn
                  icon size="x-small" variant="plain"
                  :color="doc.isReceived ? 'default' : 'success'"
                  :title="doc.isReceived ? $gettext('Mark Pending') : $gettext('Mark Received')"
                  @click="toggleReceived(doc)"
                >
                  <VIcon :icon="doc.isReceived ? 'tabler-x' : 'tabler-check'" size="14" />
                </VBtn>
                <VBtn icon size="x-small" variant="plain" :title="$gettext('Edit details')" @click="openEditDoc(doc)">
                  <VIcon icon="tabler-pencil" size="14" />
                </VBtn>
                <VBtn icon size="x-small" variant="plain" :title="$gettext('Attach file')" @click="openAttachDoc(doc)">
                  <VIcon icon="tabler-upload" size="14" />
                </VBtn>
                <VMenu v-if="canGeneratePdf(doc.docType) && shipment.instruction?.id">
                  <template #activator="{ props: menuProps }">
                    <VBtn
                      v-bind="menuProps"
                      icon size="x-small" variant="plain" color="primary"
                      :title="$gettext('Generate PDF')"
                    >
                      <VIcon icon="tabler-file-download" size="14" />
                    </VBtn>
                  </template>
                  <VList density="compact">
                    <VListItem @click="downloadDocPdf(doc, 'en')">
                      <VListItemTitle class="text-caption">English</VListItemTitle>
                    </VListItem>
                    <VListItem @click="downloadDocPdf(doc, 'vi')">
                      <VListItemTitle class="text-caption">Vietnamese</VListItemTitle>
                    </VListItem>
                  </VList>
                </VMenu>
                <VBtn
                  v-if="!doc.isRequired"
                  icon size="x-small" variant="plain" color="error"
                  :title="$gettext('Remove')"
                  @click="deleteDoc(doc)"
                >
                  <VIcon icon="tabler-trash" size="14" />
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
    </VCard>

    <!-- Legacy attachments -->
    <VCard variant="outlined" class="mt-4">
      <VCardTitle class="d-flex align-center px-4 pt-3 pb-0">
        <VIcon icon="tabler-paperclip" size="18" class="me-2" />
        {{ $gettext('Attachments') }}
      </VCardTitle>
      <VCardText class="pt-0 px-0">
        <AppTableInline :headers="headers()" :items="shipment.documents">
          <template #buttons>
            <VBtn
              v-if="$can('PUT_Documents', 'Shipment') && shipmentEditable"
              size="small"
              @click="openNew"
            >
              <VIcon icon="tabler-plus" class="ms-n2 me-1" size="21" />
              {{ $gettext('Upload Document') }}
            </VBtn>
          </template>
          <template #action="{ item }">
            <v-btn
              :title="$gettext('download')"
              @click="MediaService.download(item.id)"
              class="mx-0 px-0 ms-n2" variant="text" size="x-small"
            >
              <VIcon icon="tabler-download" size="18" />
            </v-btn>
            <v-btn
              v-if="$can('PUT_Documents', 'Shipment') && shipmentEditable"
              :title="$gettext('edit')"
              @click="openEdit(item)"
              class="mx-0 px-0 ms-n2" variant="text" size="x-small"
            >
              <VIcon icon="tabler-pencil" size="18" />
            </v-btn>
            <SubmitBtn
              v-if="$can('PUT_Documents', 'Shipment') && shipmentEditable"
              @click="deleteEntity(item.id, $refs['delete-' + item.id])"
              :title="$gettext('delete')"
              class="mx-0 px-0 ms-n2 me-n3" variant="text"
              :autoQueue="false"
              :ref="'delete-' + item.id"
              size="x-small"
            >
              <VIcon icon="tabler-trash" size="18" />
            </SubmitBtn>
          </template>
        </AppTableInline>
      </VCardText>
    </VCard>

    <!-- Legacy upload dialog -->
    <VDialog v-model="dialog" max-width="540" persistent>
      <VCard>
        <VCardTitle class="pt-4 px-4">
          {{ editingId ? $gettext('Edit Document') : $gettext('Upload Document') }}
        </VCardTitle>
        <VCardText class="px-4">
          <template v-if="!editingId">
            <Uploader v-model="uploadedFile" :uploadInstantly="true" :single="true" accept="*/*" />
            <VDivider class="my-4" />
          </template>
          <VSelect
            v-model="formCategory"
            :items="categoryItems"
            item-title="title"
            item-value="value"
            :label="$gettext('Type')"
            class="mb-3"
          />
          <VTextarea v-model="formNote" :label="$gettext('Note')" rows="3" auto-grow />
        </VCardText>
        <VCardActions class="px-4 pb-4">
          <VSpacer />
          <VBtn variant="outlined" @click="dialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="primary" :loading="saving" :disabled="!canSave" @click="save">
            {{ $gettext('Save') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Add optional doc type dialog -->
    <VDialog v-model="addDocDialog" max-width="420">
      <VCard :title="$gettext('Add Document to Checklist')">
        <VCardText>
          <VSelect
            v-model="addDocType"
            :items="allDocTypes"
            item-title="title"
            item-value="value"
            :label="$gettext('Document Type')"
            density="compact"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="addDocDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="primary" :loading="addDocSaving" :disabled="!addDocType" @click="addDoc">
            {{ $gettext('Add') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Edit doc details dialog -->
    <VDialog v-model="editDocDialog" max-width="480">
      <VCard v-if="editingDoc" :title="editingDoc.docTypeLabel">
        <VCardText>
          <VTextField
            v-model="editingDoc.docReference"
            :label="$gettext('Reference / Number')"
            density="compact"
            class="mb-3"
          />
          <VRow dense>
            <VCol cols="6">
              <VTextField
                v-model="editingDoc.issueDate"
                type="date"
                :label="$gettext('Issue Date')"
                density="compact"
              />
            </VCol>
            <VCol cols="6">
              <VTextField
                v-model="editingDoc.expiryDate"
                type="date"
                :label="$gettext('Expiry Date')"
                density="compact"
              />
            </VCol>
          </VRow>
          <VTextarea
            v-model="editingDoc.remarks"
            :label="$gettext('Remarks')"
            rows="3"
            density="compact"
            class="mt-3"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="editDocDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="primary" :loading="editDocSaving" @click="saveEditDoc">{{ $gettext('Save') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Attach file to checklist row dialog -->
    <VDialog v-model="attachDocDialog" max-width="500">
      <VCard :title="$gettext('Attach File')">
        <VCardText>
          <Uploader v-model="attachFile" :uploadInstantly="true" :single="true" accept="*/*" />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="attachDocDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn
            color="primary"
            :loading="attachSaving"
            :disabled="attachFile?.status !== 'done'"
            @click="saveAttach"
          >
            {{ $gettext('Attach') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
