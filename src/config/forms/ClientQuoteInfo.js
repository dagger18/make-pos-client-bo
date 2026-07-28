import { enums as CUSTOM_MODE, getList as customInfoModeList } from '@/config/enums/CustomInfoMode';
import { layout as layoutInvoiceInfo, makeDefaultEntity as makeDefaultInvoiceInfo } from '@/config/forms/InvoiceInfo';
export const makeDefaultEntity = async () => {
  return {
    name: null,
    customInfoMode: 'G'
  }
}
export const layout = (entity) => {
  return [
    [
      [
        {
          name: 'customInfoMode',
          type: 'btnSelectGroup',
          items: customInfoModeList
        }
      ],
    ],
    entity.customInfoMode === CUSTOM_MODE.CustomInfo ? [
      [
        {
          name: 'customInfo',
          type: 'subForm',
          layout: layoutInvoiceInfo,
          makeDefaultEntity: makeDefaultInvoiceInfo
        }
      ]
    ]: [],
  ]
}
