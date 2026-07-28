// Ported from [Nuxt](https://github.com/nuxt/nuxt/blob/main/packages/nuxt/src/app/composables/cookie.ts)
import { parse, serialize } from 'cookie-es'
import { destr } from 'destr'
import { getPermissionFromValue } from '@/config/enums/Permission'
const CookieDefaults = {
  path: '/',
  watch: true,
  decode: val => destr(decodeURIComponent(val)),
  encode: val => encodeURIComponent(typeof val === 'string' ? val : JSON.stringify(val)),
}

export const useCookie = (name, _opts) => {
  const opts = { ...CookieDefaults, ..._opts || {} }
  const cookies = parse(document.cookie, opts)
  const match = window.location.pathname.match(/^\/client-([^/]+)\//)
  const prefix = match ? match[1] : ''
  let defaul = cookies[prefix + name] ?? opts.default?.()
  if(name === 'userAbilityRules') {
    defaul = defaul?.map(v => getPermissionFromValue(v))
  }
  const cookie = ref(defaul)

  watch(cookie, () => {
    document.cookie = serializeCookie(name, cookie.value, opts)
  }, { flush: 'sync' })
  
  return cookie
}
function serializeCookie(name, value, opts = {}) {
  const match = window.location.pathname.match(/^\/client-([^/]+)\//)
  const prefix = match ? match[1] : ''
  if (value === null || value === undefined)
    return serialize(prefix + name, value, { ...opts, maxAge: -1 })
  return serialize(prefix + name, value, opts)
}
