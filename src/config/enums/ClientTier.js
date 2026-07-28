function list() {
  return [
    { value: 'PLATINUM', title: $gettext('Platinum'), color: 'deep-purple' },
    { value: 'GOLD',     title: $gettext('Gold'),     color: 'amber-darken-2' },
    { value: 'SILVER',   title: $gettext('Silver'),   color: 'blue-grey' },
    { value: 'STANDARD', title: $gettext('Standard'), color: 'default' },
  ]
}
export const findByValue = (value) => list().find(s => s.value === value) ?? null
export const getList = () => list()
