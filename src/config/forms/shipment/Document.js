
import CommonService from "@/services/CommonService"
export const makeDefaultEntity = () => {
  return {}
}
export const layout = (entity) => {
  const { required } = CommonService.rules()
  return [  
    entity.id ? [] : [
      [
        {
          name: 'mediaFile',
          text: $gettext('File'),
          rules: [required],
          type: 'uploader',
          uploadInstantly: false,
          single: true
        }
      ],
    ],
    [
      [
        {
          name: 'category',
          text: $gettext('Type'),
          rules: [required],
          type: 'select',
          items: ['', 'MAWB', 'OTHERS']
        }
      ],
      [
        {
          name: 'note',
          text: $gettext('Note'),
          type: 'textarea',
        }
      ],
    ],
  ]
}
