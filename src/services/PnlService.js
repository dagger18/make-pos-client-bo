export default {
  periodPnl(from, to)        { return $api(`report/profit-loss?from=${from}&to=${to}`) },
  departmentPnl(from, to)    { return $api(`report/profit-loss/department?from=${from}&to=${to}`) },
  costSheet(shipmentId)      { return $api(`report/cost-sheet/${shipmentId}`) },
  accountingClose(shipId)    { return $api(`report/accounting-close/${shipId}`, { method: 'POST' }) },
}
