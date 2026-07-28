function list() {
  return [
    { value: 'REGISTERED', title: $gettext('Registered') },
    { value: 'BILLING',    title: $gettext('Billing') },
    { value: 'WAREHOUSE',  title: $gettext('Warehouse') },
    { value: 'PICKUP',     title: $gettext('Pickup') },
    { value: 'DELIVERY',   title: $gettext('Delivery') },
  ]
}
export const getList = () => list()
export const findByValue = (value) => list().find(s => s.value === value) ?? null
