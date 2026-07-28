import CommonService from '@/services/CommonService';
export const makeDefaultEntity = async () => {
  return {
    name: '',
    isActive: true,
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
        }
      ],
      [
        {
          name: 'code',
          text: $gettext('Code'),
        }
      ],
      [
        {
          name: 'isActive',
          text: $gettext('Active'),
          type: 'checkbox',
        }
      ],
    ],
    [
      [
        {
          name: 'address',
          text: $gettext('Address'),
          type: 'textarea',
        }
      ],
      [
        {
          name: 'phone',
          text: $gettext('Phone'),
        }
      ],
    ],
  ]
}
