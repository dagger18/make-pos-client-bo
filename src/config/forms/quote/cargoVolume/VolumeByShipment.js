import CommonService from '@/services/CommonService';
export const makeDefaultEntity = () => {
  return {
    amount: null,
    volume: null,
    volumeUnit: 'KGS',
    weight: null,
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
          text: $gettext('Total Unit'),
          rules: [required],
          type: 'number',
          columnSpan: 3
        }
      ],
      [
        {
          name: 'volume',
          text: $gettext('Volume Weight'),
          columnSpan: 3,
          type: 'number',
          groupedInputs: true,
        },
        {
          text: 'empty',
          name: 'volumeUnit',
          type: 'select',
          items: ['KGS', 'CBM'],
          groupedWidth: '90px'
        },
      ],
      [
        {
          name: 'weight',
          text: $gettext('Gross Weight'),
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
      ]
    ]
  ]
}
