import { printDate, printDateTime } from "@/services/CommonService"
export const headers = (isPOBO = false) => {
  return [
    { 
      key: 'code', text: $gettext('Invoice ID'),
      renderSlot: 'invoiceId'
    },
    
    { 
      key: 'payTo', 
      text: isPOBO ? $gettext('Pay to') : $gettext('Pay for'), 
      wrapperClass: 'line-clamp-2',
      style: 'width: 120px;',
      sortable: false,
      renderObject (item) {
        return item.payTo?.name ?? $gettext('Undefined Provider')
      }
    },
    isPOBO ? {
      key: 'collectFrom', 
      text: $gettext('Collect from'), 
      wrapperClass: 'line-clamp-2',
      style: 'width: 120px;',
      sortable: false,
      renderObject (item) {
        return item.collectFrom.name ?? ''
      }
    } : null,
    { 
      key: 'noteDate', 
      text: $gettext('Sent Date'),
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
      key: 'paid',
      text: $gettext('Paid'),
      renderObject (item) {
        return item.paid.toMoneyFormat(item.amountNoTax.currency, false)
      }
    },
    {
      key: 'remains',
      text: $gettext('Credit'),
      renderObject (item) {
        return item.remains.toMoneyFormat(item.amountNoTax.currency, false)
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
  ].filter(i => i)
}
  