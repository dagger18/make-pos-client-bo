<script setup>
import { getTitle } from '@/config/enums/ClientType';
import { findByValue as findCreditStatus, getList as creditStatusList } from '@/config/enums/CreditStatus';
import { getTitle as getResidenceType } from '@/config/enums/ResidenceType';
import { layout, makeDefaultEntity } from '@/config/forms/ClientGeneral';
import ClientService from '@/services/ClientService';
import { printDateTime, printMoney, printNullable } from '@/services/CommonService';
import { useGettext } from 'vue3-gettext';
const { $gettext } = useGettext()
const props = defineProps({
  client: { type: Object, default: () => {}}
})
const [modal, toggleModal] = useToggle()
const form = ref(null)
function edit() {
  toggleModal()
  nextTick(() => {
    form.value.setEntity(props.client)
  })
}
function entityPreSubmit (entity) {
  delete entity.documents
  return entity
}
const generalProps = [
  {'key': 'address','text': $gettext('Address')},
  {'key': 'city','text': $gettext('City')},
  {'key': 'province','text': $gettext('Province')},
  {'key': 'zipCode','text': $gettext('Zip Code')},
  {'key': 'country','text': $gettext('Country')},
  {'key': 'phone','text': $gettext('Phone')},
  {
    'key': 'establishmentDate',
    'text': $gettext('Establishment Date'),
    format(item) {
      return printDateTime(item.establishmentDate, 'DD/MM/YYYY')
    }
  },
  {
    'key': 'type',
    'text': $gettext('Client Type'),
    format(item) {
      return getTitle(item.type)
    }
  },
  {
    'key': 'residenceType',
    'text': $gettext('Residence Type'),
    format(item) {
      return getResidenceType(item.residenceType)
    }
  },
  {
    'key': 'priceMarkup',
    'text': $gettext('Pricing level'),
    format(item) {
      return item.priceMarkup?.name ?? null
    }},
  {'key': 'note','text': $gettext('Note')},
]
const creditDialogOpen = ref(false)
const creditStatusInput = ref('')
const creditHoldReasonInput = ref('')

async function saveCreditStatus() {
  await ClientService.updateCreditStatus(props.client.id, {
    creditStatus: creditStatusInput.value,
    creditHoldReason: creditHoldReasonInput.value || null,
    creditReviewedAt: new Date().toISOString().split('T')[0],
  })
  creditDialogOpen.value = false
  emit('clientChanged')
}
function openCreditDialog() {
  creditStatusInput.value = props.client.creditStatus
  creditHoldReasonInput.value = props.client.creditHoldReason ?? ''
  creditDialogOpen.value = true
}

const emit = defineEmits(['entitySubmitted', 'clientChanged'])
function entitySubmitted() {
  toggleModal()
  emit('entitySubmitted')
}

const creditCheck = ref(null)

async function loadCreditCheck() {
  if (props.client?.id) {
    try {
      creditCheck.value = await ClientService.getCreditCheck(props.client.id)
    } catch (e) {
      creditCheck.value = null
    }
  }
}

onMounted(loadCreditCheck)
watch(() => props.client?.id, loadCreditCheck)

const utilisationColor = computed(() => {
  if (!creditCheck.value) return 'primary'
  const d = creditCheck.value.decision
  if (d === 'HARD_BLOCK') return 'error'
  if (d === 'REQUIRE_APPROVAL') return 'error'
  if (d === 'WARN') return 'warning'
  return 'success'
})
</script>
<template>
  <VCard>
    <VCardText class="text-center pt-5 pb-0">

      <!-- 👉 Customer fullName -->
      <h4 class="text-h4  mt-4">
        {{ client.name }}
      </h4>
      <span class="text-sm">{{ $gettext("Client ID") }} #{{ client.code }}</span>
    </VCardText>

    <!-- 👉 Customer Details -->
    <VCardText>
      <VDivider class="my-4" />
      <div class="text-disabled text-uppercase text-sm">
        {{ $gettext("Details") }}
      </div>

      <VList density="compact" >
        <div v-for="generalProp in generalProps" class="d-flex px-0 py-1 align-start justify-start">
            <span class="text-h6 me-2">{{ generalProp.text }}:</span>
            <span v-if="generalProp.format">
              {{ printNullable(generalProp.format(client)) }}
            </span>
            <span v-else>
              {{ printNullable(client[generalProp.key]) }}
            </span>
        </div>
      </VList>
      <VDivider class="my-4" />
      <div class="text-disabled text-uppercase text-sm">
        {{ $gettext("Credit Terms") }}
      </div>

      <VList density="compact" >
        <div class="d-flex px-0 py-1 align-start justify-start">
            <span class="text-h6 me-2">{{ $gettext("Credit Limit") }}:</span>
            <span>
              {{ printMoney(client.creditLimit) }}
            </span>
        </div>
        <div class="d-flex px-0 py-1 align-start justify-start">
            <span class="text-h6 me-2">{{ $gettext("Credit Period") }}:</span>
            <span>
              {{ printNullable(client.creditPeriod, $gettext("day(s)")) }}
            </span>
        </div>
      </VList>
      <!-- Credit Utilisation -->
      <template v-if="creditCheck && creditCheck.limit">
        <VDivider class="my-2" />
        <div class="text-disabled text-uppercase text-sm mb-2">{{ $gettext('Credit Utilisation') }}</div>
        <div class="d-flex justify-space-between mb-1">
          <span class="text-sm">
            {{ creditCheck.currency }} {{ Number(creditCheck.exposure).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}
            / {{ Number(creditCheck.limit).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}
          </span>
          <span class="text-sm font-weight-bold" :class="`text-${utilisationColor}`">
            {{ creditCheck.utilisation }}%
          </span>
        </div>
        <VProgressLinear
          :model-value="Math.min(creditCheck.utilisation, 100)"
          :color="utilisationColor"
          rounded height="8"
          class="mb-2"
        />
        <div class="d-flex justify-space-between text-sm">
          <span class="text-disabled">{{ $gettext('Available') }}</span>
          <span :class="`text-${utilisationColor}`">
            {{ creditCheck.currency }} {{ Number(Math.max(creditCheck.available, 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}
          </span>
        </div>
        <VChip
          v-if="creditCheck.decision === 'HARD_BLOCK'"
          color="error" size="small" class="mt-2"
        >
          {{ $gettext('Credit Blocked') }}
        </VChip>
        <VChip
          v-else-if="creditCheck.decision === 'REQUIRE_APPROVAL'"
          color="error" variant="outlined" size="small" class="mt-2"
        >
          {{ $gettext('Over Limit — Requires Approval') }}
        </VChip>
        <VChip
          v-else-if="creditCheck.decision === 'WARN'"
          color="warning" size="small" class="mt-2"
        >
          {{ $gettext('Approaching Limit') }}
        </VChip>
      </template>
      <div class="mt-4">
        <div class="text-disabled font-weight-bold mb-1">{{ $gettext('Credit Status') }}</div>
        <VChip :color="findCreditStatus(client.creditStatus)?.color ?? 'default'" class="me-2">
          {{ findCreditStatus(client.creditStatus)?.title ?? client.creditStatus }}
        </VChip>
        <VBtn v-if="$can('PUT', 'Client')" size="small" variant="text" @click="openCreditDialog">
          <VIcon size="16" icon="tabler-pencil" />
        </VBtn>
        <div v-if="client.creditHoldReason" class="text-caption text-medium-emphasis mt-1">
          {{ client.creditHoldReason }}
        </div>
      </div>
    </VCardText>

    <VCardText class="text-center">
      <VBtn @click="edit">
        <VIcon icon="tabler-edit" size="24" class="me-4" />{{ $gettext("Edit Details") }}
      </VBtn>
    </VCardText>
  </VCard>
  <VDialog
    v-model="modal" persistent max-width="800"
  >
    <DialogCloseBtn @click="modal = !modal" />
    <VCard :title="$gettext('Client Information')">
      <VCardText class="pa-0">
        <AppForm
          :layout="layout"
          :isDialog="false"
          :makeDefaultEntity="makeDefaultEntity"
          :entityPreSubmit="entityPreSubmit"
          :service="ClientService"
          ref="form"
          @entitySubmitted="entitySubmitted"
        />
      </VCardText>
    </VCard>
  </VDialog>

  <VDialog v-model="creditDialogOpen" max-width="480">
    <VCard :title="$gettext('Update Credit Status')">
      <VCardText>
        <VSelect
          v-model="creditStatusInput"
          :label="$gettext('Credit Status')"
          :items="creditStatusList()"
          item-value="value"
          item-title="title"
          class="mb-3"
        />
        <VTextarea
          v-model="creditHoldReasonInput"
          :label="$gettext('Reason / Notes')"
          rows="3"
        />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="creditDialogOpen = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="primary" @click="saveCreditStatus">{{ $gettext('Save') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
