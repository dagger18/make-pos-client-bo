import { printDate, printDateTime } from "@/services/CommonService"
export const headers = () => {
  return [
    { key: 'code', text: $gettext('Debit ID')},
    
    { 
      key: 'collectFrom', 
      text: $gettext('Bill to'), 
      wrapperClass: 'line-clamp-2',
      style: 'width: 120px;',
      sortable: false,
      renderObject (item) {
        return item.collectFrom.name ?? ''
      }
    },
    { 
      key: 'noteDate', 
      text: $gettext('Debit Date'),
      renderObject (item) {
        return printDate(item.noteDate) ?? '...'
      }
    },
    { 
      key: 'dueDate', 
      text: $gettext('Due Date'),
      renderObject (item) {
        return printDate(item.dueDate) ?? '...'
      }
    },
    { 
      key: 'currency', 
      text: $gettext('Curr.')
    },
    { 
      key: 'amountNoTax', 
      text: $gettext('Amount'),
      renderObject (item) {
        return item.amountNoTax?.amount?.toMoneyFormat(item.amountNoTax.currency, false)
      }
    },
    { 
      key: 'amount', 
      text: $gettext('Amount') + '<br>(' +  $gettext('Incl. Tax') + ')',
      renderObject (item) {
        return item.amount?.amount?.toMoneyFormat(item.amount.currency, false)
      }
    },
    { 
      key: 'status',
      text: $gettext('Status'),
      renderSlot: 'status'
    },
    { 
      key: 'createdBy', 
      text: $gettext('Created By'),
      sortable: false,
      renderAvatar: true,
      headerClass: 'text-center',
      bodyClass: 'text-center'
    },
    { 
      key: 'createdDate', 
      text: $gettext('Created On'),
      renderObject (item) {
        return item.createdDate ?  printDateTime(item.createdDate) : ''
      },
      bodyClass: 'pe-4'
    },
    { 
      key: 'documents',
      text: $gettext('Files'),
      renderSlot: 'files'
    },
    { 
      key: 'id', 
      text: $gettext('Action'), 
      sortable: false, 
      renderSlot: 'action', 
      bodyClass: 'px-0',
      headerClass: 'text-end pe-4' 
    },
  ]
}
  