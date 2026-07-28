import { gettext } from '@/plugins/gettext';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { useSessionExpiryStore } from '@/stores/sessionExpiryStore';
import { ofetch } from 'ofetch';
export const status = {
  HTTP_BAD_REQUEST: 400,
  HTTP_UNAUTHORIZED: 401,
  HTTP_FORBIDDEN: 403,
  HTTP_NOT_FOUND: 404,
  HTTP_INTERNAL_SERVER_ERROR: 500,
  HTTP_CONFLICT: 409,
  HTTP_UNPROCESSABLE_CONTENT: 422,
  HTTP_OK: 200,
  HTTP_CREATED: 201,
  HTTP_SERVICE_UNAVAILABLE: 503,
}

function getBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  if (import.meta.env.VITE_CLIENT_MODE === 'shared') {
    const match = window.location.pathname.match(/^\/(local1*)-([^/]+)\//)
    if(!match) {
      return `${window.location.origin}/v1`
    }
    const slug = match ? match[2] : ''
    return `http://${slug}.${match[1]}.maca-client.com/v1`
    
  }
  return '/api'
}

export const baseApiUrl = getBaseUrl()
export const $api = ofetch.create({
  baseURL: baseApiUrl,
  async onRequest({ options }) {
    if (options.method === 'PUT' || options.method === 'PATCH') {
      options.query = { ...options.query, _method: options.method }
      options.method = 'POST'
    }
    let uuid = false
    if (options.loading) {
      const store = useAppStore()
      uuid = await store.startLoading()
      options.onResponse = ({ response }) => {
        store.endLoading(uuid)
        if(response.status !== status.HTTP_OK && response.status !== status.HTTP_CREATED) return
        if(options.method === 'POST') {
          if(!options.hasOwnProperty('noPushMessage')) {
            store.pushErrorMessage({success: true})
          }
        }
        if(options.method === 'DELETE') {
          const {$gettext} = gettext
          store.pushErrorMessage({success: true, detail: $gettext('Record deleted successfully')})
        }
      }
    }
    const accessToken = useCookie('accessToken').value
    const user = useCookie('user').value
    if (accessToken) {
      options.headers = {
        ...options.headers,
        'X-W-Auth': `/Token Email="${user.email}", Token="${accessToken}"/`,
      }
    }

    if (options.inline) {
      options.ignoreResponseError = true
    }
  },
  async onResponseError({ request, response, options }) {
    const {$gettext} = gettext
    // Log error
    //console.log("[fetch response error]",request,response.status,options);
    //console.log({'error': response._data})
    const appStore = useAppStore()
    if (response.status === status.HTTP_SERVICE_UNAVAILABLE && response._data?.maintenance === true) {
      appStore.setMaintenance(true)
      return
    }
    if (
      response.status === status.HTTP_UNAUTHORIZED &&
      response._data?.error === 'TOKEN_NULLIFIED' &&
      request !== (`${options.baseURL}/auth`)
    ) {
      useSessionExpiryStore().trigger()
      return Promise.resolve(true)
    }
    if (
      (
        response.status === status.HTTP_UNAUTHORIZED ||
        (
          response.status === status.HTTP_FORBIDDEN &&
          response._data.error &&
          response._data.error === 'Auth token does not match with any user'
        )
      ) &&
      request !== (`${options.baseURL}/auth`)
    ) {
      const authStore = useAuthStore()
      // todo: should not push duplicate error here
      appStore.pushErrorMessage(response._data)
      authStore.logout()
    }
    if (response.status === status.HTTP_FORBIDDEN) {
      appStore.pushErrorMessage(
        {
          status: response.status, 
          detail: $gettext('Not enough access rights to perform this operation')
        }
      )
      return Promise.resolve(true)
    }
    if (response.status === status.HTTP_NOT_FOUND) {
      appStore.pushErrorMessage(
        {
          status: response.status, 
          detail: $gettext('Resource not found')
        }
      )
      return Promise.resolve(true)
    }
    if (response.status === status.HTTP_BAD_REQUEST ||
      response.status === status.HTTP_FORBIDDEN ||
      response.status === status.HTTP_UNPROCESSABLE_CONTENT ||
      response.status === status.HTTP_CONFLICT ||
      response.status === status.HTTP_INTERNAL_SERVER_ERROR) {

        // not show if its cache clear error
        if(response.status === status.HTTP_INTERNAL_SERVER_ERROR
            && /Warning: rename.+doctrine\/orm\/Proxies.+Access is denied/.test(response._data)
          ) {
            console.log('CACHE CLEAR ERROR PANIC')
        } else {
          appStore.pushErrorMessage(response._data)
        }
    }
    // console.log('error fall silence')
    return true
  },
})
export const $gettext = gettext.$gettext
