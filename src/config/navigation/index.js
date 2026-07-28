import { firstAccountingRouteFromAbilities, firstLibraryChargeRouteFromAbilities } from '@/config/enums/Permission';
import { enums as TransportType, valueToSlug as TransportTypeSlug } from '@/config/enums/TransportType';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { Feature } from '@/config/enums/Feature'
import { useFeature } from '@/composables/useFeature'

export default () => {
  const airSlug = TransportTypeSlug(TransportType.AIR)
  const appStore = useAppStore()
  const { featureEnabled } = useFeature()
  const isOrgOwner = !!useAuthStore().organizationConfig

  const gated = (feature, baseTitle) => ({
    title: featureEnabled(feature) || !isOrgOwner ? baseTitle : baseTitle + ' 👑',
    disabled: !featureEnabled(feature) && isOrgOwner,
  })

  const navItems = [
  {
    title: $gettext('Dashboard'),
    to: { name: 'dashboard' },
    icon: { icon: 'tabler-device-desktop-analytics' },
  },
  {
    title: $gettext('POS Terminal'),
    to: { name: 'pos' },
    icon: { icon: 'tabler-cash-register' },
  },
  {
    title: $gettext('Orders'),
    to: { name: 'order' },
    icon: { icon: 'tabler-receipt' },
  },
  {
    title: $gettext('Catalog'),
    icon: { icon: 'tabler-shopping-bag' },
    children: [
      {
        title: $gettext('Products'),
        to: { name: 'product' },
      },
      {
        title: $gettext('Categories'),
        to: { name: 'product-categories' },
      },
      {
        title: $gettext('Modifier Groups'),
        to: { name: 'product-modifier-groups' },
      },
    ],
  },
  {
    title: $gettext('Rates'),
    icon: { icon: 'tabler-report-money' },
    children: [
      {
        title: $gettext('Freight Charges'),
        to: {
          name: 'rate-freight-transport-type',
          params: {transportType: airSlug}
        },
        subject: 'Rate',
        action: 'MANAGE_Freight',
      },
      {
        title: $gettext('Local Charges'),
        to: {
          name: 'rate-local-transport-type',
          params: {transportType: airSlug}
        },
        subject: 'Rate',
        action: 'MANAGE_Local'
      },
      {
        title: $gettext('Customs Charges'),
        to: {
          name: 'rate-customs-transport-type',
          params: {transportType: airSlug}
        },
        subject: 'Rate',
        action: 'MANAGE_Customs'
      },
      {
        title: $gettext('Services Charges'),
        to: {
          name: 'rate-service-transport-type',
          params: {transportType: airSlug}
        },
        subject: 'Rate',
        action: 'MANAGE_Service'
      },
      {
        ...gated(Feature.RateImport, $gettext('Rate Import')),
        to: { name: 'rate-import' },
        subject: 'Rate',
        action: 'MANAGE_Import',
      },
      {
        ...gated(Feature.PriceMarkupRules, $gettext('Markup Rules')),
        to: { name: 'rate-markup' },
        subject: 'PriceMarkup',
        action: 'MANAGE',
      },
    ]
  },
  {
    title: $gettext('Quotes'),
    icon: { icon: 'tabler-message-2-dollar' },
    to: { name: 'quote-transport-type', params: {transportType: airSlug} },
    subject: 'Quote',
    action: 'GET',
  },
  {
    title: $gettext('Shipments'),
    icon: { icon: 'tabler-package-export' },
    to: { name: 'shipment-transport-type', params: {transportType: 'all'} },
    subject: 'Shipment',
    action: 'GET',
    ...(
      appStore.newEntities.shipment > 0 ? {
        badgeContent: appStore.newEntities.shipment > 99 ? '+99' : appStore.newEntities.shipment,
        badgeClass: 'bg-error',
      } : {}
    )
  },
  {
    ...gated(Feature.Consolidations, $gettext('Consolidations')),
    icon: { icon: 'tabler-layers-linked' },
    to: { name: 'consolidation' },
    subject: 'Consolidation',
    action: 'GET',
  },
  {
    title: $gettext('Warehouse'),
    icon: { icon: 'tabler-building-warehouse' },
    children: [
      {
        ...gated(Feature.WarehouseCfs, $gettext('Facilities')),
        to: { name: 'warehouse-facility' },
        subject: 'Warehouse',
        action: 'MANAGE',
      },
      {
        ...gated(Feature.WarehouseCfs, $gettext('CFS Inventory')),
        to: { name: 'warehouse-inventory' },
        subject: 'Warehouse',
        action: 'MANAGE',
      },
    ],
  },
  {
    title: $gettext('Clients'),
    to: { name: 'client' },
    icon: { icon: 'tabler-user-hexagon' },
    subject: 'Client',
    action: 'GET',
    ...(
      appStore.newEntities.client > 0 ? {
        badgeContent: appStore.newEntities.client > 99 ? '+99' : appStore.newEntities.client,
        badgeClass: 'bg-error',
      } : {}
    )
  },
  {
    title: $gettext("Providers"),
    to: { name: 'provider-provider-type', params: {providerType: 'airline'} },
    icon: { icon: 'tabler-briefcase' },
    subject: 'Provider',
    action: 'GET',
    ...(
      appStore.newEntities.provider > 0 ? {
        badgeContent: appStore.newEntities.provider > 99 ? '+99' : appStore.newEntities.provider,
        badgeClass: 'bg-error',
      } : {}
    )
  },
  {
    title: $gettext('Accounting'),
    to: firstAccountingRouteFromAbilities(),
    icon: { icon: 'tabler-calculator' },
    subject: 'EbitNote',
    action: 'GET',
    ...(
      appStore.newEntities.accounting > 0 ? {
        badgeContent: appStore.newEntities.accounting > 99 ? '+99' : appStore.newEntities.accounting,
        badgeClass: 'bg-error',
      } : {}
    )
  },
  {
    title: $gettext('General Ledger'),
    icon: { icon: 'tabler-book-2' },
    children: [
      { ...gated(Feature.GeneralLedger, $gettext('Journal Entries')), to: { name: 'accounting-journal' }, subject: 'EbitNote', action: 'GET' },
      { ...gated(Feature.ChartOfAccounts, $gettext('Chart of Accounts')), to: { name: 'setting-chart-of-accounts' }, subject: 'ChartOfAccounts', action: 'MANAGE' },
    ]
  },
  {
    title: $gettext('CRM'),
    icon: { icon: 'tabler-chart-bar' },
    children: [
      {
        ...gated(Feature.SalesCrm, $gettext('Leads')),
        to: { name: 'crm-leads' },
        subject: 'CRM',
        action: 'MANAGE',
      },
      {
        ...gated(Feature.SalesCrm, $gettext('Pipeline')),
        to: { name: 'crm-opportunities' },
        subject: 'CRM',
        action: 'MANAGE',
      },
      {
        ...gated(Feature.SalesCrm, $gettext('Activities')),
        to: { name: 'crm-activities' },
        subject: 'CRM',
        action: 'MANAGE',
      },
    ],
  },
  {
    title: $gettext('Reports'),
    icon: { icon: 'tabler-report' },
    children: [
      {
        title: $gettext('Operations'),
        to: { name: 'report-dataset' },
        subject: 'Report',
        action: 'Manage',
      },
      {
        title: $gettext('Finance'),
        to: { name: 'report-charge' },
        subject: 'Report',
        action: 'Manage',
      },
      {
        title: $gettext('Analytics'),
        to: { name: 'report-customer-profitability' },
        subject: 'EbitNote',
        action: 'GET',
      },
      {
        title: $gettext('Compliance'),
        to: { name: 'report-vat-report' },
        subject: 'EbitNote',
        action: 'GET',
      },
      {
        ...gated(Feature.EdiIntegration, $gettext('EDI Log')),
        to: { name: 'report-edi-log' },
        subject: 'Integration',
        action: 'GET',
      },
    ]
  },
  {
    title: $gettext('Settings'),
    icon: { icon: 'tabler-settings-cog' },
    children: [
      {
        title: $gettext('User & Group'),
        to: { name: 'setting-users' },
        subject: 'User',
        action: 'GET'
      },
      {
        title: $gettext('Global Setting'),
        to: { name: 'setting-global-setting' },
        subject: 'Config',
        action: 'GET'
      },
      {
        title: $gettext('Company Info'),
        to: { name: 'setting-company' },
        subject: 'Config',
        action: 'GET'
      },
      {
        ...gated(Feature.Locations, $gettext('Locations')),
        to: { name: 'setting-location' },
        subject: 'Location',
        action: 'MANAGE'
      },
      {
        ...gated(Feature.Departments, $gettext('Departments')),
        to: { name: 'setting-department' },
        subject: 'Department',
        action: 'MANAGE'
      },
      {
        title: $gettext('Pages'),
        to: { name: 'setting-pages' },
        subject: 'Config',
        action: 'GET'
      },
      {
        ...gated(Feature.EdiIntegration, $gettext('EDI Connectors')),
        to: { name: 'setting-integration-connectors' },
        subject: 'Integration',
        action: 'MANAGE',
      },
    ]
  },
  {
    title: $gettext('Library'),
    icon: { icon: 'tabler-vocabulary' },
    children: [
      {
        title: $gettext('General'),
        to: { name: 'library-package-type-transport-type', params: { transportType: airSlug } },
        subject: 'PackageType',
        action: 'GET',
      },
      {
        title: $gettext('Charges'),
        to: firstLibraryChargeRouteFromAbilities(),
        subject: 'Charge',
        action: ['MANAGE_Local', 'MANAGE_Service', 'MANAGE_Customs', 'MANAGE_Freight'],
      },
      {
        title: $gettext('Customs'),
        to: { name: 'library-hs-code' },
        subject: 'HsCode',
        action: 'MANAGE',
      },
      {
        title: $gettext('Tax'),
        to: { name: 'library-tax-group' },
        subject: 'TaxGroup',
        action: 'GET',
      },
      {
        title: $gettext('Insurance'),
        to: { name: 'library-cargo-claim' },
        subject: 'Config',
        action: 'GET',
      },
    ],
  },
]
  const isItemLocked = item =>
    item.disabled === true ||
    (item.children?.length > 0 && item.children.every(child => child.disabled === true))

  return [
    ...navItems.filter(item => !isItemLocked(item)),
    ...navItems.filter(item => isItemLocked(item)),
  ]
}
