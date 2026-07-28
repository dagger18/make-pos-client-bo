export const makeDefaultEntity = () => {
  return {
    charges: null,
    unit: null,
    quantity: null,
    currency: null,
    exRate: null,
    rate: null,
    tax: null,
    amount: null
  }
}
export const layout = (entity) => {
  return [  
    [
      [
        {
          name: 'charges',
          text: $gettext('Charges'),
          groupedInputs: true,
          scrollable: true,
          groupedWidth: '120px',
        },
        {
          name: 'unit',
          text: $gettext('Unit'),
          groupedWidth: '120px',
        },
        {
          name: 'quantity',
          text: $gettext('Quantity'),
          groupedWidth: '120px',
        },
        {
          name: 'currency',
          text: $gettext('Currency'),
          groupedWidth: '120px',
        },
        {
          name: 'exRate',
          text: $gettext('Ex. Rate'),
          groupedWidth: '120px',
        },
        {
          name: 'rate',
          text: $gettext('Rate'),
          groupedWidth: '120px',
        },
        {
          name: 'tax',
          text: $gettext('Tax'),
          groupedWidth: '120px',
        },
        {
          name: 'amount',
          text: $gettext('Amount'),
          groupedWidth: '120px',
        },
        
      ]
    ]
  ]
}
