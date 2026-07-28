import { enums as Permission } from '@/config/enums/Permission';
import CommonService from '@/services/CommonService';
import { useAppStore } from '@/stores/appStore'
const BASE_URI = 'user'

export const printUserTitle = (user) => {
  return user.title ?? user.userGroup.name
}
export const printFullName = (user) => {
  return user.firstName ? (user.firstName + ' ' + user.lastName) : user.email
}
export default {
  listCacheable (params) {
    const appStore = useAppStore()
    return appStore.fetchListCached(`${BASE_URI}?${params}`)
  },
  list (params = '') {
    return $api(`${BASE_URI}?${params}`)
  },
  getUsersWithPermission (permission = '') {
    return $api(`${BASE_URI}/get-users-with-permission/${permission}`)
  },

  get (id) {
    return $api(`${BASE_URI}/${id}`)
  },

  add (entity) {
    return $api(`${BASE_URI}`, {
      method: 'POST',
      body: CommonService.formData(entity),
      loading: true
    })
  },
  
  update (entity) {
    return $api(`${BASE_URI}/${entity.id}`, {
      method: 'PUT',
      body: CommonService.formData(entity),
      loading: true
    })
  },

  delete (id) {
    return $api(`${BASE_URI}/${id}`, {method: 'DELETE', loading: true})
  },

  profile (entity) {
    return $api(`my-profile/profile/${entity.id}`, {
      method: 'POST',
      body: CommonService.formData(entity),
      loading: true
    })
  },

  testSmtp () {
    return $api('my-profile/test-smtp', { method: 'POST', loading: true })
  },

  viewPage (page) {
    return $api(`my-profile/view-page/${page}`)
  },
}
