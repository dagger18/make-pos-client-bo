export const headers = () => {
    const route = useRoute()
    return [
      { 
        key: 'ebitNote.code', 
        text: $gettext('Invoice ID'),
      },
      { 
        key: 'chargeName', 
        text: $gettext('Charge Name'),
      },
      { 
        key: 'calculationType', 
        text: $gettext('Calculated by'),
      },
      { 
        key: 'quantity', 
        text: $gettext('Quantity'),
      },
      { 
        key: 'chargePriceText', 
        text: $gettext('Price'),
      },
      { 
        key: 'amountText', 
        text: $gettext('Amount'),
      },
      { 
        key: 'amountText', 
        text: $gettext('Amount'),
      },
      { 
        key: 'taxGroup.name', 
        text: $gettext('Tax'),
      },
      { 
        key: 'taxText', 
        text: $gettext('Tax Amount'),
      },
      { 
        key: 'noteDateText', 
        text: $gettext('Invoiced Date'),
      },
      { 
        key: 'ebitNote.invoiceInfo.contactName', 
        text: $gettext('Recipient Contact'),
      },
      { 
        key: 'ebitNote.invoiceInfo.company', 
        text: $gettext('Recipient Name'),
      },
      { 
        key: 'ebitNote.invoiceInfo.taxNumber', 
        text: $gettext('Recipient Tax Number'),
      },
      { 
        key: 'ebitNote.invoiceInfo.address', 
        text: $gettext('Recipient Address'),
      },
      { 
        key: 'ebitNote.invoiceInfo.bankAccount.accountNumber', 
        text: $gettext('Recipient Bank Account'),
      },
      { 
        key: 'ebitNote.paymentMethod.name', 
        text: $gettext('Payment Method'),
      },
    ].filter(item => item)
  }
