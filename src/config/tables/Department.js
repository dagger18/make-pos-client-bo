import { getTitle as getShipmentTypeTitle } from '@/config/enums/ShipmentType';
export const filterConfigs = () => {
  return [
    {
      title: $gettext('Name'),
      value: 'name',
      type: 'text'
    },
  ]
}

export const headers = () => {
  return [
    { key: 'name', text: $gettext('Name') },
    {
      key: 'branch',
      text: $gettext('Branch'),
      sortable: false,
      renderObject(item) {
        return item.branch?.name ?? '-'
      }
    },
    {
      key: 'direction',
      text: $gettext('Direction'),
      renderObject(item) {
        return item.direction ? getShipmentTypeTitle(item.direction) : '-'
      }
    },
    {
      key: 'isActive',
      text: $gettext('Active'),
      renderObject(item) {
        return item.isActive ? $gettext('Yes') : $gettext('No')
      }
    },
    {
      key: 'id',
      text: $gettext('Action'),
      sortable: false,
      renderSlot: 'action',
      bodyClass: 'px-0',
      headerClass: 'text-end pe-4'
    },
  ]
}
