function list() {
  return [
    { value: 'ACTIVE',      title: $gettext('Active'),      color: 'success' },
    { value: 'ON_HOLD',     title: $gettext('On Hold'),     color: 'warning' },
    { value: 'BLOCKED',     title: $gettext('Blocked'),     color: 'error' },
    { value: 'BLACKLISTED', title: $gettext('Blacklisted'), color: 'error' },
  ]
}
export const findByValue = (value) => list().find(s => s.value === value) ?? null
export const getList = () => list()
