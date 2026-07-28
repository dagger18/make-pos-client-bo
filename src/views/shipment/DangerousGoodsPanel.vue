<script setup>
import DangerousGoodsService from '@/services/DangerousGoodsService'

const props = defineProps({
  shipment: { type: Object, required: true },
  editable: { type: Boolean, default: true },
})

const dgList = ref([])
const dialogOpen = ref(false)
const editing = ref(null)
const saving = ref(false)

const imoClasses = [
  { value: '1',   title: '1 – Explosives' },
  { value: '2.1', title: '2.1 – Flammable gases' },
  { value: '2.2', title: '2.2 – Non-flammable non-toxic gases' },
  { value: '2.3', title: '2.3 – Toxic gases' },
  { value: '3',   title: '3 – Flammable liquids' },
  { value: '4.1', title: '4.1 – Flammable solids' },
  { value: '4.2', title: '4.2 – Spontaneously combustible' },
  { value: '4.3', title: '4.3 – Dangerous when wet' },
  { value: '5.1', title: '5.1 – Oxidising substances' },
  { value: '5.2', title: '5.2 – Organic peroxides' },
  { value: '6.1', title: '6.1 – Toxic substances' },
  { value: '6.2', title: '6.2 – Infectious substances' },
  { value: '7',   title: '7 – Radioactive' },
  { value: '8',   title: '8 – Corrosive' },
  { value: '9',   title: '9 – Miscellaneous' },
]
const packingGroups = [
  { value: 'I',   title: 'I – High danger' },
  { value: 'II',  title: 'II – Medium danger' },
  { value: 'III', title: 'III – Low danger' },
]
const uomOptions = ['KG', 'L', 'units']
const noPackingGroup = ['1', '2.1', '2.2', '2.3', '5.2', '6.2', '7']

const showPackingGroup = computed(() => editing.value && !noPackingGroup.includes(editing.value.imoClass))
const showFlashPoint = computed(() => editing.value?.imoClass === '3')
const showTechnicalName = computed(() => editing.value?.properName?.includes('N.O.S.'))

function emptyForm() {
  return {
    imoClass: '', unNumber: '', packingGroup: null, properName: '',
    technicalName: null, netQuantity: null, grossQuantity: null, uom: 'KG',
    flashPoint: null, subsidiaryRisk: null,
    isMarinePollutant: false, isLimitedQty: false, isExceptedQty: false,
    emergencyContact: null, msdsUrl: null,
  }
}

function openAdd() {
  editing.value = emptyForm()
  dialogOpen.value = true
}

function openEdit(dg) {
  editing.value = { ...dg }
  dialogOpen.value = true
}

async function save() {
  saving.value = true
  if (editing.value.id) {
    await DangerousGoodsService.update(props.shipment.id, editing.value.id, editing.value)
  } else {
    await DangerousGoodsService.create(props.shipment.id, editing.value)
  }
  dialogOpen.value = false
  await load()
  saving.value = false
}

async function remove(dg) {
  await DangerousGoodsService.delete(props.shipment.id, dg.id)
  await load()
}

async function load() {
  dgList.value = await DangerousGoodsService.list(props.shipment.id) ?? []
}

function downloadDgPdf(language) {
  window.open(DangerousGoodsService.downloadPdf(props.shipment, language), '_blank')
}

onMounted(load)
</script>

<template>
  <VCard variant="outlined" class="mt-4">
    <VCardTitle class="d-flex align-center px-4 pt-3 pb-0">
      <VIcon icon="tabler-hazard-lights" size="18" color="error" class="me-2" />
      {{ $gettext('Dangerous Goods') }}
      <VChip v-if="dgList.length" color="error" size="x-small" class="ms-2">{{ dgList.length }}</VChip>
      <VSpacer />
      <VBtn v-if="editable" size="small" color="error" variant="outlined" @click="openAdd">
        <VIcon start icon="tabler-plus" size="14" />{{ $gettext('Add DG Line') }}
      </VBtn>
      <VMenu v-if="dgList.length">
        <template #activator="{ props: menuProps }">
          <VBtn size="small" variant="outlined" class="ms-2" v-bind="menuProps">
            <VIcon start icon="tabler-file-download" size="14" />{{ $gettext('DG PDF') }}
          </VBtn>
        </template>
        <VList>
          <VListItem @click="downloadDgPdf('en')">
            <VListItemTitle>English</VListItemTitle>
          </VListItem>
          <VListItem @click="downloadDgPdf('vi')">
            <VListItemTitle>Vietnamese</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
    </VCardTitle>

    <VCardText class="pt-2">
      <div v-if="dgList.length === 0" class="text-caption text-disabled">
        {{ $gettext('No dangerous goods declared.') }}
      </div>
      <VTable v-else density="compact">
        <thead>
          <tr>
            <th>{{ $gettext('IMO Class') }}</th>
            <th>{{ $gettext('UN Number') }}</th>
            <th>{{ $gettext('Packing Group') }}</th>
            <th>{{ $gettext('Proper Name') }}</th>
            <th>{{ $gettext('Gross Qty') }}</th>
            <th>{{ $gettext('UOM') }}</th>
            <th>MP</th>
            <th v-if="editable"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="dg in dgList" :key="dg.id">
            <td><VChip color="error" size="x-small" label>{{ dg.imoClass }}</VChip></td>
            <td>{{ dg.unNumber }}</td>
            <td>{{ dg.packingGroup ?? '—' }}</td>
            <td>{{ dg.properName }}</td>
            <td>{{ dg.grossQuantity ?? '—' }}</td>
            <td>{{ dg.uom ?? '—' }}</td>
            <td>
              <VIcon v-if="dg.isMarinePollutant" icon="tabler-droplet" size="14" color="primary" />
              <span v-else>—</span>
            </td>
            <td v-if="editable">
              <VBtn icon size="x-small" variant="plain" @click="openEdit(dg)">
                <VIcon icon="tabler-pencil" size="14" />
              </VBtn>
              <VBtn icon size="x-small" variant="plain" color="error" @click="remove(dg)">
                <VIcon icon="tabler-trash" size="14" />
              </VBtn>
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCardText>
  </VCard>

  <VDialog v-model="dialogOpen" max-width="700" scrollable>
    <VCard :title="editing?.id ? $gettext('Edit DG Line') : $gettext('Add DG Line')">
      <VCardText v-if="editing">
        <VRow dense>
          <VCol cols="12" sm="6">
            <VSelect v-model="editing.imoClass" :items="imoClasses" item-title="title" item-value="value"
              :label="$gettext('IMO Class')" density="compact" />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField v-model="editing.unNumber" :label="$gettext('UN Number')" placeholder="UN1263"
              density="compact" />
          </VCol>
          <VCol cols="12" sm="6" v-if="showPackingGroup">
            <VSelect v-model="editing.packingGroup" :items="packingGroups" item-title="title" item-value="value"
              :label="$gettext('Packing Group')" density="compact" clearable />
          </VCol>
          <VCol cols="12" sm="6" v-if="showFlashPoint">
            <VTextField v-model="editing.flashPoint" type="number" :label="$gettext('Flash Point (°C)')"
              density="compact" />
          </VCol>
          <VCol cols="12">
            <VTextField v-model="editing.properName" :label="$gettext('Proper Shipping Name')" density="compact" />
          </VCol>
          <VCol cols="12" v-if="showTechnicalName">
            <VTextField v-model="editing.technicalName" :label="$gettext('Technical Name')" density="compact" />
          </VCol>
          <VCol cols="12" sm="4">
            <VTextField v-model="editing.netQuantity" type="number" :label="$gettext('Net Qty')" density="compact" />
          </VCol>
          <VCol cols="12" sm="4">
            <VTextField v-model="editing.grossQuantity" type="number" :label="$gettext('Gross Qty')" density="compact" />
          </VCol>
          <VCol cols="12" sm="4">
            <VSelect v-model="editing.uom" :items="uomOptions" :label="$gettext('UOM')" density="compact" />
          </VCol>
          <VCol cols="12">
            <VTextField v-model="editing.emergencyContact" :label="$gettext('Emergency Contact (24h)')"
              density="compact" />
          </VCol>
          <VCol cols="12" sm="4">
            <VCheckbox v-model="editing.isMarinePollutant" :label="$gettext('Marine Pollutant')" density="compact" hide-details />
          </VCol>
          <VCol cols="12" sm="4">
            <VCheckbox v-model="editing.isLimitedQty" :label="$gettext('Limited Qty')" density="compact" hide-details />
          </VCol>
          <VCol cols="12" sm="4">
            <VCheckbox v-model="editing.isExceptedQty" :label="$gettext('Excepted Qty')" density="compact" hide-details />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="dialogOpen = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="primary" :loading="saving" @click="save">{{ $gettext('Save') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
