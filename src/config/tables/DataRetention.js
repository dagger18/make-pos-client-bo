export const filterConfigs = [
  {
    key: 'dataCategory', label: 'Category', type: 'select',
    options: ['FINANCIAL', 'CUSTOMS', 'JOB_DATA', 'DOCUMENTS', 'PERSONAL', 'AUDIT_LOG', 'MARKETING', 'OTHER']
      .map(v => ({ title: v.replace('_', ' '), value: v })),
  },
]

export const headers = () => [
  { title: 'Category', key: 'dataCategory', renderSlot: 'dataCategory', width: 140 },
  { title: 'Retention (years)', key: 'retentionYears', renderSlot: 'retentionYears', width: 160 },
  { title: 'Legal Basis', key: 'legalBasis', renderObject: (item) => item.legalBasis || '—' },
  { title: 'Applies To', key: 'appliesTo', renderObject: (item) => item.appliesTo || '—' },
  { title: 'Auto-Delete', key: 'autoDelete', renderSlot: 'autoDelete', width: 110 },
  { title: '', key: 'action', renderSlot: 'action', sortable: false, width: 80 },
]
