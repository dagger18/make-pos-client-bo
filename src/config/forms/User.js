import CommonService from '@/services/CommonService'
import { useAppStore } from "@/stores/appStore"
import { useGettext } from "vue3-gettext"

export const makeDefaultEntity = async () => {
  return {
    firstName: '',
    branches: [],
    departments: [],
  }
}
export const makeInvite = async () => {
  return {
    email: '',
  }
}
export const layoutInvite = entity => {
  const { required } = CommonService.rules()
  const { $gettext } = useGettext()
  const appStore = useAppStore()
  
  return [  
    [
      [
        {
          name: 'email',
          text: $gettext('Email'),
          rules: [required],
        },
      ],
      [
        {
          name: 'userGroup',
          text: $gettext('Group'),
          type: 'select',
          items: appStore.getList('userGroups'),
          itemValue: 'id',
          itemTitle: 'name',
          rules: [required],
        },
      ],
    ],
  ]
}
export const layout = entity => {
  const { required } = CommonService.rules()
  const { $gettext } = useGettext()
  const appStore = useAppStore()
  
  return [  
    [
      [
        {
          name: 'firstName',
          text: $gettext('First Name'),
          rules: [required],
        },
      ],
      [
        {
          name: 'lastName',
          text: $gettext('Last Name'),
          rules: [required],
        },
      ],
      [
        {
          name: 'title',
          text: $gettext('Title'),
        },
      ],
    ],  
    [
      [
        {
          name: 'email',
          text: $gettext('Email'),
          rules: [required],
        },
      ],
      [
        {
          name: 'userGroup',
          text: $gettext('Group'),
          type: 'select',
          items: appStore.getList('userGroups'),
          itemValue: 'id',
          itemTitle: 'name',
          rules: [required],
        },
      ],
      [
        {
          name: 'phone',
          text: $gettext('Phone'),
        },
      ],
    ],
    [
      [
        {
          name: 'branches',
          text: $gettext('Branches'),
          type: 'select',
          items: appStore.getList('branches'),
          itemValue: 'id',
          itemTitle: 'name',
          multiple: true,
          returnObject: true,
        },
      ],
      [
        {
          name: 'departments',
          text: $gettext('Departments'),
          type: 'select',
          items: appStore.getList('departments'),
          itemValue: 'id',
          itemTitle: 'name',
          multiple: true,
          returnObject: true,
        },
      ],
    ],
  ]
}
