export const makeDefaultEntity = () => {
  return {
    type: null,
    containerNumber: null,
    sealNumber: null,
    grossWeight: null,
    cbm: null,
    tare: null,
    packageType: null,
    packageCount: null,
    note: null,
    method: null,
  }
}
export const layout = (entity) => {
  return [  
    [
      [
        {
          name: 'type',
          text: $gettext('Type'),
          groupedInputs: true,
          scrollable: true,
          groupedWidth: '140px',
        },
        {
          name: 'containerNumber',
          text: $gettext('Container No.'),
          groupedWidth: '140px',
        },
        {
          name: 'sealNumber',
          text: $gettext('Seal No.'),
          groupedWidth: '140px',
        },
        {
          name: 'grossWeight',
          text: $gettext('Gross Weight'),
          groupedWidth: '140px',
        },
        {
          name: 'cbm',
          text: $gettext('Measurement') + '(CBM)',
          groupedWidth: '180px',
        },
        {
          name: 'tare',
          text: $gettext('Tare'),
          groupedWidth: '120px',
        },
        {
          name: 'packageType',
          text: $gettext('Package Type'),
          groupedWidth: '120px',
        },
        {
          name: 'packageCount',
          text: $gettext('No of Pkgs'),
          groupedWidth: '120px',
        },
        {
          text: $gettext('VGM'),
          type: 'text',
          groupedWidth: '120px',
        },
        {
          name: 'note',
          text: $gettext('Note'),
          groupedWidth: '120px',
        },
        {
          name: 'method',
          text: $gettext('Method'),
          groupedWidth: '120px',
        },
      ]
    ]
  ]
}
