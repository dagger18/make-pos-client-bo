import ComponentSeries from '@/components/form/ComponentSeries.vue';
import { enums as ComponentType, getList as getComponentTypes } from '@/config/enums/ComponentType';
import CommonService from '@/services/CommonService';
import { useAppStore } from '@/stores/appStore';
export const makeDefaultEntity = async (context) => {
  console.log('context on new component', context)
  return {
    page: context.page,
    orderNumber: context.orderNumber,
    rowNumber: context.rowNumber
  }
}
export const layout = (entity) => {
  const { required } = CommonService.rules()
  return [ 
    [
      [
        {
          name: 'type',
          text: $gettext('Report Type'),
          rules: [required],
          type: 'select',
          items: getComponentTypes,
          returnObject: false
        }
      ],
      [
        {
          name: 'dataset',
          text: $gettext('Dataset'),
          rules: [required],
          type: 'select',
          items: useAppStore().getList('datasets'),
          itemTitle: 'name',
          itemValue: 'id'
        }
      ],
      [
        {
          name: 'title',
          text: $gettext('Title')
        }
      ],
      [
        {
          name: 'columnWidth',
          text: $gettext('Column Width'),
          type: 'select',
          items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        }
      ]
    ], 
    ((entity.type === ComponentType.ColumnLine
      || entity.type === ComponentType.Pie)
      && entity.dataset) 
    ? [
      [
        {
          columnName: $gettext('Series')
        },
        {
          name: 'series',
          type: 'custom',
          component: ComponentSeries,
          context: {
            dataset: entity.dataset
          }
        }
      ],
      [
        {
          columnName: 'empty',
          text: 'empty'
        },
        {
          name: 'stacked',
          type: 'checkbox',
          text: $gettext('Column Style'),
          label: $gettext('Stacked')
        }
      ],
    ] : []
  ]
}
