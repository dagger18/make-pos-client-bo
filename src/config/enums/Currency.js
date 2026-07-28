const enums = {
  USD: '$',
  VND: '₫',
}
export const getSymbol = (currency) => {
  const key = Object.keys(enums).find(key => key === currency)
  return enums[key]
}
export default enums
