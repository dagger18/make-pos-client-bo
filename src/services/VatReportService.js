export default {
  getVatReport: (from, to) => $api(`/report/vat?from=${from}&to=${to}`),
}
