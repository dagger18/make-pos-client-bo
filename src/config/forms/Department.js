import CommonService from '@/services/CommonService';
import { getList as getShipmentTypeList } from '@/config/enums/ShipmentType';
import LocationService from '@/services/LocationService';
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
          name: 'location',
          text: $gettext('Location'),
          type: 'select-search',
          apiEndpoint: LocationService,
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
