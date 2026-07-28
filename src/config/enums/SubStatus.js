const byStatus = {
  DR: [
    { value: 'PENDING_BOOKING', title: $gettext('Pending Booking') },
  ],
  PE: [
    { value: 'AWAITING_SI',           title: $gettext('Awaiting SI') },
    { value: 'SI_SUBMITTED',          title: $gettext('SI Submitted') },
    { value: 'AWAITING_VGM',          title: $gettext('Awaiting VGM') },
    { value: 'VGM_SUBMITTED',         title: $gettext('VGM Submitted') },
    { value: 'AWAITING_CARGO_RECEIPT',title: $gettext('Awaiting Cargo Receipt') },
    { value: 'CARGO_RECEIVED',        title: $gettext('Cargo Received') },
  ],
  AC: [
    { value: 'LOADED_ON_BOARD',       title: $gettext('Loaded on Board') },
    { value: 'VESSEL_DEPARTED',       title: $gettext('Vessel Departed') },
    { value: 'AT_TRANSSHIPMENT_PORT', title: $gettext('At Transshipment Port') },
    { value: 'VESSEL_ARRIVED',        title: $gettext('Vessel Arrived') },
    { value: 'CUSTOMS_CLEARANCE',     title: $gettext('Customs Clearance') },
    { value: 'CUSTOMS_RELEASED',      title: $gettext('Customs Released') },
    { value: 'OUT_FOR_DELIVERY',      title: $gettext('Out for Delivery') },
    { value: 'DELIVERED',             title: $gettext('Delivered') },
    { value: 'POD_RECEIVED',          title: $gettext('POD Received') },
  ],
  CO: [
    { value: 'INVOICED',              title: $gettext('Invoiced') },
    { value: 'FULLY_PAID',            title: $gettext('Fully Paid') },
    { value: 'CLOSED_WITH_VARIANCE',  title: $gettext('Closed with Variance') },
  ],
  CA: [
    { value: 'CANCELLED_BY_CUSTOMER', title: $gettext('Cancelled by Customer') },
    { value: 'CANCELLED_NO_SPACE',    title: $gettext('Cancelled – No Space') },
    { value: 'ROLLED_OVER',           title: $gettext('Rolled Over') },
  ],
}

export const getListForStatus = (statusValue) => byStatus[statusValue] ?? []

export const findByValue = (value) => {
  for (const items of Object.values(byStatus)) {
    const found = items.find(s => s.value === value)
    if (found) return found
  }
  return null
}
