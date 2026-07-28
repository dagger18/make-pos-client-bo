import CommonService from '@/services/CommonService';
export const makeDefaultEntity = () => {
  return {
    amount: null,
    dimensionUnit: 'CM',
    weightUnit: 'KGS'
  }
}
export const layout = (entity) => {
  const { required } = CommonService.rules()
  return [  
    [
      [
        {
          name: 'amount',
          text: $gettext('Unit'),
          rules: [required],
          type: 'number',
          columnSpan: 3
        }
      ],
      [
        {
          name: 'length',
          text: $gettext('Length'),
          columnSpan: 6,
          type: 'number',
          groupedInputs: true,
        },
        {
          name: 'width',
          text: $gettext('Width'),
          type: 'number',
        },
        {
          name: 'height',
          text: $gettext('Height'),
          type: 'number',
        },
        {
          text: 'empty',
          name: 'dimensionUnit',
          type: 'select',
          items: ['CM', 'IN']
        },
      ],
      [
        {
          name: 'weight',
          text: $gettext('Weight'),
          type: 'number',
          columnSpan: 3,
          groupedInputs: true
        },
        {
          text: 'empty',
          name: 'weightUnit',
          type: 'select',
          items: ['KGS', 'LBS']
        }
      ],
    ]
  ]
}
