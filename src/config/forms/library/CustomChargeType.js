import CommonService from '@/services/CommonService';
export const makeDefaultEntity = async () => {
  return {
    name: ''
  }
}
export const layout = (entity) => {
  const { required } = CommonService.rules()
  return [  
    [
      [
        {
          name: 'name',
          text: $gettext('Name'),
          rules: [required],
          columnSpan: 4
        }
      ]
    ],
    [
      [
        {
          name: 'description',
          text: $gettext('Description'),
          type: 'textarea'
        }
      ]
    ]
  ]
}
