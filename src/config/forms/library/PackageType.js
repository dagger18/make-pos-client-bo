import { getPackageTypeList, enums as TRANSPORT_TYPE } from '@/config/enums/TransportType';
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
      ],
      [
        {
          name: 'transportType',
          text: $gettext('Transport Type'),
          rules: [required],
          type: 'btnSelectGroup',
          items: getPackageTypeList(),
          columnSpan: 4
        }
      ],
    ],
    entity.transportType === TRANSPORT_TYPE.AIR ? null : [
      [
        {
          columnName: $gettext('Dimensions Cargo')
        }
      ]
    ], 
    entity.transportType === TRANSPORT_TYPE.AIR ? null : [
      [
        {
          name: 'length',
          text: $gettext('Length (m)'),
          rules: [required]
        }
      ],
      [
        {
          name: 'width',
          text: $gettext('Width (m)'),
          rules: [required]
        }
      ],
      [
        {
          name: 'height',
          text: $gettext('Height (m)'),
          rules: [required]
        }
      ],
    ],
    [
      [
        {
          name: 'weight',
          text: entity.transportType === TRANSPORT_TYPE.AIR ? $gettext('KGS') : $gettext('Gross Weight (Kgs)'),
          rules: [required],
          columnSpan: 3
        }
      ],
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
