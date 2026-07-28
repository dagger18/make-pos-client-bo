import { transformDateFilter } from '@/services/CommonService';
import { useAppStore } from '@/stores/appStore';
import { reportGroupColumns as shipmentReportColumns } from '../shipment/Shipment';
export const reportStaffColumns = () => {
  return [
    {
      value: 'activities',
      title: $gettext('Activities')
    },
    {
      value: 'shipmentCreated',
      title: $gettext('Shipment Created')
    },
    {
      value: 'statusUpdate',
      title: $gettext('Update Status')
    },
    {
      value: 'pricingUpdate',
      title: $gettext('Update Pricing')
    },
    {
      value: 'instructionUpdate',
      title: $gettext('Update Instruction')
    },
    {
      value: 'bookingUpdate',
      title: $gettext('Update Booking')
    },
    {
      value: 'documentCreate',
      title: $gettext('Document Upload')
    },
    {
      value: 'ebitnoteCreate',
      title: $gettext('Accounting Activity')
    },
  ]
}
export const reportMultipleStaffColumns = (entityType, rowType, groupColumn) => {
  console.log(groupColumn, 'groupColumn in reportMultipleStaffColumns')
  if(groupColumn === 'activity.createdDate') return reportStaffColumns()
  if(groupColumn === 'shipment.completedDate') return shipmentReportColumns()
}
export const reportStaffFilterConfigs = () => {
  const appStore = useAppStore()
  return [
    {
      title: $gettext('Activity Date'),
      value: 'createdDate',
      type: 'date',
      preSubmitCallback: transformDateFilter
    },
    {
      title: $gettext('Staff'),
      value: 'userId',
      type: 'select',
      apiEndpoint: 'UserService',
      searchOnProperties: ['firstName', 'lastName'],
      itemTitle: 'firstName',
      itemValue: 'id',
      placeholder: $gettext('Select user') + '...'
    }
  ]
}
