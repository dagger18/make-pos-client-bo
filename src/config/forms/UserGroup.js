import GroupPermissions from '@/components/form/GroupPermissions.vue';
import CommonService from '@/services/CommonService';
import { useGettext } from "vue3-gettext";
export const makeDefaultEntity = async () => {
  return {
    name: ''
  }
}
export const layout = (entity) => {
  const { required } = CommonService.rules()
  const { $gettext } = useGettext();
  return [  
    [
      [
        {
          name: 'name',
          text: $gettext('Group Name'),
          rules: [required]
        }
      ],
      [
        {
          name: 'description',
          text: $gettext('Description')
        }
      ]
    ],
    [
      [
        {
          columnName: $gettext('Permissions')
        }
      ]
    ],  
    [
      [
        {
          name: 'permissions',
          type: 'custom',
          component: GroupPermissions
        }
      ],
    ]
  ]
}
