import { getList as clientTierList } from '@/config/enums/ClientTier';
import { getList as clientTypeList } from '@/config/enums/ClientType';
import { getList as residenceTypeList } from '@/config/enums/ResidenceType';
import { gettext } from '@/plugins/gettext';
import CommonService from '@/services/CommonService';
import { useAppStore } from "@/stores/appStore";
export const makeDefaultEntity = async () => {
  return {
    name: null
  }
}
export const layout = (entity) => {
  const { required } = CommonService.rules()
  const { $gettext } = gettext
  const appStore = useAppStore()
  return [
    [
      [{ columnName: $gettext('General'), isTopLegend: true }]
    ],
    [
      [{ name: 'name', text: $gettext('Company Name'), rules: [required], columnSpan: 7 }],
      [{ name: 'tradingName', text: $gettext('Trading Name'), columnSpan: 5 }],
    ],
    [
      [{ name: 'code', text: $gettext('Client Id'), rules: [required], columnSpan: 3 }],
      [{ name: 'taxNumber', text: $gettext('Tax Number'), columnSpan: 3 }],
      [{ name: 'registrationNo', text: $gettext('Registration No.'), columnSpan: 3 }],
      [{ name: 'website', text: $gettext('Website'), columnSpan: 3 }],
    ],
    [
      [{ name: 'address', text: $gettext('Address'), columnSpan: 9 }],
      [{ name: 'phone', text: $gettext('Phone'), columnSpan: 3 }],
    ],
    [
      [{ name: 'email', text: $gettext('Email'), columnSpan: 3 }],
      [{ name: 'province', text: $gettext('State/Province'), columnSpan: 3 }],
      [{ name: 'city', text: $gettext('City'), columnSpan: 3 }],
      [{ name: 'zipCode', text: $gettext('Zip Code'), columnSpan: 1 }],
      [{ name: 'country', text: $gettext('Country'), columnSpan: 2 }],
    ],
    [
      [
        { name: 'note', text: $gettext('Note'), type: 'textarea', rows: 5, columnSpan: 6 }
      ],
      [
        { name: 'type', text: $gettext('Client Type'), type: 'select', rules: [required], items: clientTypeList, columnSpan: 3, returnObject: false },
        { name: 'priceMarkup', text: $gettext('Pricing Level'), type: 'select', rules: [required], items: appStore.getList('priceMarkups'), itemValue: 'id', itemTitle: 'name' },
      ],
      [
        { name: 'tier', text: $gettext('Client Tier'), type: 'select', items: clientTierList(), columnSpan: 3, returnObject: false },
        { name: 'residenceType', text: $gettext('Residence Type'), type: 'select', items: residenceTypeList, columnSpan: 3, returnObject: false },
        { name: 'establishmentDate', text: $gettext('Establishment Date'), type: 'datePicker' },
        { name: 'isActive', text: $gettext('Active'), type: 'checkbox' },
      ]
    ],
    [[{ columnName: $gettext('Credit Terms') }]],
    [
      [{ name: 'creditLimit', text: $gettext('Credit Limit'), type: 'number', numberMode: 'money' }],
      [{ name: 'creditPeriod', text: $gettext('Credit Period'), suffix: $gettext('days') }],
    ],
  ]
}
