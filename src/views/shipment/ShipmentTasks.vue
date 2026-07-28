<script setup>
import { enums as ShipmentStatus } from '@/config/enums/ShipmentStatus'
import ShipmentTaskService from '@/services/ShipmentTaskService'
import { useAppStore } from '@/stores/appStore'

const props = defineProps({
  shipment: { type: Object, required: true },
})

const editable = computed(() =>
  props.shipment
    && props.shipment.status !== ShipmentStatus.Completed
    && props.shipment.status !== ShipmentStatus.Cancelled
)

const TASK_TYPES = [
  { value: 'DOCUMENT',  label: 'Document',   color: 'primary' },
  { value: 'BOOKING',   label: 'Booking',    color: 'indigo' },
  { value: 'CUSTOMS',   label: 'Customs',    color: 'orange' },
  { value: 'INVOICE',   label: 'Invoice',    color: 'green' },
  { value: 'FOLLOW_UP', label: 'Follow-Up',  color: 'teal' },
  { value: 'TRANSPORT', label: 'Transport',  color: 'brown' },
  { value: 'OTHER',     label: 'Other',      color: 'default' },
]

function typeConfig(val) {
  return TASK_TYPES.find(t => t.value === val) ?? { label: val, color: 'default' }
}

const tasks = ref([])
const filterStatus = ref('all')

async function load() {
  tasks.value = await ShipmentTaskService.list(props.shipment.id) ?? []
}

// Progress stats
const totalCount     = computed(() => tasks.value.length)
const completedCount = computed(() => tasks.value.filter(t => t.completedAt).length)
const mandatoryLeft  = computed(() => tasks.value.filter(t => t.isMandatory && !t.completedAt).length)
const overdueCount   = computed(() => tasks.value.filter(t => t.isOverdue).length)

// Filter
const filteredTasks = computed(() => {
  const all = tasks.value
  if (filterStatus.value === 'pending')   return all.filter(t => !t.completedAt && !t.isOverdue)
  if (filterStatus.value === 'overdue')   return all.filter(t => t.isOverdue)
  if (filterStatus.value === 'completed') return all.filter(t => t.completedAt)
  return all
})

// Group by milestone gate
const groups = computed(() => {
  const gated = {}
  const ungated = []
  for (const task of filteredTasks.value) {
    if (task.milestoneGate) {
      if (!gated[task.milestoneGate]) gated[task.milestoneGate] = []
      gated[task.milestoneGate].push(task)
    } else {
      ungated.push(task)
    }
  }
  const result = Object.entries(gated).map(([gate, items]) => ({
    gate,
    label: gateName(gate),
    items,
    allDone: items.filter(t => t.isMandatory).every(t => t.completedAt),
    hasMandatoryPending: items.some(t => t.isMandatory && !t.completedAt),
  }))
  if (ungated.length) result.push({ gate: null, label: 'Other Tasks', items: ungated, allDone: false, hasMandatoryPending: false })
  return result
})

const GATE_LABELS = {
  CARGO_BOOKED: 'Before: Cargo Booked', CARGO_READY: 'Before: Cargo Ready',
  EMPTY_RELEASED: 'Before: Empty Released', GATE_IN: 'Before: Gate In',
  VGM_SUBMITTED: 'Before: VGM Submitted', SI_SUBMITTED: 'Before: SI Submitted',
  ON_BOARD: 'Before: On Board', VESSEL_DEPARTED: 'Before: Vessel Departed',
  VESSEL_ARRIVED: 'Before: Vessel Arrived', DISCHARGED: 'Before: Discharged',
  CUSTOMS_RELEASED: 'Before: Customs Released', DELIVERED: 'Before: Delivered',
  POD_RECEIVED: 'Before: POD Received', FLIGHT_DEPARTED: 'Before: Flight Departed',
  FLIGHT_ARRIVED: 'Before: Flight Arrived', CARGO_ACCEPTED: 'Before: Cargo Accepted',
  PICKUP_COMPLETED: 'Before: Pickup Completed', BORDER_CROSSED: 'Before: Border Crossed',
}
function gateName(gate) { return GATE_LABELS[gate] ?? `Before: ${gate}` }

// Complete / reopen
async function toggleComplete(task) {
  if (task.completedAt) {
    await ShipmentTaskService.reopen(props.shipment.id, task.id)
  } else {
    await ShipmentTaskService.complete(props.shipment.id, task.id)
  }
  await load()
}

// Delete
async function removeTask(task) {
  const ok = await useAppStore().confirm.open(
    $gettext('Remove Task'),
    $gettext('Remove "%{title}"?', { title: task.title }),
    { color: 'warning' }
  )
  if (!ok) return
  await ShipmentTaskService.delete(props.shipment.id, task.id)
  await load()
}

// Add task dialog
const addDialog = ref(false)
const addForm = ref({ title: '', taskType: 'OTHER', isMandatory: false, milestoneGate: '', dueDate: '' })
const addSaving = ref(false)

function openAdd() {
  addForm.value = { title: '', taskType: 'OTHER', isMandatory: false, milestoneGate: '', dueDate: '' }
  addDialog.value = true
}

async function saveAdd() {
  if (!addForm.value.title.trim()) return
  addSaving.value = true
  await ShipmentTaskService.create(props.shipment.id, {
    title:         addForm.value.title,
    taskType:      addForm.value.taskType,
    isMandatory:   addForm.value.isMandatory,
    milestoneGate: addForm.value.milestoneGate || null,
    dueDate:       addForm.value.dueDate ? new Date(addForm.value.dueDate).toISOString() : null,
  })
  addDialog.value = false
  addSaving.value = false
  await load()
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(load)
</script>

<template>
  <div>
    <!-- Progress widget -->
    <VCard variant="tonal" color="surface" class="mb-4 pa-3">
      <div class="d-flex align-center gap-4 flex-wrap">
        <div class="text-center">
          <div class="text-h6 font-weight-bold">{{ completedCount }}/{{ totalCount }}</div>
          <div class="text-caption text-medium-emphasis">{{ $gettext('tasks done') }}</div>
        </div>
        <VDivider vertical />
        <div class="text-center">
          <div class="text-h6 font-weight-bold" :class="mandatoryLeft > 0 ? 'text-warning' : 'text-success'">
            {{ mandatoryLeft }}
          </div>
          <div class="text-caption text-medium-emphasis">{{ $gettext('mandatory left') }}</div>
        </div>
        <VDivider vertical />
        <div class="text-center">
          <div class="text-h6 font-weight-bold" :class="overdueCount > 0 ? 'text-error' : ''">{{ overdueCount }}</div>
          <div class="text-caption text-medium-emphasis">{{ $gettext('overdue') }}</div>
        </div>
        <VSpacer />
        <VBtnToggle v-model="filterStatus" density="compact" rounded="lg" mandatory>
          <VBtn value="all"       size="small">{{ $gettext('All') }}</VBtn>
          <VBtn value="pending"   size="small">{{ $gettext('Pending') }}</VBtn>
          <VBtn value="overdue"   size="small" :color="overdueCount > 0 ? 'error' : ''">{{ $gettext('Overdue') }}</VBtn>
          <VBtn value="completed" size="small">{{ $gettext('Done') }}</VBtn>
        </VBtnToggle>
        <VBtn v-if="editable" size="small" color="primary" @click="openAdd">
          <VIcon start icon="tabler-plus" size="14" />{{ $gettext('Add Task') }}
        </VBtn>
      </div>
    </VCard>

    <!-- Task groups -->
    <div v-for="group in groups" :key="group.gate ?? '__ungated__'" class="mb-4">
      <!-- Gate header -->
      <div v-if="group.gate" class="d-flex align-center gap-2 mb-2 px-1">
        <VIcon
          :icon="group.allDone ? 'tabler-circle-check-filled' : group.hasMandatoryPending ? 'tabler-lock' : 'tabler-circle-dotted'"
          :color="group.allDone ? 'success' : group.hasMandatoryPending ? 'warning' : 'default'"
          size="16"
        />
        <span class="text-caption font-weight-medium text-medium-emphasis text-uppercase tracking-widest">
          {{ group.label }}
        </span>
        <VDivider class="flex-grow-1" />
      </div>

      <!-- Task rows -->
      <div
        v-for="task in group.items"
        :key="task.id"
        class="task-row d-flex align-start gap-2 py-2 px-2 rounded"
        :class="{ 'bg-success-lighten': task.completedAt, 'opacity-60': task.completedAt }"
      >
        <!-- Checkbox -->
        <VCheckbox
          :model-value="!!task.completedAt"
          density="compact"
          hide-details
          class="mt-n1 flex-shrink-0"
          :disabled="!editable"
          @update:model-value="toggleComplete(task)"
        />

        <!-- Content -->
        <div class="flex-grow-1">
          <div class="d-flex align-center flex-wrap gap-2">
            <span
              class="text-body-2"
              :class="{ 'text-decoration-line-through text-medium-emphasis': task.completedAt }"
            >
              {{ task.title }}
            </span>
            <VChip :color="typeConfig(task.taskType).color" size="x-small" label>
              {{ typeConfig(task.taskType).label }}
            </VChip>
            <VChip v-if="task.isMandatory" color="error" size="x-small" label variant="outlined">
              {{ $gettext('Required') }}
            </VChip>
            <VChip v-if="task.isOverdue" color="error" size="x-small">
              {{ $gettext('Overdue') }}
            </VChip>
          </div>
          <div class="d-flex flex-wrap gap-x-4 text-caption text-medium-emphasis mt-1">
            <span v-if="task.dueDate">
              <VIcon icon="tabler-calendar" size="12" class="me-1" />{{ formatDate(task.dueDate) }}
            </span>
            <span v-if="task.assignedTo">
              <VIcon icon="tabler-user" size="12" class="me-1" />{{ task.assignedTo.name }}
            </span>
            <span v-if="task.completedAt" class="text-success">
              <VIcon icon="tabler-check" size="12" class="me-1" />
              {{ $gettext('Done') }} {{ formatDate(task.completedAt) }}
              <template v-if="task.completedBy"> – {{ task.completedBy.name }}</template>
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="editable" class="d-flex gap-0 flex-shrink-0">
          <VBtn
            v-if="task.completedAt"
            icon size="x-small" variant="plain"
            :title="$gettext('Reopen')"
            @click="toggleComplete(task)"
          >
            <VIcon icon="tabler-rotate-clockwise" size="14" />
          </VBtn>
          <VBtn
            v-if="!task.isMandatory"
            icon size="x-small" variant="plain" color="error"
            :title="$gettext('Remove')"
            @click="removeTask(task)"
          >
            <VIcon icon="tabler-trash" size="14" />
          </VBtn>
        </div>
      </div>
    </div>

    <div v-if="groups.length === 0" class="text-caption text-disabled text-center py-6">
      {{ $gettext('No tasks yet.') }}
    </div>

    <!-- Add Task dialog -->
    <VDialog v-model="addDialog" max-width="500">
      <VCard :title="$gettext('Add Task')">
        <VCardText>
          <VTextField
            v-model="addForm.title"
            :label="$gettext('Title')"
            density="compact"
            class="mb-3"
          />
          <VRow dense>
            <VCol cols="6">
              <VSelect
                v-model="addForm.taskType"
                :items="TASK_TYPES"
                item-title="label"
                item-value="value"
                :label="$gettext('Type')"
                density="compact"
              />
            </VCol>
            <VCol cols="6">
              <VTextField
                v-model="addForm.dueDate"
                type="date"
                :label="$gettext('Due date')"
                density="compact"
              />
            </VCol>
          </VRow>
          <VSelect
            v-model="addForm.milestoneGate"
            :items="Object.entries(GATE_LABELS).map(([v,l]) => ({ value: v, title: l }))"
            item-title="title"
            item-value="value"
            :label="$gettext('Milestone gate (optional)')"
            density="compact"
            clearable
            class="mt-3"
          />
          <VCheckbox
            v-model="addForm.isMandatory"
            :label="$gettext('Mandatory (blocks milestone recording)')"
            density="compact"
            hide-details
            class="mt-2"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="addDialog = false">{{ $gettext('Cancel') }}</VBtn>
          <VBtn color="primary" :loading="addSaving" :disabled="!addForm.title.trim()" @click="saveAdd">
            {{ $gettext('Add') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
