import { getTableConfig } from "./Dataset"
export const makeDefaultEntity = () => {
  return {
    type: null, // line or column
    color: null,
    column: null,
  }
}
export const layout = (entity, context) => {
  const { showInTableColumns } = getTableConfig(context.dataset)
  return [  
    [
      [
        {
          name: 'type',
          text: $gettext('Type'),
          type: 'select',
          items: [
            {title: $gettext('Column'), value: 'column'},
            {title: $gettext('Line'), value: 'line'},
          ],
          groupedWidth: '140px',
          groupedInputs: true,
          scrollable: true,
          returnObject: false
        },
        {
          name: 'color',
          text: $gettext('Color'),
          type: 'select',
          items: [
            {title: $gettext('Purple'), value: '#7367F0'},
            {title: $gettext('Grey'), value: '#A8AAAE'},
            {title: $gettext('Green'), value: '#28C76F'},
            {title: $gettext('Blue'), value: '#00CFE8'},
            {title: $gettext('Orange'), value: '#FF9F43'},
            {title: $gettext('Red'), value: '#EA5455'},
            {title: $gettext('Pink'), value: '#E91E63'},
            {title: $gettext('Teal'), value: '#009688'},
            {title: $gettext('Cyan'), value: '#00BCD4'},
            {title: $gettext('Lime'), value: '#CDDC39'},
          ],
          groupedWidth: '140px',
          returnObject: false
        },
        {
          name: 'column',
          text: $gettext('Column'),
          groupedWidth: '140px',
          type: 'select',
          returnObject: false,
          items: showInTableColumns
                  .filter((item, index) => index !== 0)
                  .map(({key, text}) => { return {title: text, value: key}})
        },
      ]
    ]
  ]
}
