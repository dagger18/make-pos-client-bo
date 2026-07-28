import { enums as Permission } from '@/config/enums/Permission';
import CommonService from '@/services/CommonService';
const BASE_URI = 'my-profile'

export const printUserTitle = (user) => {
  return user.title ?? user.userGroup.name
}
export const printFullName = (user) => {
  return user.firstName ? (user.firstName + ' ' + user.lastName) : user.email
}
export default {

  getTableConfig () {
    return $api(`${BASE_URI}/table-config`)
  },

  profile (entity) {
    return $api(`${BASE_URI}/profile/${entity.id}`, {
      method: 'POST',
      body: CommonService.formData(entity),
      loading: true
    })
  },
  ping () {
    return $api(`${BASE_URI}/ping`)
  },
  viewPage (page) {
    return $api(`${BASE_URI}/view-page/${page}`)
  },
  testSmtp () {
    return $api(`${BASE_URI}/test-smtp`, {
      method: 'POST',
      loading: true,
      noPushMessage: true
    })
  },
  getNotifications (page) {
    return $api(`${BASE_URI}/get-notifications/${page}`)
  },
}
