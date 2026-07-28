<script setup>
import { enums as ShipmentStatus } from '@/config/enums/ShipmentStatus'
import ShipmentMilestoneService from '@/services/ShipmentMilestoneService'
import { useAppStore } from '@/stores/appStore'

const props = defineProps({
  shipment: { type: Object, required: true },
})

const editable = computed(() =>
  props.shipment
    && props.shipment.status !== ShipmentStatus.Completed
    && props.shipment.status !== ShipmentStatus.Cancelled
)

const ALL_CODES = [
  { value: 'CARGO_BOOKED',     label: 'Cargo Booked' },
  { value: 'CARGO_READY',      label: 'Cargo Ready' },
  { value: 'EMPTY_RELEASED',   label: 'Empty Released' },
  { value: 'GATE_IN',          label: 'Gate In' },
  { value: 'VGM_SUBMITTED',    label: 'VGM Submitted' },
  { value: 'SI_SUBMITTED',     label: 'SI Submitted' },
  { value: 'ON_BOARD',         label: 'On Board (BL Date)' },
  { value: 'VESSEL_DEPARTED',  label: 'Vessel Departed' },
  { value: 'AT_TRANSSHIPMENT', label: 'At Transshipment' },
  { value: 'VESSEL_ARRIVED',   label: 'Vessel Arrived' },
  { value: 'DISCHARGED',       label: 'Discharged' },
  { value: 'AVAILABLE',        label: 'Available' },
  { value: 'ENTRY_FILED',      label: 'Customs Entry Filed' },
  { value: 'CUSTOMS_RELEASED', label: 'Customs Released' },
  { value: 'GATE_OUT',         label: 'Gate Out' },
  { value: 'DELIVERED',        label: 'Delivered' },
  { value: 'POD_RECEIVED',     label: 'POD Received' },
  { value: 'EMPTY_RETURNED',   label: 'Empty Returned' },
  { value: 'CARGO_ACCEPTED',   label: 'Cargo Accepted (Air)' },
  { value: 'FLIGHT_DEPARTED',  label: 'Flight Departed' },
  { value: 'FLIGHT_ARRIVED',   label: 'Flight Arrived' },
  { value: 'PICKUP_COMPLETED', label: 'Pickup Completed' },
  { value: 'IN_TRANSIT',       label: 'In Transit' },
  { value: 'BORDER_CROSSED',   label: 'Border Crossed' },
]

const milestones = ref([])
const loading = ref(false)

async function load() {
  loading.value = true
  milestones.value = await ShipmentMilestoneService.list(props.shipment.id) ?? []
  loading.value = false
}

const exceptionCount = computed(() => milestones.value.filter(m => m.isException).length)
const overdueCount = computed(() => {
  const now = Date.now()
  return milestones.value.filter(m => !m.actualDate && m.plannedDate && new Date(m.plannedDate) < now).length
})

function milestoneState(m) {
  if (m.actualDate) {
    if (m.isException)      return { color: 'error',   icon: 'tabler-alert-circle-filled' }
    if (m.exceptionHours !== null && m.exceptionHours < 0)
                            return { color: 'info',    icon: 'tabler-circle-check-filled' }
    return                         { color: 'success', icon: 'tabler-circle-check-filled' }
  }
  if (m.plannedDate && new Date(m.plannedDate) < Date.now()) {
    return { color: 'warning', icon: 'tabler-alert-triangle-filled' }
  }
  return { color: 'default', icon: 'tabler-circle-dotted' }
}

function formatDt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ─── Mark Actual dialog ───────────────────────────────────────────────────────
const markDialog = ref(false)
const markTarget = ref(null)
const markActualDate = ref('')
const markRemarks = ref('')
const markSaving = ref(false)

function openMark(m) {
  markTarget.value = m
  markActualDate.value = m.actualDate ? m.actualDate.slice(0, 16) : new Date().toISOString().slice(0, 16)
  markRemarks.value = m.remarks ?? ''
  markDialog.value = true
}

async function saveMark() {
  markSaving.value = true
  await ShipmentMilestoneService.update(props.shipment.id, markTarget.value.id, {
    actualDate: markActualDate.value ? new Date(markActualDate.value).toISOString() : null,
    remarks: markRemarks.value || null,
  })
  markDialog.value = false
  markSaving.value = false
  await load()
}

// ─── Add Milestone dialog ─────────────────────────────────────────────────────
const addDialog = ref(false)
const addForm = ref({ milestoneCode: '', plannedDate: '', actualDate: '', remarks: '' })
const addSaving = ref(false)

const assignedCodes = computed(() => new Set(milestones.value.map(m => m.milestoneCode)))
const availableCodes = computed(() => ALL_CODES.filter(c => !assignedCodes.value.has(c.value)))

function openAdd() {
  addForm.value = { milestoneCode: '', plannedDate: '', actualDate: '', remarks: '' }
  addDialog.value = true
}

async function saveAdd() {
  if (!addForm.value.milestoneCode) return
  addSaving.value = true
  await ShipmentMilestoneService.upsert(props.shipment.id, {
    milestoneCode: addForm.value.milestoneCode,
    plannedDate: addForm.value.plannedDate ? new Date(addForm.value.plannedDate).toISOString() : null,
    actualDate:  addForm.value.actualDate  ? new Date(addForm.value.actualDate).toISOString()  : null,
    remarks: addForm.value.remarks || null,
    source: 'MANUAL',
  })
  addDialog.value = false
  addSaving.value = false
  await load()
}

async function removeMilestone(m) {
  const ok = await useAppStore().confirm.open(
    $gettext('Remove Milestone'),
    $gettext('Remove "%{name}" milestone?', { name: m.description }),
    { color: 'warning' }
  )
  if (!ok) return
  await ShipmentMilestoneService.delete(props.shipment.id, m.id)
  await load()
}

onMounted(load)
</script>

<template>
  <div>
    <!-- Summary bar -->
    <div class="d-flex align-center gap-3 mb-4">
      <VChip v-if="exceptionCount > 0" color="error" size="small" prepend-icon="tabler-alert-circle">
        {{ exceptionCount }} {{ $gettext('late') }}
      </VChip>
      <VChip v-if="overdueCount > 0" color="warning" size="small" prepend-icon="tabler-alert-triangle">
        {{ overdueCount }} {{ $gettext('overdue') }}
      </VChip>
      <span v-if="!exceptionCount && !overdueCount" class="text-caption text-medium-emphasis">
        {{ $gettext('No exceptions') }}
      </span>
      <VSpacer />
      <VBtn v-if="editable" size="small" variant="outlined" @click="openAdd">
        <VIcon start icon="tabler-plus" size="14" />{{ $gettext('Add Milestone') }}
      </VBtn>
    </div>

    <!-- Timeline -->
    <div v-if="milestones.length === 0 && !loading" class="text-caption text-disabled text-center py-6">
      {{ $gettext('No milestones yet.') }}
    </div>

    <div class="milestone-timeline">
      <div
        v-for="(m, i) in milestones"
        :key="m.id"
        class="milestone-row d-flex gap-3"
        :class="{ 'mb-1': i < milestones.length - 1 }"
      >
        <!-- Icon column -->
        <div class="d-flex flex-column align-center" style="width:28px;flex-shrink:0">
          <VIcon
            :icon="milestoneState(m).icon"
            :color="milestoneState(m).color"
            size="20"
          />
          <div v-if="i < milestones.length - 1" class="milestone-connector" />
        </div>

        <!-- Content -->
        <div class="flex-grow-1 pb-3">
          <div class="d-flex align-center flex-wrap gap-2 mb-1">
            <span class="text-body-2 font-weight-medium">{{ m.description }}</span>
            <VChip
              v-if="m.isSystem"
              size="x-small"
              color="default"
              label
            >SYSTEM</VChip>
            <VChip
              v-if="m.isException && m.exceptionHours !== null"
              size="x-small"
              color="error"
            >
              +{{ Math.abs(m.exceptionHours).toFixed(1) }}h {{ $gettext('late') }}
            </VChip>
            <VChip
              v-else-if="m.exceptionHours !== null && m.exceptionHours < 0"
              size="x-small"
              color="info"
            >
              {{ Math.abs(m.exceptionHours).toFixed(1) }}h {{ $gettext('early') }}
            </VChip>
            <VChip
              v-if="!m.actualDate && m.plannedDate && new Date(m.plannedDate) < Date.now()"
              size="x-small"
              color="warning"
            >{{ $gettext('Overdue') }}</VChip>
          </div>

          <div class="d-flex flex-wrap gap-x-4 text-caption text-medium-emphasis">
            <span v-if="m.plannedDate">
              <VIcon icon="tabler-calendar-event" size="12" class="me-1" />
              {{ $gettext('Planned:') }} {{ formatDt(m.plannedDate) }}
            </span>
            <span v-if="m.actualDate" :class="{ 'text-success': !m.isException, 'text-error': m.isException }">
              <VIcon icon="tabler-calendar-check" size="12" class="me-1" />
              {{ $gettext('Actual:') }} {{ formatDt(m.actualDate) }}
            </span>
            <span v-if="m.updatedBy">
              <VIcon icon="tabler-user" size="12" class="me-1" />{{ m.updatedBy.name }}
            </span>
          </div>

          <div v-if="m.remarks" class="text-caption text-medium-emphasis mt-1 fst-italic">
            {{ m.remarks }}
          </div>

          <div v-if="editable && !m.isSystem" class="d-flex gap-1 mt-1">
            <VBtn
              size="x-small"
              variant="text"
              :color="m.actualDate ? 'default' : 'primary'"
              @click="openMark(m)"
            >
              <VIcon start icon="tabler-calendar-check" size="13" />
              {{ m.actualDate ? $gettext('Edit actual') : $gettext('Mark actual') }}
            </VBtn>
            <VBtn size="x-small" variant="text" color="error" @click="removeMilestone(m)">
              <VIcon start icon="tabler-trash" size="13" />{{ $gettext('Remove') }}
            </VBtn>
          </div>
        </div>
      </div>
    </div>

    <!-- Mark Actual dialog -->
    <VDialog v-model="markDialog" max-width="440">
      <VCard v-if="markTarget" :title="markTarget.description">
        <VCardText>
          <VTextField
            v-model="markActualDate"
            type="datetime-local"
            :label="$gettext('Actual date / time')"
            density="compact"
            class="mb-3"
          />
          <VTextarea
            v-model="markRemarks"
            :label="$gettext('Remarks (vessel, flight, reference…)')"
            rows="3"
            density="compact"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="markDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="primary" :loading="markSaving" @click="saveMark">{{ $gettext('Save') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Add Milestone dialog -->
    <VDialog v-model="addDialog" max-width="480">
      <VCard :title="$gettext('Add Milestone')">
        <VCardText>
          <VSelect
            v-model="addForm.milestoneCode"
            :items="availableCodes"
            item-title="label"
            item-value="value"
            :label="$gettext('Milestone')"
            density="compact"
            class="mb-3"
          />
          <VRow dense>
            <VCol cols="6">
              <VTextField
                v-model="addForm.plannedDate"
                type="datetime-local"
                :label="$gettext('Planned date')"
                density="compact"
              />
            </VCol>
            <VCol cols="6">
              <VTextField
                v-model="addForm.actualDate"
                type="datetime-local"
                :label="$gettext('Actual date')"
                density="compact"
              />
            </VCol>
          </VRow>
          <VTextarea
            v-model="addForm.remarks"
            :label="$gettext('Remarks')"
            rows="2"
            density="compact"
            class="mt-3"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="addDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn
            color="primary"
            :loading="addSaving"
            :disabled="!addForm.milestoneCode"
            @click="saveAdd"
          >{{ $gettext('Add') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.milestone-connector {
  width: 2px;
  flex: 1;
  min-height: 12px;
  background: rgba(var(--v-border-color), var(--v-border-opacity));
  margin-top: 2px;
}
</style>
