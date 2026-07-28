import CommonService from '@/services/CommonService'

export const makeDefaultEntity = async () => ({
  hsCode: null,
  countryCode: null,
  restrictionType: null,
  authority: null,
  licenceType: null,
  effectiveFrom: null,
  effectiveTo: null,
})

export const layout = () => {
  const { required } = CommonService.rules()
  return [
    [
      [{ name: 'hsCode', text: $gettext('HS Code ID'), rules: [required], type: 'number', columnSpan: 2 }],
      [{ name: 'countryCode', text: $gettext('Country Code'), columnSpan: 2 }],
      [{
        name: 'restrictionType',
        text: $gettext('Restriction Type'),
        columnSpan: 3,
        type: 'select',
        items: [
          { title: $gettext('Prohibited'), value: 'PROHIBITED' },
          { title: $gettext('Licence Required'), value: 'LICENCE_REQUIRED' },
          { title: $gettext('Quota'), value: 'QUOTA' },
        ],
      }],
    ],
    [
      [{ name: 'authority', text: $gettext('Authority'), columnSpan: 4 }],
      [{ name: 'licenceType', text: $gettext('Licence Type'), columnSpan: 3 }],
    ],
    [
      [{ name: 'effectiveFrom', text: $gettext('Effective From'), type: 'date', columnSpan: 2 }],
      [{ name: 'effectiveTo', text: $gettext('Effective To'), type: 'date', columnSpan: 2 }],
    ],
  ]
}
