import CommonService from '@/services/CommonService'

export const makeDefaultEntity = async () => ({
  hsCode: null,
  importCountry: null,
  exportCountry: null,
  rateType: null,
  ftaName: null,
  dutyRate: null,
  vatRate: null,
  exciseRate: null,
  effectiveFrom: null,
  effectiveTo: null,
})

export const layout = () => {
  const { required } = CommonService.rules()
  return [
    [
      [{ name: 'hsCode', text: $gettext('HS Code ID'), rules: [required], type: 'number', columnSpan: 2 }],
      [{ name: 'rateType', text: $gettext('Rate Type'), columnSpan: 2, type: 'select', items: [{ title: 'MFN', value: 'MFN' }, { title: 'FTA', value: 'FTA' }, { title: $gettext('Preferential'), value: 'PREFERENTIAL' }] }],
    ],
    [
      [{ name: 'importCountry', text: $gettext('Import Country'), columnSpan: 2 }],
      [{ name: 'exportCountry', text: $gettext('Export Country'), columnSpan: 2 }],
      [{ name: 'ftaName', text: $gettext('FTA Name'), columnSpan: 4 }],
    ],
    [
      [{ name: 'dutyRate', text: $gettext('Duty Rate (%)'), type: 'number', appendInner: '%', columnSpan: 2 }],
      [{ name: 'vatRate', text: $gettext('VAT Rate (%)'), type: 'number', appendInner: '%', columnSpan: 2 }],
      [{ name: 'exciseRate', text: $gettext('Excise Rate (%)'), type: 'number', appendInner: '%', columnSpan: 2 }],
    ],
    [
      [{ name: 'effectiveFrom', text: $gettext('Effective From'), type: 'date', columnSpan: 2 }],
      [{ name: 'effectiveTo', text: $gettext('Effective To'), type: 'date', columnSpan: 2 }],
    ],
  ]
}
