import { test } from '@playwright/test'
import { ReportPage } from '../../pages/reports/ReportPage'

const reports = [
  'kpi',
  'shipment',
  'co2-emissions',
  'vat-report',
  'audit-log',
  'carrier-performance',
  'charge',
  'compliance-dashboard',
  'customer-profitability',
  'department-pnl',
  'exception',
  'rate-benchmark',
  'sales-commission',
  'sales-target',
  'staff',
  'top-lanes',
]

for (const report of reports) {
  test(`report page loads: ${report}`, async ({ page }) => {
    const r = new ReportPage(page)
    await r.goto(report)
    await r.expectLoaded()
  })
}
