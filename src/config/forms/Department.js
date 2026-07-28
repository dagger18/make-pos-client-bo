import CommonService from '@/services/CommonService';
import { getList as getShipmentTypeList } from '@/config/enums/ShipmentType';
import BranchService from '@/services/BranchService';
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
          name: 'branch',
          text: $gettext('Branch'),
          type: 'select-search',
          apiEndpoint: BranchService,
        }
      ],
      [
        {
          name: 'direction',
          text: $gettext('Direction'),
          type: 'select',
          items: getShipmentTypeList,
          clearable: true,
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
  ]
}
