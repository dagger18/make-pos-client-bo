export const makeDefaultEntity = () => {
  return {
    length: null,
    width: null,
    height: null,
    pieces: null,
    unit: 'CM'
  }
}
export const layout = (entity) => {
  return [  
    [
      [
        {
          name: 'length',
          text: $gettext('Length'),
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
          name: 'pieces',
          text: $gettext('Pcs'),
          type: 'number',
        },
        {
          text: 'empty',
          name: 'unit',
          type: 'select',
          items: ['CM', 'M']
        }
      ]
    ]
  ]
}
