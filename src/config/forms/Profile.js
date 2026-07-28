import CommonService from '@/services/CommonService';
import { useAppStore } from "@/stores/appStore";
export const makeDefaultEntity = async () => {
  return {
    firstName: ''
  }
}
export const layout = (entity) => {
  const { required } = CommonService.rules()
  const appStore = useAppStore()
  return [  
    [
      [
        {
          name: 'firstName',
          text: $gettext('First Name'),
          rules: [required]
        }
      ],
      [
        {
          name: 'lastName',
          text: $gettext('Last Name'),
          rules: [required]
        }
      ],
      [
        {
          name: 'title',
          text: $gettext('Title'),
        }
      ]
    ],  
    [
      [
        {
          name: 'email',
          text: $gettext('Email'),
          rules: [required],
          disabled: true
        }
      ],
      [
        {
          name: 'userGroup',
          text: $gettext('Group'),
          type: 'select',
          items: [],
          itemValue: 'id',
          itemTitle: 'name',
          rules: [required],
          disabled: true
        }
      ],
      [
        {
          name: 'phone',
          text: $gettext('Phone'),
        }
      ]
    ]
  ]
}
export const layoutSmtp = (entity) => {
  const { required } = CommonService.rules()
  return [  
    [
      [
        {
          name: 'smtpServer',
          text: $gettext('SMTP Server'),
          rules: [required]
        }
      ],
      [
        {
          name: 'smtpPort',
          text: $gettext('Port'),
          rules: [required]
        }
      ]
    ],  
    [
      [
        {
          name: 'smtpUsername',
          text: $gettext('Username'),
          rules: [required],
        }
      ],
      [
        {
          name: 'smtpPassword',
          text: $gettext('Password'),
          type: 'password',
          rules: [required],
        }
      ]
    ]
  ]
}
