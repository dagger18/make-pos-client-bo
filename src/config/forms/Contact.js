import { useGettext } from "vue3-gettext";
export const makeDefaultEntity = async () => {
  return {
    firstName: ''
  }
}
export const layout = (entity) => {
  const { $gettext } = useGettext();
  return [
    [
      [{ name: 'salutation', text: $gettext('Salutation'), columnSpan: 2 }],
      [{ name: 'firstName', text: $gettext('First Name'), columnSpan: 4 }],
      [{ name: 'lastName', text: $gettext('Last Name'), columnSpan: 4 }],
      [{ name: 'title', text: $gettext('Title'), columnSpan: 4 }],
    ],
    [
      [{ name: 'email', text: $gettext('Email'), columnSpan: 4 }],
      [{ name: 'phone', text: $gettext('Phone'), columnSpan: 4 }],
      [{ name: 'mobile', text: $gettext('Mobile'), columnSpan: 4 }],
    ],
    [
      [{ name: 'whatsapp', text: $gettext('WhatsApp'), columnSpan: 4 }],
      [{ name: 'language', text: $gettext('Language'), columnSpan: 2 }],
      [{ name: 'department', text: $gettext('Department'), columnSpan: 3 }],
      [{ name: 'isActive', text: $gettext('Active'), type: 'checkbox', columnSpan: 3 }],
    ],
    [
      [{
        columnName: $gettext('Notification Preferences')
      }]
    ],
    [
      [{ name: 'receivesInvoice', text: $gettext('Receives Invoices'), type: 'checkbox', columnSpan: 4 }],
      [{ name: 'receivesTracking', text: $gettext('Receives Tracking Updates'), type: 'checkbox', columnSpan: 4 }],
      [{ name: 'receivesArrival', text: $gettext('Receives Arrival Notices'), type: 'checkbox', columnSpan: 4 }],
    ],
  ]
}
