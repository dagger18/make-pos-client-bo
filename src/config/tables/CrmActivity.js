export const filterConfigs = () => [
  {
    title: $gettext('Activity Type'),
    value: 'activityType',
    type: 'select',
    items: [
      { value: 'CALL',       title: $gettext('Call') },
      { value: 'EMAIL',      title: $gettext('Email') },
      { value: 'MEETING',    title: $gettext('Meeting') },
      { value: 'VISIT',      title: $gettext('Visit') },
      { value: 'QUOTE_SENT', title: $gettext('Quote Sent') },
      { value: 'FOLLOW_UP',  title: $gettext('Follow Up') },
    ],
  },
  {
    title: $gettext('Outcome'),
    value: 'outcome',
    type: 'select',
    items: [
      { value: 'POSITIVE',  title: $gettext('Positive') },
      { value: 'NEUTRAL',   title: $gettext('Neutral') },
      { value: 'NEGATIVE',  title: $gettext('Negative') },
      { value: 'NO_ANSWER', title: $gettext('No Answer') },
    ],
  },
]

export const headers = () => [
  { key: 'subject',      text: $gettext('Subject') },
  { key: 'activityType', text: $gettext('Type'),           renderSlot: 'activityType', style: 'width: 120px;' },
  {
    key: 'opportunity',
    text: $gettext('Opportunity'),
    sortable: false,
    renderObject(item) { return item.opportunity?.title ?? '—' },
  },
  { key: 'outcome',     text: $gettext('Outcome'),      renderSlot: 'outcome',     style: 'width: 120px;' },
  {
    key: 'performedBy',
    text: $gettext('Performed By'),
    sortable: false,
    renderObject(item) { return item.performedBy?.name ?? '—' },
  },
  {
    key: 'performedAt',
    text: $gettext('Performed At'),
    style: 'width: 140px;',
    renderObject(item) { return item.performedAt?.slice(0, 16).replace('T', ' ') ?? '—' },
  },
  { key: 'nextActionDate', text: $gettext('Next Action Date'), renderSlot: 'nextActionDate', style: 'width: 140px;' },
  {
    key: 'actions',
    text: '',
    sortable: false,
    renderSlot: 'action',
    bodyClass: 'px-0',
    headerClass: 'text-end pe-4',
    noReport: true,
    style: 'width: 80px;',
  },
]
