function list() {
  return [
    { value: 'OCEAN',   title: $gettext('Ocean') },
    { value: 'AIR',     title: $gettext('Air') },
    { value: 'ROAD',    title: $gettext('Road') },
    { value: 'RAIL',    title: $gettext('Rail') },
    { value: 'COURIER', title: $gettext('Courier') },
    { value: 'NVOCC',   title: $gettext('NVOCC') },
  ]
}
export const getList = () => list()
export const findByValue = (value) => list().find(s => s.value === value) ?? null
