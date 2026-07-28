import { enums as CHARGE_TYPE } from '@/config/enums/ChargeType';
import { getList } from '@/config/enums/TransportType';
import CommonService from '@/services/CommonService';
import { useAppStore } from '@/stores/appStore';
export const makeDefaultEntity = async () => {
  return {
    name: ''
  }
}
export const layout = (entity) => {
  const { required } = CommonService.rules()
  const appStore = useAppStore()
  return [  
    [
      [
        {
          name: 'transportType',
          text: $gettext('Transport Type'),
          rules: [required],
          type: 'btnSelectGroup',
          items: getList,
        }
      ]
    ],
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
          name: 'customCode',
          text: $gettext('Code'),
        }
      ],
    ],
    entity.chargeType !== CHARGE_TYPE.CUSTOM ? [] : [
      [
        {
          name: 'customChargeType',
          text: $gettext('Custom Charge Type'),
          rules: [required],
          type: 'select',
          itemValue: 'id',
          itemTitle: 'name',
          items: appStore.getList('customChargeTypes'),
          columnSpan: 6
        }
      ],
    ],
    [
      [
        {
          name: 'calculationType',
          text: $gettext('Calculation Type'),
          rules: [required],
          type: 'select',
          itemValue: 'id',
          itemTitle: 'name',
          items: appStore.getList('calculationTypes').filter(calType => calType.transportTypes.includes(entity.transportType))
        }
      ],
      [
        {
          name: 'customCalcType',
          text: $gettext('Custom Calculation Type'),
        }
      ]
    ],
    [
      [
        {
          name: 'debitTax',
          text: $gettext('Debit Tax'),
          type: 'number',
          appendInner: '%',
        }
      ],
      [
        {
          name: 'creditTax',
          text: $gettext('Credit Tax'),
          type: 'number',
          appendInner: '%',
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
