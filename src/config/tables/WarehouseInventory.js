export const filterConfigs = () => [
  {
    title: $gettext('Condition'),
    value: 'condition_code',
    type: 'select',
    items: [
      { value: 'GOOD',        title: $gettext('Good') },
      { value: 'DAMAGED',     title: $gettext('Damaged') },
      { value: 'SHORT',       title: $gettext('Short') },
      { value: 'EXCESS',      title: $gettext('Excess') },
      { value: 'WET',         title: $gettext('Wet') },
      { value: 'CONTAMINATED',title: $gettext('Contaminated') },
    ],
  },
  {
    title: $gettext('Receipt Type'),
    value: 'receipt_type',
    type: 'select',
    items: [
      { value: 'INBOUND',  title: $gettext('Inbound') },
      { value: 'OUTBOUND', title: $gettext('Outbound') },
      { value: 'TRANSFER', title: $gettext('Transfer') },
    ],
  },
]

export const headers = () => [
  { key: 'receipt_number',   text: $gettext('Receipt #') },
  { key: 'shipment_id',      text: $gettext('Shipment'),     style: 'width: 100px;' },
  { key: 'receipt_type',     text: $gettext('Type'),         style: 'width: 100px;' },
  { key: 'storage_zone',     text: $gettext('Zone'),         style: 'width: 80px;' },
  { key: 'storage_location', text: $gettext('Location'),     style: 'width: 110px;' },
  {
    key: 'pieces_received',
    text: $gettext('Pcs'),
    style: 'width: 70px;',
    headerClass: 'text-right',
    bodyClass: 'text-right',
  },
  {
    key: 'gross_weight_kg',
    text: $gettext('Weight (kg)'),
    style: 'width: 110px;',
    headerClass: 'text-right',
    bodyClass: 'text-right',
    renderObject(item) { return item.gross_weight_kg ? Number(item.gross_weight_kg).toFixed(3) : '—' },
  },
  {
    key: 'volume_cbm',
    text: $gettext('CBM'),
    style: 'width: 90px;',
    headerClass: 'text-right',
    bodyClass: 'text-right',
    renderObject(item) { return item.volume_cbm ? Number(item.volume_cbm).toFixed(4) : '—' },
  },
  { key: 'condition_code', text: $gettext('Condition'), renderSlot: 'condition', style: 'width: 120px;' },
  {
    key: 'received_at',
    text: $gettext('Received'),
    style: 'width: 140px;',
    renderObject(item) { return item.received_at ? item.received_at.slice(0, 16).replace('T', ' ') : '—' },
  },
]
