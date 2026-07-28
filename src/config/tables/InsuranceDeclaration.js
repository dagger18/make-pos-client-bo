const fmt2 = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const filterConfigs = [
  {
    key: 'status', label: 'Status', type: 'select',
    options: ['DRAFT', 'SUBMITTED', 'ACKNOWLEDGED'].map(v => ({ title: v, value: v })),
  },
]

export const headers = () => [
  { title: 'Ref', key: 'declarationRef', width: 180 },
  { title: 'Policy', key: 'policy', renderObject: (item) => item.policy?.policyNumber ?? '—' },
  { title: 'Period From', key: 'periodFrom', width: 120 },
  { title: 'Period To', key: 'periodTo', width: 120 },
  { title: '# Certs', key: 'certificateCount', align: 'end', width: 80 },
  { title: 'Total Insured', key: 'totalInsuredValue', renderObject: (item) => fmt2(item.totalInsuredValue), align: 'end' },
  { title: 'Total Premium', key: 'totalPremium', renderObject: (item) => fmt2(item.totalPremium), align: 'end' },
  { title: 'CCY', key: 'currency', width: 60 },
  { title: 'Status', key: 'status', renderSlot: 'status', width: 120 },
  { title: 'Submitted At', key: 'submittedAt', renderObject: (item) => item.submittedAt ?? '—', width: 160 },
  { title: '', key: 'action', renderSlot: 'action', sortable: false, width: 130 },
]
