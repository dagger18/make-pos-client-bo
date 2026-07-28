/**
 * Maps Vue Router route names to user-guide page paths (relative to /docs/user-guide/).
 * Used by useDocsPanel to open the contextually relevant doc when the help button is clicked.
 */
export const ROUTE_DOC = {
  // Dashboard
  'dashboard': 'dashboard.html',

  // Quotes
  'quote-transport-type': 'quotes.html',
  'quote-preview-id': 'quotes.html',
  'quote-update-id': 'quotes.html',
  'quote-request': 'quotes.html',

  // Shipments
  'shipment-transport-type': 'shipments.html',
  'shipment-manifest': 'shipments.html',

  // Consolidations
  'consolidation': 'consolidations.html',
  'consolidation-id': 'consolidations.html',

  // Clients
  'client': 'clients.html',
  'client-id': 'clients.html',

  // Providers
  'provider-provider-type': 'providers.html',
  'provider-id-[id]': 'providers.html',

  // Accounting
  'accounting-ID': 'accounting.html#invoices',
  'accounting-IC': 'accounting.html#invoices',
  'accounting-CO': 'accounting.html#invoices',
  'accounting-PO': 'accounting.html#invoices',
  'accounting-PMT': 'accounting.html#payments',
  'accounting-RPT': 'accounting.html#payments',
  'accounting-journal': 'accounting.html#journal',
  'accounting-ageing-ar': 'accounting.html#ageing',
  'accounting-ageing-ap': 'accounting.html#ageing',
  'accounting-pnl-period': 'accounting.html',

  // Rates
  'rate-freight-transport-type': 'rates.html',
  'rate-local-transport-type': 'rates.html',
  'rate-customs-transport-type': 'rates.html',
  'rate-service-transport-type': 'rates.html',
  'rate-import': 'rates.html',
  'rate-markup': 'rates.html',

  // Carrier tools
  'carrier-vessel-sailing': 'carrier-tools.html#vessel-sailing',
  'carrier-flight-schedule': 'carrier-tools.html#flight-schedule',
  'carrier-container-tracking': 'carrier-tools.html#container-tracking',

  // Warehouse
  'warehouse-facility': 'warehouse.html',
  'warehouse-inventory': 'warehouse.html',

  // CRM
  'crm-leads': 'crm.html',
  'crm-opportunities': 'crm.html',
  'crm-activities': 'crm.html',

  // Reports — operations
  'report-shipment': 'reports.html#operations',
  'report-exception': 'reports.html#operations',
  'report-staff': 'reports.html#operations',

  // Reports — finance
  'report-charge': 'reports.html#finance',
  'report-vat-report': 'reports.html#finance',
  'report-insurance-declaration': 'reports.html#finance',

  // Reports — analytics
  'report-kpi': 'reports.html#analytics',
  'report-customer-profitability': 'reports.html#analytics',
  'report-department-pnl': 'reports.html#analytics',
  'report-top-lanes': 'reports.html#analytics',
  'report-rate-benchmark': 'reports.html#analytics',
  'report-carrier-performance': 'reports.html#analytics',
  'report-sales-commission': 'reports.html#analytics',
  'report-sales-target': 'reports.html#analytics',
  'report-co2-emissions': 'reports.html#analytics',
  'report-dataset': 'reports.html#analytics',

  // Reports — compliance
  'report-compliance-dashboard': 'reports.html#compliance',
  'report-audit-log': 'reports.html#compliance',
  'report-edi-log': 'reports.html#compliance',
  'report-dd-dashboard': 'reports.html#compliance',

  // Settings
  'setting-users': 'settings.html#users',
  'setting-global-setting': 'settings.html#global-settings',
  'setting-company': 'settings.html',
  'setting-branch': 'settings.html#branches',
  'setting-department': 'settings.html#branches',
  'setting-pages': 'settings.html',
  'setting-integration-connectors': 'settings.html#integrations',
  'setting-chart-of-accounts': 'settings.html',

  // Profile
  'profile': 'settings.html',
}

/**
 * Returns the doc page path for a given route name.
 * Falls back to prefix matching for dynamic route families.
 */
export function getDocPage(routeName) {
  if (!routeName) return 'index.html'
  const name = String(routeName)

  if (ROUTE_DOC[name]) return ROUTE_DOC[name]

  // Prefix-based fallbacks for route families
  if (name.startsWith('library-')) return 'library.html'
  if (name.startsWith('report-')) return 'reports.html'
  if (name.startsWith('setting-')) return 'settings.html'
  if (name.startsWith('rate-')) return 'rates.html'
  if (name.startsWith('accounting-')) return 'accounting.html'
  if (name.startsWith('carrier-')) return 'carrier-tools.html'
  if (name.startsWith('warehouse-')) return 'warehouse.html'
  if (name.startsWith('crm-')) return 'crm.html'
  if (name.startsWith('shipment-')) return 'shipments.html'
  if (name.startsWith('quote-')) return 'quotes.html'
  if (name.startsWith('consolidation')) return 'consolidations.html'
  if (name.startsWith('client')) return 'clients.html'
  if (name.startsWith('provider')) return 'providers.html'

  return 'index.html'
}
