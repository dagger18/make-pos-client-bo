import MonthPicker from '@/components/form/MonthPicker.vue';
import CommonService from '@/services/CommonService';
export const makeDefaultEntity = async () => {
  return {}
}
export const downloadMonthlyLayout = (entity) => {
  const { required } = CommonService.rules()
  return [  
    [
      [
        { 
            name: 'language', text: $gettext('Language'), type: 'select', rules: [required],
            returnObject: false,
            items: [
              {value: 'en', title: $gettext('English')},
              {value: 'vi', title: $gettext('Vietnamese')},
            ]
        },
        {
            text: $gettext('Month'),
            rules: [required],
            name: 'month',
            type: 'custom',
            component: MonthPicker
        }
      ],
    ]
  ]
}
