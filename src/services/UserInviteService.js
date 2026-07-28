import CommonService from '@/services/CommonService'
const BASE_URI = 'user'
export default {
  add (entity) {
    return $api(`${BASE_URI}/invite`, {
      method: 'POST',
      body: CommonService.formData(entity),
      loading: true
    })
  },
  
}
