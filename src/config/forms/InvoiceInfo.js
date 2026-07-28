import CommonService from '@/services/CommonService';
import { useGettext } from "vue3-gettext";
export const makeDefaultEntity = async () => {
  return {
    company: null
  }
}
export const layout = (entity) => {
  const { required } = CommonService.rules()
  const { $gettext } = useGettext();

  return [  
    [
      [
        {
          name: 'company',
          text: $gettext('Company Name'),
          rules: [required]
        }
      ],
      [
        {
          name: 'phone',
          text: $gettext('Phone')
        }
      ]
    ],  
    [
      [
        {
          name: 'address',
          text: $gettext('Address')
        }
      ],
      [
        {
          name: 'email',
          text: $gettext('Email')
        }
      ]
    ],  
    [
      [
        {
          name: 'taxNumber',
          text: $gettext('Tax Number')
        }
      ],
      [
        {
          name: 'contactName',
          text: $gettext('Contact Name')
        }
      ]
    ],
    ('parentType' in entity &&  ['provider','client'].includes(entity.parentType)) 
      ? [
        [
          {
            name: 'bankAccount',
            text: $gettext('Bank Account'),
            columnSpan: 6,
            type: 'select',
            items: entity.bankAccounts,
            itemValue: 'id',
            itemTitle: 'bankName',
            rules: [required]
          }
        ]
      ] 
      : []
  ]
}
