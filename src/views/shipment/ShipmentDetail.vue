<script setup>
import { findByValue as getShipmentStatus, enums as ShipmentStatus } from '@/config/enums/ShipmentStatus';
import { findByValue as findSubStatus, getListForStatus as getSubStatuses } from '@/config/enums/SubStatus';
import { findByValue, enums as TransportType } from '@/config/enums/TransportType';
import { enums as VolumeType } from '@/config/enums/VolumeType';
// BookingService removed - freight-specific service
const BookingService = null;
import { printPort } from '@/services/CommonService';
// ProviderService removed - freight-specific service
const ProviderService = null;
// ShipmentService removed - freight-specific service
const ShipmentService = null;
import { useAppStore } from '@/stores/appStore';
import { can } from '@layouts/plugins/casl';
import { watch } from 'vue';
import { useDisplay } from 'vuetify';
import ShipmentInfo from './info/ShipmentInfo.vue';
import ShipmentPricing from './pricing/ShipmentPricing.vue';
import ShipmentPL from './profit-loss/index.vue';
import ShipmentDocument from './ShipmentDocument.vue';
import ShipmentParties from './ShipmentParties.vue';
import ShipmentSubscribers from './ShipmentSubscribers.vue';
import ShipmentTracking from './ShipmentTracking.vue';
import ShipmentCostSheet from './ShipmentCostSheet.vue';
import VesselRolls from './VesselRolls.vue';
import DdPanel from './DdPanel.vue';
import InsuranceCertificatePanel from './InsuranceCertificatePanel.vue';
import EmissionsPanel from './EmissionsPanel.vue';
import LcPanel from './LcPanel.vue'
import CustomsPanel from './CustomsPanel.vue';
import ArrivalNoticePanel from './ArrivalNoticePanel.vue';
import DeliveryOrderPanel from './DeliveryOrderPanel.vue';
import ShipmentLegsPanel from './ShipmentLegsPanel.vue';
import WarehouseReceiptPanel from './WarehouseReceiptPanel.vue'
import CloseChecklistPanel from './CloseChecklistPanel.vue';
import { useFeature } from '@/composables/useFeature'
import { Feature } from '@/config/enums/Feature'
import { useUpgradeDialog } from '@/composables/useUpgradeDialog'
const props = defineProps({
  isDialog: {type: Boolean, default: false},
  pushUrl: {type:Boolean, default: false}
})
const shipment = ref(null)
const company = ref(null)
const route = useRoute()
const router = useRouter()
const reloader = ref(0)
const holdDialogOpen = ref(false)
const holdReasonInput = ref('')
const { mdAndDown } = useDisplay()
const isHeightTooSmall = ref(false)
const preShipmentUrl = ref(null)
const { featureEnabled } = useFeature()
const { open: openUpgradeDialog } = useUpgradeDialog()

async function loadTabData(tab1, tab2) {
  if (!shipment.value) return
  const id = shipment.value.id
  if (tab1 === 'info' && tab2 === 'booking') {
    const booking = await ShipmentService.getBooking(id)
    if (booking) shipment.value = { ...shipment.value, booking }
  } else if (tab1 === 'pricing') {
    if (!shipment.value._quoteLoaded) {
      const quote = await ShipmentService.getQuote(id)
      if (quote) shipment.value = { ...shipment.value, quote, _quoteLoaded: true }
    }
  } else if (tab1 === 'document') {
    const documents = await ShipmentService.getDocuments(id)
    if (documents) shipment.value = { ...shipment.value, documents }
  } else if (tab1 === 'profitloss') {
    const ebitNotes = await ShipmentService.getEbitNotes(id)
    if (ebitNotes) shipment.value = { ...shipment.value, ebitNotes }
  } else if (tab1 === 'subscribers') {
    const result = await ShipmentService.getSubscribers(id)
    if (result) shipment.value = { ...shipment.value, assignedUsers: result.assignedUsers ?? [], manageAllUsers: result.manageAllUsers ?? [] }
  }
}

async function setEntity (shipmentId) {
  const data = await ShipmentService.get(shipmentId)
  shipment.value = { ...data, documents: [], ebitNotes: [], assignedUsers: [], manageAllUsers: [] }
  document.querySelector('html').classList.add('overflow-y-hidden');
  company.value = await ProviderService.get(1)
  if(props.pushUrl) {
    preShipmentUrl.value = window.location.pathname + window.location.search + window.location.hash
    if(
      (shipment.value.status === ShipmentStatus.Draft
      || shipment.value.status === ShipmentStatus.Pending)
      && currentTab.value === 'profitloss'
    ) {
      currentTab.value = 'info'
    }
    const shipmentIdentifier = shipment.value.code ?? shipmentId
    const tab2 = tabMap[currentTab.value] ?? tabs.value.find(tab => tab.value === currentTab.value).defaultSubtab
    setUrlByTab(currentTab.value, tab2)
  }
  await loadTabData(currentTab.value, tabMap[currentTab.value])
}
async function refreshEntity () {
  const data = await ShipmentService.get(shipment.value.id)
  shipment.value = { ...data, documents: shipment.value.documents, ebitNotes: shipment.value.ebitNotes, assignedUsers: shipment.value.assignedUsers, manageAllUsers: shipment.value.manageAllUsers }
  await loadTabData(currentTab.value, tabMap[currentTab.value])
  reloader.value += 1
}
function setUrlByTab(tab1, tab2) {
  const id = route.params.id ?? shipment.value.code ?? shipment.value.id
  if(props.pushUrl) {
    history.pushState(
      {},
      null,
      router.resolve({ name: 'shipment-id-tab1?tab2?', params: { id, tab1, tab2: tab2 ?? undefined } }).href
    )
  }
}
const emit = defineEmits(['closed', 'openUpdate'])
function reset () {
  if(!shipment.value) return
  const backRoute = router.resolve({ name: 'shipment-transport-type', params: { transportType: findByValue(shipment.value.quote.transportType).slug } }).href
  document.querySelector('html').classList.remove('overflow-y-hidden');
  console.log('reset', backRoute)
  shipment.value = null
  emit('closed', backRoute)
  if(props.pushUrl) {
    history.pushState(
      {},
      null,
      preShipmentUrl.value ?? backRoute
    )
  }
}
defineExpose({
  setEntity
})
const headers = computed(() => {
  const quote = shipment.value?.quote
  const booking = shipment.value?.booking
  if(!quote) return []
  const client = quote.client
  return [
    [
      { title: $gettext('Client'), value: client.name },
      { title: $gettext('Account Manager'), value: 'accountManager' },
    ],
    [
      { title: $gettext('Origin'), value: printPort(quote.originPort) },
      { title: $gettext('Destination'), value: printPort(quote.destinationPort) },
    ],
    [
      { title: $gettext('Transport Type'), value: findByValue(quote.transportType).titleFull },
      { 
        title: $gettext('Volume'), value: 'volumeItems'
      },
    ],
    [
      {
        title: $gettext('Booking No.'), value: 'bookingNo'
      },
      {
        title: $gettext('BL No.'),
        value: 'blNo'
      },
    ],
]
})
const subStatuses = computed(() => shipment.value ? getSubStatuses(shipment.value.status) : [])
const currentSubStatus = computed(() => shipment.value?.subStatus ? findSubStatus(shipment.value.subStatus) : null)
const currentTab = ref(route.params?.tab1 ?? 'info')
const tabMap = {}
tabMap[currentTab.value] = route.params.tab2 ?? 'order'
const tabs = computed(() => {
  return [
    {
      icon: 'tabler-package-export', 
      title: $gettext('Information'), 
      component: ShipmentInfo,
      value: 'info',
      defaultSubtab : 'order'
    },
    can('MANAGE_Pricing', 'Shipment')
      ? {
        icon: 'tabler-message-2-dollar',
        title: $gettext('Pricing'),
        component: ShipmentPricing,
        value: 'pricing',
        defaultSubtab : 'details'
      } : null,
    can('PUT_Documents', 'Shipment') ? {
      icon: 'tabler-file-text',
      title: $gettext('Document'),
      component: ShipmentDocument,
      value: 'document',
      locked: !featureEnabled(Feature.ShipmentDocuments),
    } : null,
    {
      icon: 'tabler-users-group',
      title: $gettext('Parties'),
      component: ShipmentParties,
      value: 'parties',
      locked: !featureEnabled(Feature.ShipmentParties),
    },
    {
      icon: 'tabler-radar',
      title: $gettext('Tracking'),
      component: ShipmentTracking,
      value: 'tracking',
      defaultSubtab: 'milestones',
    },
    can('MANAGE_Ebitnote', 'Shipment')
      ? {
        icon: 'tabler-receipt-dollar',
        title: $gettext('Profit & Loss'),
        component: ShipmentPL,
        value: 'profitloss',
        defaultSubtab : 'revenues',
        disabled: shipment.value
                  &&
                  (
                    shipment.value.status === ShipmentStatus.Draft
                    || shipment.value.status === ShipmentStatus.Pending
                  ),
        locked: !featureEnabled(Feature.PLReports),
      } : null,
    {
      icon: 'tabler-report-money',
      title: $gettext('Cost Sheet'),
      component: ShipmentCostSheet,
      value: 'cost-sheet',
    },
    {
      icon: 'tabler-ship',
      title: $gettext('Vessel Rolls'),
      component: VesselRolls,
      value: 'vessel-rolls',
      locked: !featureEnabled(Feature.VesselRollAlerts),
    },
    {
      icon: 'tabler-container',
      title: $gettext('D&D'),
      component: DdPanel,
      value: 'dd',
      locked: !featureEnabled(Feature.DdCalculator),
    },
    {
      icon: 'tabler-shield-check',
      title: $gettext('Insurance'),
      component: InsuranceCertificatePanel,
      value: 'insurance',
      locked: !featureEnabled(Feature.CargoInsurance),
    },
    {
      icon: 'tabler-leaf',
      title: $gettext('CO₂'),
      component: EmissionsPanel,
      value: 'emissions',
      locked: !featureEnabled(Feature.Co2Emissions),
    },
    {
      icon: 'tabler-file-certificate',
      title: $gettext('Letter of Credit'),
      component: LcPanel,
      value: 'lc',
      locked: !featureEnabled(Feature.LetterOfCredit),
    },
    {
      icon: 'tabler-file-invoice',
      title: $gettext('Customs'),
      component: CustomsPanel,
      value: 'customs',
      locked: !featureEnabled(Feature.CustomsFiling),
    },
    shipment.value?.quote?.transportType === TransportType.Multimodal
      ? {
        icon: 'tabler-route',
        title: $gettext('Sub-Legs'),
        component: ShipmentLegsPanel,
        value: 'sub-legs',
      } : null,
    {
      icon: 'tabler-bell-ringing',
      title: $gettext('Subscribers'),
      component: ShipmentSubscribers,
      value: 'subscribers',
      locked: !featureEnabled(Feature.EmailNotifications),
    },
    can('MANAGE_Instruction', 'Shipment')
      ? {
        icon: 'tabler-bell-ringing',
        title: $gettext('Arrival Notice'),
        component: ArrivalNoticePanel,
        value: 'arrival-notice',
        locked: !featureEnabled(Feature.ArrivalNotices),
      } : null,
    can('MANAGE_Instruction', 'Shipment')
      ? {
        icon: 'tabler-truck-delivery',
        title: $gettext('Delivery Order'),
        component: DeliveryOrderPanel,
        value: 'delivery-order',
        locked: !featureEnabled(Feature.ArrivalNotices),
      } : null,
    {
      icon: 'tabler-building-warehouse',
      title: $gettext('Warehouse'),
      component: WarehouseReceiptPanel,
      value: 'warehouse',
      locked: !featureEnabled(Feature.WarehouseCfs),
    },
    can('MANAGE_Ebitnote', 'Shipment')
      ? {
        icon: 'tabler-lock-check',
        title: $gettext('Accounting Close'),
        component: CloseChecklistPanel,
        value: 'accounting-close',
        locked: !featureEnabled(Feature.GeneralLedger),
      } : null,
  ].filter(e => e)
})

const tabGroups = [
  {
    icon: 'tabler-receipt',
    title: $gettext('Finance'),
    value: 'finance',
    children: ['cost-sheet', 'profitloss', 'accounting-close'],
  },
  {
    icon: 'tabler-files',
    title: $gettext('Documents'),
    value: 'documents',
    children: ['document', 'lc'],
  },
  {
    icon: 'tabler-truck',
    title: $gettext('Logistics'),
    value: 'logistics',
    children: ['vessel-rolls', 'sub-legs', 'arrival-notice', 'delivery-order', 'warehouse'],
  },
  {
    icon: 'tabler-shield-half-filled',
    title: $gettext('Compliance'),
    value: 'compliance',
    children: ['dd', 'insurance', 'emissions', 'customs'],
  },
  {
    icon: 'tabler-users-group',
    title: $gettext('People'),
    value: 'people',
    children: ['parties', 'subscribers'],
  },
]

function getGroupForTab(tabValue) {
  return tabGroups.find(g => g.children.includes(tabValue)) ?? null
}

function getDefaultChild(group) {
  return tabs.value.find(t => group.children.includes(t.value) && !t.locked)?.value
    ?? tabs.value.find(t => group.children.includes(t.value))?.value
}

const mainTabValue = computed(() => {
  const group = getGroupForTab(currentTab.value)
  return group ? group.value : currentTab.value
})

const activeGroupTabs = computed(() => {
  const group = getGroupForTab(currentTab.value)
  if (!group) return null
  return tabs.value.filter(t => group.children.includes(t.value))
})

const mainTabItems = computed(() => {
  const getStandalone = (value) => tabs.value.find(t => t.value === value) ?? null
  const getGroup = (value) => {
    const group = tabGroups.find(g => g.value === value)
    if (!group) return null
    const groupTabs = tabs.value.filter(t => group.children.includes(t.value))
    if (!groupTabs.length) return null
    return { ...group, locked: groupTabs.every(t => t.locked) }
  }
  return [
    getStandalone('info'),
    getStandalone('pricing'),
    getGroup('finance'),
    getGroup('documents'),
    getGroup('logistics'),
    getStandalone('tracking'),
    getGroup('compliance'),
    getGroup('people'),
  ].filter(Boolean)
})

function onTabChange(tab1) {
  if(!tabMap.hasOwnProperty(tab1)) {
    tabMap[tab1] = tabs.value.find(tab => tab.value === tab1)?.defaultSubtab
  }
  const group = getGroupForTab(tab1)
  if (group) tabMap[group.value] = tab1
  setUrlByTab(tab1, tabMap[tab1])
  loadTabData(tab1, tabMap[tab1])
}

function onMainTabChange(value) {
  const item = mainTabItems.value.find(t => t.value === value)
  if (item?.locked) {
    openUpgradeDialog()
    return
  }
  const group = tabGroups.find(g => g.value === value)
  if (group) {
    const child = tabMap[value] ?? getDefaultChild(group)
    currentTab.value = child
    onTabChange(child)
  } else {
    currentTab.value = value
    onTabChange(value)
  }
}

function onGroupChildTabChange(childValue) {
  const tab = tabs.value.find(t => t.value === childValue)
  if (tab?.locked) {
    openUpgradeDialog()
    return
  }
  currentTab.value = childValue
  onTabChange(childValue)
}

function onTab2Change(tabs) {
  const [tab1, tab2] = tabs
  tabMap[tab1] = tab2
  onTabChange(tab1)
}
async function saveAccountManger (user) {
  const data = {
    id: shipment.value.id,
    accountManager: user
  }
  await ShipmentService.update(data)
  refreshEntity()
}
async function saveSalesRep (user) {
  await ShipmentService.update({ id: shipment.value.id, salesRep: user })
  refreshEntity()
}
async function saveSubStatus (value) {
  await ShipmentService.update({ id: shipment.value.id, subStatus: value })
  refreshEntity()
}
async function doHold () {
  if (!holdReasonInput.value.trim()) return
  await ShipmentService.hold(shipment.value.id, holdReasonInput.value)
  holdDialogOpen.value = false
  holdReasonInput.value = ''
  refreshEntity()
}
async function doUnhold () {
  await ShipmentService.unhold(shipment.value.id)
  refreshEntity()
}
async function setStatus (toStatusValue, buttonComponent) {
  const toStatus = getShipmentStatus(toStatusValue)
  const confirmed = await useAppStore().confirm.open(
    $gettext('Confirm your action'),
    $gettext(
      'Do you want to change status for this shipment from "%{from}" to "%{to}"? .', 
      {from: status.value.title, to: toStatus.title}
    ),
    { color: 'warning' }
  )
  console.log(buttonComponent)
  if(Array.isArray(buttonComponent)) {
    if (!confirmed) {
      buttonComponent[0].disabled = false
      return
    }
    buttonComponent[0].addToQueuingList()
  } else {
    if (!confirmed) {
      buttonComponent.disabled = false
      return
    }
    buttonComponent.addToQueuingList()
  }
  
  const data = {
    id: shipment.value.id, 
    status: toStatusValue
  }
  await ShipmentService.update(data)
  refreshEntity()
}
const status = computed(() => {
  return getShipmentStatus(shipment.value.status)
})
const nextStatuses = computed(() => {
  const status = getShipmentStatus(shipment.value.status)
  if(shipment.value.status === ShipmentStatus.Completed 
    || shipment.value.status === ShipmentStatus.Cancelled
  ) {
    if(can('PUT_StatusRevert', 'Shipment')) {
      return [getShipmentStatus(ShipmentStatus.Active)]
    }
    return []
  }
  return status.nextStatuses ?? []
})
const shipmentEditable = computed(() => {
  return shipment.value 
    && shipment.value.status !== ShipmentStatus.Completed
    && shipment.value.status !== ShipmentStatus.Cancelled
})
const cargoVolume = computed(() => {
  if(!shipment) return []
  if(shipment.value.quote.cargoVolumeType !== VolumeType.Container) {
    if(shipment.value.quote.transportType === TransportType.AIR) {
      const theCargoVolume = {...shipment.value.instruction}
      if(theCargoVolume.chargeableWeight === '') {
        theCargoVolume.chargeableWeight = shipment.value.quote.cargoVolume.chargeableWeight
      }
      return theCargoVolume
    }
    const theCargoVolume = {...shipment.value.booking.cargoVolume}
    if(theCargoVolume.totalCBM === '') {
      theCargoVolume.totalCBM = shipment.value.quote.cargoVolume.totalCBM
    }
    return theCargoVolume
  }
    
  if(shipment.value.quote.cargoVolumeType === VolumeType.Container) {
    const containerMap = {}
    shipment.value.instruction.containers.forEach(container => {
      if(!containerMap.hasOwnProperty(container.type)) {
        containerMap[container.type] = 0
      }
      containerMap[container.type] += 1
    })
    return { 
      items: Object.keys(containerMap)
              .map(key => {
                return {title: key, amount: containerMap[key]}
              }) 
    } 
  }
  
})
watch(() => route, (newValue, oldValue) => {
  reset()
}, {deep: true})
onMounted(() => {
  if(window.innerHeight < 700) {
    isHeightTooSmall.value = true
  }
})
</script>
<template>
<div class="form-dialog" v-show="shipment">
  <VCard
    class="form-title mx-4"
    v-if="shipment"
  >
    <template #title>
      <IconBtn
        id="vertical-nav-toggle-btn"
        class="ms-n3 d-lg-none"
        @click="$parent.$attrs.toggleVerticalOverlayNavActive(true)"
      >
        <VIcon
          size="26"
          icon="tabler-menu-2"
        />
      </IconBtn>
      <template v-if="$vuetify.display.smAndUp">
        <span 
          class="cursor-pointer text-h5 text-primary" 
          @click="reset()"
        >
          {{ $gettext('Shipments') }}
        </span>
        &nbsp;&nbsp;>
        {{ shipment.code ?? (shipment.id + '&nbsp;(' + $gettext('Draft') + ')') }}
      </template>
      
    </template>
    <template #append>
      <div class="d-flex align-center flex-wrap gap-2">
        <VChip
          v-if="shipment.consolId"
          color="info" size="small" label variant="tonal"
          class="cursor-pointer"
          @click="$router.push({ name: 'consolidation-id', params: { id: shipment.consolId } })"
        >
          <VIcon start icon="tabler-layers-linked" size="14" />
          {{ $gettext('Consol') }}
          <VTooltip activator="parent" location="bottom">{{ $gettext('View consolidation') }}</VTooltip>
        </VChip>
        <VSelect
          v-if="subStatuses.length && $can('PUT_Status', 'Shipment')"
          :items="subStatuses"
          item-title="title"
          item-value="value"
          :model-value="shipment.subStatus"
          :placeholder="$gettext('Sub-status')"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          class="sub-status-select tiny"
          style="min-width:150px; max-width:190px;"
          @update:modelValue="saveSubStatus"
        />
        <VBtn
          variant="outlined" label :color="status.color" class="px-1 justify-end"
          size="small"
        >
          <span class="d-flex flex-grow-1 me-2">{{ $gettext('Status') }}</span>
          <VChip label class="text-uppercase text-center">{{ status.title }}</VChip>
        </VBtn>
        <template v-if="!shipment.isOnHold" v-for="nextStatus in nextStatuses">
          <SubmitBtn
            v-if="shipment.status === ShipmentStatus.Draft || $can('PUT_Status', 'Shipment')"
            :color="nextStatus.color" class="px-2 justify-end"
            size="small"
            @click="setStatus(nextStatus.value, $refs['set-status-' + nextStatus.value])"
            :ref="'set-status-' + nextStatus.value"
            :autoQueue="false"
          >
            {{ $gettext('Set Status') }} {{ nextStatus.title }}
          </SubmitBtn>
        </template>
        <VBtn
          v-if="!shipment.isOnHold && $can('PUT_Status', 'Shipment') && shipmentEditable"
          color="warning" variant="outlined" size="small"
          @click="holdDialogOpen = true"
        >
          <VIcon start icon="tabler-lock" size="14" />{{ $gettext('Hold') }}
        </VBtn>
        <template v-if="shipment.isOnHold && $can('PUT_Status', 'Shipment')">
          <VChip color="error" label class="font-weight-bold">
            <VIcon start icon="tabler-lock" size="14" />
            {{ $gettext('ON HOLD') }}
            <VTooltip activator="parent" location="bottom">{{ shipment.holdReason }}</VTooltip>
          </VChip>
          <VBtn color="success" variant="outlined" size="small" @click="doUnhold">
            <VIcon start icon="tabler-lock-open" size="14" />{{ $gettext('Unhold') }}
          </VBtn>
        </template>
        <div class="form-close d-flex" style="height: 32px;">
          <v-btn
            variant="plain" size="x-small" @click="reset" color="primary" density="compact" class="px-0" :ripple="false"
          >
            <VIcon icon="tabler-x" size="30"></VIcon>
          </v-btn>
        </div>
      </div>
    </template>
  </VCard>
  <VCard class="mx-4 mt-4" v-if="shipment">
    <VCardText>
      <VRow>
        <VCol v-for="col in headers" cols="12" lg="3">
          <VSheet :min-height="mdAndDown ? 0 : 50">
            <div class="text-disabled font-weight-bold">
              {{ col[0].title }}
              <DialogForm
                v-if="col[0].value === 'bookingNo' && shipmentEditable"
                :apiService="BookingService"
                :modelValue="{
                  id: shipment.booking.id, 
                  code: shipment.booking.code
                }" 
                :layout="() => [[[
                    { name: 'code', text: $gettext('Booking No.') }
                  ]]]"
                :class="'mt-n2'"
                :entityPreSubmit="function(entity) { 
                  entity.parentType = 'shipment'
                  entity.parentId = shipment.id
                  entity.parentProperty = 'booking'
                  return entity
                }"
                @entitySubmitted="refreshEntity"
              />
            </div>
            <div
              v-if="col[0].value === 'bookingNo'"
              class="font-weight-bold"
            >
              <div>{{ shipment.booking.code ?? '...'}}</div>
            </div>
            <div
              v-else-if="col[0].value === 'salesRep'"
              class="font-weight-bold"
            >
              {{ shipment.salesRep ? [shipment.salesRep.firstName, shipment.salesRep.lastName].join(' ') : '—' }}
              <UserSelect
                v-if="$can('PUT_Manager', 'Shipment') && shipmentEditable"
                class="ps-0" variant="plain" size="small" density="compact" :ripple="false"
                :title="$gettext('Edit Sales Rep')"
                :excepts="shipment.salesRep ? [shipment.salesRep] : []"
                @selected="saveSalesRep"
              >
                <template #activatorContent>
                  <VIcon size="16" icon="tabler-pencil" />
                </template>
              </UserSelect>
            </div>
            <div v-else class="font-weight-bold">
              {{ col[0].value }}
            </div>
          </VSheet>
          <div class="mt-1 text-disabled font-weight-bold">
            {{ col[1].title }}
            <DialogForm
              v-if="col[1].value === 'blNo' && shipmentEditable"
              :apiService="ShipmentService"
              :modelValue="{
                id: shipment.id, 
                masterBill: shipment.masterBill,
                houseBill: shipment.houseBill,
              }" 
              :layout="() => [[[
                  { name: 'masterBill', text: $gettext('Master Bill No.') },
                  { name: 'houseBill', text: $gettext('House Bill No.') }
                ]]]"
              :class="'mt-n2'"
              @entitySubmitted="refreshEntity"
            />
          </div>
          <VolumeItems 
            v-if="col[1].value === 'volumeItems'"
            :cargoVolumeType="shipment.quote.cargoVolumeType"
            :cargoVolume="cargoVolume" 
            variant="text" compact pullLeft
          />
          <div 
            v-else-if="col[1].value === 'blNo'"
            class="font-weight-bold"
          >
            <div>H: {{ shipment.houseBill ?? '...'}}</div>
            <div>M: {{ shipment.masterBill ?? '...'}}</div>
          </div>
          <div
            v-else-if="col[1].value === 'accountManager'"
            class="font-weight-bold"
          >
            {{ [shipment.accountManager.firstName, shipment.accountManager.lastName].join(' ') }}
            <UserSelect
              v-if="$can('PUT_Manager', 'Shipment') && shipmentEditable"
              class="ps-0" variant="plain" size="small" density="compact" :ripple="false"
              :title="$gettext('Edit Account Manager')"
              :excepts="[shipment.accountManager]"
              @selected="saveAccountManger"
            >
              <template #activatorContent>
                <VIcon size="16" :icon="'tabler-pencil'" />
              </template>
            </UserSelect>
          </div>
          <div
            v-else-if="col[1].value === 'salesRep'"
            class="font-weight-bold"
          >
            {{ shipment.salesRep ? [shipment.salesRep.firstName, shipment.salesRep.lastName].join(' ') : '—' }}
            <UserSelect
              v-if="$can('PUT_Manager', 'Shipment') && shipmentEditable"
              class="ps-0" variant="plain" size="small" density="compact" :ripple="false"
              :title="$gettext('Edit Sales Rep')"
              :excepts="shipment.salesRep ? [shipment.salesRep] : []"
              @selected="saveSalesRep"
            >
              <template #activatorContent>
                <VIcon size="16" :icon="'tabler-pencil'" />
              </template>
            </UserSelect>
          </div>
          <div
            v-else
            class="font-weight-bold"
          >{{ col[1].value }}</div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
  <VTabs
    :model-value="mainTabValue"
    @update:modelValue="onMainTabChange"
    class="v-tabs-pill mx-0 mt-2 py-2" density="compact"
  >
    <VTab
      v-for="tab in mainTabItems"
      class="pe-2"
      :value="tab.value"
      :disabled="tab.disabled"
    >
      <VIcon :icon="tab.icon" class="ms-n3 me-1" size="21"/>{{ tab.title }}{{ tab.locked ? ' 👑' : '' }}
    </VTab>
  </VTabs>

  <VCard class="mx-4 mt-5" v-if="shipment">
    <VCardText>
      <VTabs
        v-if="activeGroupTabs && activeGroupTabs.length"
        :model-value="currentTab"
        @update:modelValue="onGroupChildTabChange"
        density="compact"
        class="mb-4"
      >
        <VTab
          v-for="tab in activeGroupTabs"
          class="px-0 me-6 pb-2"
          style="min-inline-size: unset"
          :value="tab.value"
          :disabled="tab.disabled"
        >
          <VIcon :icon="tab.icon" class="me-2" size="21"/>{{ tab.title }}{{ tab.locked ? ' 👑' : '' }}
        </VTab>
      </VTabs>
      <VWindow v-model="currentTab">
        <VWindowItem
          v-for="item in tabs"
          :key="`window${item.value}`"
          :value="item.value"
          transition="fade-transition" 
          reverse-transition="fade-transition"
        >
          <component 
            :is="item.component"
            :shipment="shipment"
            @tab2Changed="onTab2Change"
            @shipmentChanged="refreshEntity"
            :currentTab2="tabMap[item.value]"
            :key="`${reloader}`"
          />
          <br v-if="isHeightTooSmall">
          <br v-if="isHeightTooSmall">
          <br v-if="isHeightTooSmall">
          <br v-if="isHeightTooSmall">
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>

  <VDialog v-model="holdDialogOpen" max-width="480">
    <VCard :title="$gettext('Put Shipment On Hold')">
      <VCardText>
        <VTextarea
          v-model="holdReasonInput"
          :label="$gettext('Hold Reason')"
          :placeholder="$gettext('Describe why this shipment is being put on hold...')"
          rows="3"
          auto-grow
        />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="holdDialogOpen = false">{{ $gettext('Cancel') }}</VBtn>
        <VBtn color="warning" :disabled="!holdReasonInput.trim()" @click="doHold">{{ $gettext('Confirm Hold') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</div>
</template>
<style scoped>
.sub-status-select :deep(.v-field) {
  height: 32px;
}
.sub-status-select :deep(.v-field__input) {
  min-height: 32px;
  padding-block: 0;
  font-size: 0.8125rem;
}
.sub-status-select :deep(.v-field__append-inner),
.sub-status-select :deep(.v-field__clearable) {
  padding-block-start: 2px;
}
</style>
