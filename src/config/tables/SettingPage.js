import { allPageTypes, getTitle } from '@/config/enums/PageType'

export const filterConfigs = [
  {
    key: 'type', label: 'Page Type', type: 'select',
    options: allPageTypes.map(t => ({ title: t.title, value: t.value })),
  },
]

export const headers = () => [
  { title: '#', key: 'id', width: 60 },
  { title: 'Name', key: 'name' },
  { title: 'Type', key: 'type', renderSlot: 'type', width: 200 },
  { title: 'Order', key: 'orderNumber', width: 80, align: 'end' },
  { title: '', key: 'action', renderSlot: 'action', sortable: false, width: 150 },
]
