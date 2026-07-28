
import TiptapEditor from '@/@core/components/TiptapEditor.vue';
import { enums as EbitNoteType } from "@/config/enums/EbitNoteType";
import CommonService from "@/services/CommonService";
export const makeDefaultEntity = (context) => {
  const targetName = (context.type === EbitNoteType.InvoiceDebit
                      || context.type === EbitNoteType.Debit
                      || context.type === EbitNoteType.COBO
                    )
                      ? 'collectFrom' : 'payTo'
  const target = context[targetName]
  return {
    debitId: context.id,
    title: '[Pyramid] Your debit note for shipment ' + context.shipment.code,
    toAddress: target?.defaultInvoiceInfo?.email 
                ?? target?.defaultContact?.email ?? '',
    content: 'Kindly check in attachment',
    language: 'en'
  }
}
export const layout = (entity) => {
  const { required } = CommonService.rules()
  return [
    [
      [
        { 
          name: 'language', text: $gettext('Language'), type: 'select', rules: [required],
          returnObject: false,
          items: [
            {value: 'en', title: $gettext('English')},
            {value: 'vi', title: $gettext('Vietnamese')},
          ]
        },
        { name: 'title', text: $gettext('Title'), rules: [required]  },
        { name: 'toAddress', text: $gettext('Send to Email'), rules: [required]  },
        { 
          name: 'content', 
          text: $gettext('Content'), 
          type: 'custom',
          component: TiptapEditor,
          class: 'border rounded', 
          rules: [required] 
        },
      ]
    ]
  ]
}
