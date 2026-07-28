import CommonService from '@/services/CommonService'

export const makeDefaultEntity = async () => ({
  code: '',
  description: '',
  level: null,
  digits: null,
  countryCode: null,
  hsVersion: null,
  isActive: true,
  effectiveFrom: null,
  effectiveTo: null,
  parent: null,
})

export const layout = () => {
  const { required } = CommonService.rules()
  return [
    [
      [{ name: 'code', text: $gettext('HS Code'), rules: [required], columnSpan: 2 }],
      [{ name: 'description', text: $gettext('Description'), rules: [required], columnSpan: 4 }],
    ],
    [
      [{ name: 'level', text: $gettext('Level'), type: 'number', columnSpan: 1 }],
      [{ name: 'digits', text: $gettext('Digits'), type: 'number', columnSpan: 1 }],
      [{ name: 'countryCode', text: $gettext('Country Code'), columnSpan: 1 }],
      [{ name: 'hsVersion', text: $gettext('HS Version'), columnSpan: 1 }],
    ],
    [
      [{ name: 'effectiveFrom', text: $gettext('Effective From'), type: 'date', columnSpan: 2 }],
      [{ name: 'effectiveTo', text: $gettext('Effective To'), type: 'date', columnSpan: 2 }],
    ],
    [
      [{ name: 'isActive', text: $gettext('Active'), type: 'checkbox', columnSpan: 2 }],
    ],
  ]
}
