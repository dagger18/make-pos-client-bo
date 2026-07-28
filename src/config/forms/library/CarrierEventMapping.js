export function layout() {
  return [
    { cols: 12, md: 4, field: 'carrierScac',            label: $gettext('Carrier SCAC'),             type: 'text',   required: true },
    { cols: 12, md: 4, field: 'carrierEventCode',        label: $gettext('Carrier Event Code'),       type: 'text',   required: true },
    { cols: 12, md: 4, field: 'confidence',              label: $gettext('Confidence'),               type: 'select', required: true,
      items: ['HIGH', 'MEDIUM', 'LOW'] },
    { cols: 12, md: 8, field: 'carrierEventDescription', label: $gettext('Carrier Event Description'), type: 'text' },
    { cols: 12, md: 4, field: 'milestoneCode',           label: $gettext('Milestone Code'),           type: 'text' },
  ]
}
