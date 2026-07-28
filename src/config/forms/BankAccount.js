import CommonService from '@/services/CommonService';
import { useGettext } from "vue3-gettext";
export const makeDefaultEntity = async () => {
  return {
    bankName: null
  }
}
export const layout = (entity) => {
  const { required } = CommonService.rules()
  const { $gettext } = useGettext();
  return [  
    [
      [
        {
          name: 'bankName',
          text: $gettext('Bank Name'),
          rules: [required]
        }
      ],
      [
        {
          name: 'branch',
          text: $gettext('Branch')
        }
      ]
    ],  
    [
      [
        {
          name: 'accountName',
          text: $gettext('Account Name')
        },
        {
          name: 'accountNumber',
          text: $gettext('Account Number')
        }
      ],
      [
        {
          name: 'swiftCode',
          text: $gettext('Swift Code')
        }
      ]
    ]
  ]
}
