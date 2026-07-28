import { enums as TransportType } from '@/config/enums/TransportType';
import CommonService from '@/services/CommonService';
import { useAppStore } from '@/stores/appStore';
import { $gettext } from '@/utils/api';
import AirSubLayout from './BookingAir';
import SeaSubLayout from './BookingSea';
export const makeDefaultEntity = async () => {
  return {
    code: ''
  }
}
function subLayout (transportType) {
  if(transportType === TransportType.AIR)
    return AirSubLayout
  if(transportType === TransportType.Ocean)
    return SeaSubLayout
}

export const layout = (entity) => {
  const { required } = CommonService.rules()
  const appStore = useAppStore()

  return [  
    [
      [
        {
          name: 'code',
          text: $gettext('Booking No.'),
          rules: [required]
        }
      ],
      [
        {
          name: 'codeReference',
          text: $gettext('Booking Number Reference')
        }
      ]
    ],
    [
      [
        {
          name: 'bookingDate',
          text: $gettext('Booking Date'),
          type: 'datePicker'
        }
      ],
      [
        {
          name: 'bookingTo',
          text: $gettext('Booking To'),
          type: 'combobox',
          items: appStore.getList('clients'),
          itemTitle: 'name',
          itemValue: 'id'
        }
      ]
    ],
    [
      [
        {
          name: 'note',
          text: $gettext('Booking Note'),
          type: 'textarea'
        }
      ]
    ],
    [
      [
        {
          columnName: $gettext('Origin'),
          isTopLegend: true
        },
        {
          name: 'originSubForm',
          type: 'subForm',
          layout: subLayout(entity.transportType).layoutOrigin,
          makeDefaultEntity: () =>{}
        }
      ],
      [
        {
          columnName: $gettext('Destination'),
          isTopLegend: true
        },
        {
          name: 'destinationSubForm',
          type: 'subForm',
          layout: subLayout(entity.transportType).layoutDestination,
          makeDefaultEntity: () =>{}
        },
        {
          columnName: $gettext('Booking Consignment'),
        },
        {
          name: 'consignmentSubForm',
          type: 'subForm',
          layout: subLayout(entity.transportType).layoutConsignment,
          makeDefaultEntity: () =>{}
        },
        {
          columnName: $gettext('Contact Infomation'),
        },
        {
          name: 'contactSubForm',
          type: 'subForm',
          layout: subLayout(entity.transportType).layoutContact,
          makeDefaultEntity: () =>{}
        },
        {
          columnName: $gettext('Transit Port (TODO)')
        }
      ]
    ]
  ]
}
