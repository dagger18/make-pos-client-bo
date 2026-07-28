import CommonService from '@/services/CommonService';
import { useGettext } from "vue3-gettext";
export const makeDefaultEntity = async () => {
  return {
    name: null
  }
}

const nameCodeRow = ($gettext, required) => [
  [{ name: 'name', text: $gettext('Company Name'), rules: [required], columnSpan: 9 }],
  [{ name: 'code', text: $gettext('Provider Id'), rules: [required], columnSpan: 3 }]
]

const addressPhoneRow = ($gettext) => [
  [{ name: 'address', text: $gettext('Address'), columnSpan: 9 }],
  [{ name: 'phone', text: $gettext('Phone'), columnSpan: 3 }]
]

export const layout = (entity) => {
  const { required } = CommonService.rules()
  const { $gettext } = useGettext();
  return [
    nameCodeRow($gettext, required),
    addressPhoneRow($gettext),
    [
      [{ name: 'province', text: $gettext('State/Province') }],
      [{ name: 'city', text: $gettext('City') }],
      [{ name: 'zipCode', text: $gettext('Zip Code') }],
      [{ name: 'country', text: $gettext('Country') }]
    ],
    [
      [
        { name: 'description', text: $gettext('Description'), type: 'textarea', columnSpan: 9 },
        { name: 'taxNumber', text: $gettext('Tax Number') },
        { name: 'trackingUrl', text: $gettext('Tracking URL') },
        { name: 'note', text: $gettext('Note'), type: 'textarea' },
      ],
      [{ name: 'logo', text: $gettext('Logo'), type: 'imageUpload', columnSpan: 3 }]
    ],
    [[{ columnName: $gettext('Credit Terms') }]],
    [
      [{ name: 'creditLimit', text: $gettext('Credit Limit'), type: 'number', numberMode: 'money' }],
      [{ name: 'creditPeriod', text: $gettext('Credit Period'), suffix: $gettext('days') }]
    ],
  ]
}

export const initLayout = (entity) => {
  const { required } = CommonService.rules()
  const { $gettext } = useGettext();
  return [
    nameCodeRow($gettext, required),
    addressPhoneRow($gettext),
    [
      [{ name: 'province', text: $gettext('State/Province') }],
      [{ name: 'city', text: $gettext('City') }],
      [{ name: 'country', text: $gettext('Country') }]
    ],
    [
      [{ name: 'taxNumber', text: $gettext('Tax Number'), columnSpan: 9 }],
      [{ name: 'logo', text: $gettext('Logo'), type: 'imageUpload', columnSpan: 3 }]
    ],
  ]
}
