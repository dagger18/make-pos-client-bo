import { baseApiUrl } from '@/utils/api'
const BASE_URI = 'charge-item'
export default {
  list (params = '') {
    if(params.includes('export=true')) {
      return `${baseApiUrl}/${BASE_URI}?${params}`
    }
    return $api(`${BASE_URI}?${params}`)
  },

}
