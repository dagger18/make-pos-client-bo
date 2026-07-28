const BASE = 'report'
export default {
  onTimeRate (from, to)           { return $api(`${BASE}/kpi/on-time-rate?from=${from}&to=${to}`) },
  conversionRate (from, to)       { return $api(`${BASE}/kpi/conversion-rate?from=${from}&to=${to}`) },
  operatorProductivity (from, to) { return $api(`${BASE}/kpi/operator-productivity?from=${from}&to=${to}`) },
  dso (from, to)                  { return $api(`${BASE}/kpi/dso?from=${from}&to=${to}`) },
  customerProfitability (from, to){ return $api(`${BASE}/analytics/customer-profitability?from=${from}&to=${to}`) },
  topLanes (from, to, limit = 20) { return $api(`${BASE}/analytics/top-lanes?from=${from}&to=${to}&limit=${limit}`) },
  exceptions (from, to)           { return $api(`${BASE}/analytics/exceptions?from=${from}&to=${to}`) },
  operationalDashboard ()         { return $api(`${BASE}/analytics/operational-dashboard`) },
  dashboardStats ()               { return $api(`${BASE}/analytics/dashboard-stats`) },
}
