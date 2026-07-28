<script setup>
import ShipmentNoteService from '@/services/ShipmentNoteService'

const props = defineProps({
  shipment: { type: Object, required: true },
})

const notes = ref([])
const loading = ref(false)
const composing = ref({ noteType: 'INTERNAL', body: '', isPinned: false, visibleTo: 'INTERNAL' })
const submitting = ref(false)

const noteTypes = [
  { value: 'INTERNAL', title: $gettext('Internal') },
  { value: 'CUSTOMER', title: $gettext('Customer') },
  { value: 'AGENT',    title: $gettext('Agent') },
]
const visibilityOptions = [
  { value: 'INTERNAL', title: $gettext('Internal only') },
  { value: 'CUSTOMER', title: $gettext('Customer') },
  { value: 'ALL',      title: $gettext('All parties') },
]

const typeColor = {
  INTERNAL: 'secondary',
  CUSTOMER: 'primary',
  AGENT: 'warning',
  SYSTEM: 'purple',
}
const typeIcon = {
  INTERNAL: 'tabler-lock',
  CUSTOMER: 'tabler-user',
  AGENT: 'tabler-world',
  SYSTEM: 'tabler-robot',
}

async function load() {
  loading.value = true
  notes.value = await ShipmentNoteService.list(props.shipment.id) ?? []
  loading.value = false
}

async function submitNote() {
  if (!composing.value.body.trim()) return
  submitting.value = true
  await ShipmentNoteService.create(props.shipment.id, composing.value)
  composing.value = { noteType: 'INTERNAL', body: '', isPinned: false, visibleTo: 'INTERNAL' }
  await load()
  submitting.value = false
}

async function togglePin(note) {
  await ShipmentNoteService.update(props.shipment.id, note.id, { isPinned: !note.isPinned })
  await load()
}

async function deleteNote(note) {
  await ShipmentNoteService.delete(props.shipment.id, note.id)
  await load()
}

function formatDate(iso) {
  return new Date(iso).toLocaleString()
}

onMounted(load)
</script>

<template>
  <div>
    <VCard variant="outlined" class="mb-4">
      <VCardText>
        <VRow dense>
          <VCol cols="12" sm="4">
            <VSelect
              v-model="composing.noteType"
              :items="noteTypes"
              item-title="title"
              item-value="value"
              :label="$gettext('Type')"
              density="compact"
              hide-details
            />
          </VCol>
          <VCol cols="12" sm="4">
            <VSelect
              v-model="composing.visibleTo"
              :items="visibilityOptions"
              item-title="title"
              item-value="value"
              :label="$gettext('Visible to')"
              density="compact"
              hide-details
            />
          </VCol>
          <VCol cols="12" sm="4" class="d-flex align-center">
            <VCheckbox v-model="composing.isPinned" :label="$gettext('Pin note')" density="compact" hide-details />
          </VCol>
          <VCol cols="12">
            <VTextarea
              v-model="composing.body"
              :label="$gettext('Note')"
              :placeholder="$gettext('Write a note...')"
              rows="3"
              auto-grow
              density="compact"
              hide-details
            />
          </VCol>
          <VCol cols="12" class="d-flex justify-end">
            <VBtn
              color="primary" size="small"
              :loading="submitting"
              :disabled="!composing.body.trim()"
              @click="submitNote"
            >
              {{ $gettext('Add Note') }}
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <div v-if="loading" class="text-center py-4">
      <VProgressCircular indeterminate />
    </div>

    <div v-for="note in notes" :key="note.id" class="mb-3">
      <VCard :variant="note.isPinned ? 'tonal' : 'outlined'" :color="note.isPinned ? 'primary' : undefined">
        <VCardText class="py-2 px-3">
          <div class="d-flex align-center gap-2 mb-1">
            <VChip :color="typeColor[note.noteType]" size="x-small" label>
              <VIcon :icon="typeIcon[note.noteType]" size="12" start />
              {{ note.noteType }}
            </VChip>
            <VChip v-if="note.visibleTo !== 'INTERNAL'" size="x-small" variant="outlined">
              {{ note.visibleTo }}
            </VChip>
            <VIcon v-if="note.isPinned" icon="tabler-pin" size="14" color="primary" />
            <VSpacer />
            <span class="text-caption text-disabled">
              {{ note.createdBy ? [note.createdBy.firstName, note.createdBy.lastName].join(' ') : 'System' }}
              · {{ formatDate(note.createdAt) }}
            </span>
            <VBtn
              v-if="note.noteType !== 'SYSTEM'"
              icon size="x-small" variant="plain"
              :color="note.isPinned ? 'primary' : 'secondary'"
              @click="togglePin(note)"
            >
              <VIcon icon="tabler-pin" size="14" />
              <VTooltip activator="parent" location="top">
                {{ note.isPinned ? $gettext('Unpin') : $gettext('Pin') }}
              </VTooltip>
            </VBtn>
            <VBtn
              v-if="note.noteType !== 'SYSTEM'"
              icon size="x-small" variant="plain" color="error"
              @click="deleteNote(note)"
            >
              <VIcon icon="tabler-trash" size="14" />
            </VBtn>
          </div>
          <div class="text-body-2" style="white-space: pre-wrap">{{ note.body }}</div>
        </VCardText>
      </VCard>
    </div>

    <div v-if="!loading && notes.length === 0" class="text-center text-disabled py-6">
      {{ $gettext('No notes yet.') }}
    </div>
  </div>
</template>
