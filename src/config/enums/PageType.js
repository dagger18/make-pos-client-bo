const list = [
    { 'enums': 'ReportShipment',      'value': 'report-shipment',      'title': $gettext('Report Shipment'),      'group': 'report' },
    { 'enums': 'ReportStaff',         'value': 'report-staff',         'title': $gettext('Report Staff'),         'group': 'report' },
    { 'enums': 'ReportCharge',        'value': 'report-charge',        'title': $gettext('Report Charge'),        'group': 'report' },
    { 'enums': 'ManageShipment',      'value': 'manage-shipment',      'title': $gettext('Manage Shipment'),      'group': 'manage' },
    { 'enums': 'ManageClient',        'value': 'manage-client',        'title': $gettext('Manage Client'),        'group': 'manage' },
    { 'enums': 'ManageProvider',      'value': 'manage-provider',      'title': $gettext('Manage Provider'),      'group': 'manage' },
    { 'enums': 'ManageQuote',         'value': 'manage-quote',         'title': $gettext('Manage Quote'),         'group': 'manage' },
    { 'enums': 'ManageAccounting',    'value': 'manage-accounting',    'title': $gettext('Manage Accounting'),    'group': 'manage' },
    { 'enums': 'ManageNotification',  'value': 'manage-notification',  'title': $gettext('Manage Notification'),  'group': 'manage' },
]
export const enums = list.reduce(function(result, item, index) {
  result[item.enums] = item.value;
  return result;
}, {})
export const getList = list.map(({value, title}) => {return {value, title}})
export const getTitle = (findValue) => {
  if(!findValue) return null
  const found = list.find(({value}) => value === findValue)
  return found?.title ?? findValue
}
export const allPageTypes = list

