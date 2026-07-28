<script setup>
import AppTableTitle from '@/components/table/AppTableTitle.vue'
import { useFeature } from '@/composables/useFeature'
import { Feature } from '@/config/enums/Feature'
import { useUpgradeDialog } from '@/composables/useUpgradeDialog'
import { enums as TransportType, valueToSlug as TransportTypeSlug } from '@/config/enums/TransportType'
import { getList as chargeTypeList } from '@/config/enums/ChargeType'
import { useAuthStore } from '@/stores/authStore'
import { useLibraryHeader } from '@/composables/useLibraryHeader'

const props = defineProps({
  toggleVerticalOverlayNavActive: { type: Function, default: () => {} }
})

const route = useRoute()
const router = useRouter()
const { featureEnabled } = useFeature()
const { open: openUpgradeDialog } = useUpgradeDialog()
const airSlug = TransportTypeSlug(TransportType.AIR)
const { buttons: headerButtons } = useLibraryHeader()
const { userAbilityRules } = useAuthStore()

const chargeTypeIcons = { local: 'tabler-map-pin', service: 'tabler-tool', customs: 'tabler-building-bank', freight: 'tabler-truck' }

const accessibleChargeTypes = computed(() =>
  chargeTypeList.filter(ct =>
    userAbilityRules.some(
      ability => (ability.subject === 'Charge' && ability.action === ('MANAGE_' + ct.enums))
        || (ability.action === 'manage' && ability.subject === 'all')
    )
  )
)

const categories = computed(() => {
  return [
    {
      title: $gettext('General'),
      icon: 'tabler-books',
      items: [
        { title: $gettext('Package Types'),   icon: 'tabler-package',       route: 'library-package-type-transport-type', to: { name: 'library-package-type-transport-type', params: { transportType: airSlug } } },
        { title: $gettext('Shipment Modes'),  icon: 'tabler-ship',          route: 'library-shipment-mode' },
        { title: $gettext('Incoterms'),       icon: 'tabler-gavel',         route: 'library-incoterm' },
        { title: $gettext('Payment Methods'), icon: 'tabler-credit-card',   route: 'library-payment-method' },
        { title: $gettext('Tax Groups'),      icon: 'tabler-receipt-tax',   route: 'library-tax-group' },
      ],
    },
    {
      title: $gettext('Charges'),
      icon: 'tabler-report-money',
      items: [
        ...accessibleChargeTypes.value.map(ct => ({
          title: ct.title,
          icon: chargeTypeIcons[ct.slug] ?? 'tabler-tag',
          value: ct.slug,
          route: 'library-charge-type-charge-transport-type',
          routes: ['library-charge-type-charge-transport-type', 'library-charge-type-charge-type'],
          to: { name: 'library-charge-type-charge-transport-type', params: { chargeType: ct.slug, transportType: airSlug } },
        })),
        { title: $gettext('Free Time Agreements'),   icon: 'tabler-clock',      route: 'library-free-time-agreement',   locked: !featureEnabled(Feature.FreeTimeAgreements) },
        { title: $gettext('Carrier Event Mappings'), icon: 'tabler-git-merge',  route: 'library-carrier-event-mapping', locked: !featureEnabled(Feature.CarrierEventMappings) },
      ],
    },
    {
      title: $gettext('Customs'),
      icon: 'tabler-file-search',
      items: [
        { title: $gettext('HS Codes'),        icon: 'tabler-barcode',       route: 'library-hs-code',        locked: !featureEnabled(Feature.HsCodes) },
        { title: $gettext('Duty Rates'),      icon: 'tabler-percentage',    route: 'library-duty-rate',      locked: !featureEnabled(Feature.DutyRates) },
        { title: $gettext('HS Restrictions'), icon: 'tabler-ban',           route: 'library-hs-restriction', locked: !featureEnabled(Feature.HsRestrictions) },
      ],
    },
    {
      title: $gettext('Tax'),
      icon: 'tabler-calculator',
      items: [
        { title: $gettext('Tax Rules'),         icon: 'tabler-gavel',            route: 'library-tax-rule',         locked: !featureEnabled(Feature.VatReporting) },
        { title: $gettext('Tax Exemptions'),    icon: 'tabler-tag-off',          route: 'library-tax-exemption',    locked: !featureEnabled(Feature.CustomerTaxExemption) },
        { title: $gettext('Tax Registrations'), icon: 'tabler-file-certificate', route: 'library-tax-registration', locked: !featureEnabled(Feature.PartnerTaxRegistration) },
      ],
    },
    {
      title: $gettext('Insurance'),
      icon: 'tabler-shield-check',
      items: [
        { title: $gettext('Cargo Claims'),       icon: 'tabler-alert-triangle', route: 'library-cargo-claim',      locked: !featureEnabled(Feature.CargoClaims) },
        { title: $gettext('Insurance Policies'), icon: 'tabler-shield',         route: 'library-insurance-policy', locked: !featureEnabled(Feature.CargoInsurance) },
        { title: $gettext('Emission Factors'),   icon: 'tabler-leaf',           route: 'library-emission-factor',  locked: !featureEnabled(Feature.Co2Emissions) },
        { title: $gettext('Sanctions List'),     icon: 'tabler-list-check',     route: 'library-sanctions-list',   locked: !featureEnabled(Feature.AuditLogCompliance) },
        { title: $gettext('Data Retention'),     icon: 'tabler-database',       route: 'library-data-retention' },
      ],
    },
  ]
})

const activeCategory = computed(() =>
  categories.value.find(cat =>
    cat.items.some(r => r.route === route.name || (r.routes ?? []).includes(route.name))
  ) ?? null
)

function onCategoryChange(title) {
  const cat = categories.value.find(c => c.title === title)
  if (!cat) return
  const first = cat.items.find(i => !i.locked)
  if (!first) { openUpgradeDialog(); return }
  router.push(first.to ?? { name: first.route })
}

const activeSubTabValue = computed(() =>
  route.params.chargeType ? route.params.chargeType : route.name
)

function onTabChange(value) {
  const item = activeCategory.value?.items.find(r => (r.value ?? r.route) === value)
  if (!item) return
  if (item.locked) { openUpgradeDialog(); return }
  router.push(item.to ?? { name: item.route })
}
</script>

<template>
  <AppTableTitle :toggleVerticalOverlayNavActive="toggleVerticalOverlayNavActive" :buttons="headerButtons">
    <VTabs
      :modelValue="activeCategory?.title"
      class="v-tabs-pill"
      color="primary"
      @update:modelValue="onCategoryChange"
    >
      <VTab v-for="cat in categories" :key="cat.title" :value="cat.title" class="text-none">
        <VIcon :icon="cat.icon" size="18" class="me-2" />{{ cat.title }}
      </VTab>
    </VTabs>
  </AppTableTitle>

  <div v-if="activeCategory">
    <VTabs :modelValue="activeSubTabValue" class="sub-nav-tabs mt-4 mb-2" show-arrows @update:modelValue="onTabChange">
      <VTab
        v-for="item in activeCategory.items"
        :key="item.value ?? item.route"
        :value="item.value ?? item.route"
      >
        <VIcon :icon="item.icon" size="18" class="me-1" />
        {{ item.title }}
        <VIcon v-if="item.locked" icon="tabler-crown" size="12" class="ms-1 text-warning" />
      </VTab>
    </VTabs>
  </div>
</template>

<style scoped>
.sub-nav-tabs :deep(.v-tab) {
  padding-inline: 6px;
  min-width: 0;
}
.sub-nav-tabs :deep(.v-tab + .v-tab) {
  margin-left: 12px;
}
</style>
