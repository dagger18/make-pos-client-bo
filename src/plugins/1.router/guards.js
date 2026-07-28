import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import { canNavigate } from '@layouts/plugins/casl'

export const setupGuards = router => {
  // 👉 router.beforeEach
  // Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
  router.beforeEach(async (to, from) => {
    //console.log('start routing')
    /*
         * If it's a public route, continue navigation. This kind of pages are allowed to visited by login & non-login users. Basically, without any restrictions.
         * Examples of public routes are, 404, under maintenance, etc.
         */

    if (to.meta.public)
      return

    // 👉 Portal route guard — portalAuthStore removed, redirect to login
    if (to.path.startsWith('/portal')) {
      if (to.path === '/portal/login')
        return
      // portalAuthStore removed - freight-specific; portal routes redirect to login
      return { path: '/portal/login' }
    }

    /**
         * Check if user is logged in by checking if token & user data exists in local storage
         * Feel free to update this logic to suit your needs
         */
    const isLoggedIn = !!(useCookie('user').value && useCookie('accessToken').value && useCookie('userAbilityRules').value)
    
    const appStore = useAppStore()
    appStore.fetchOrganizationInfo()
    //console.log(isLoggedIn, 'isLoggedIn guard')
    /*
          If user is logged in and is trying to access login like page, redirect to home
          else allow visiting the page
          (WARN: Don't allow executing further by return statement because next code will check for permissions)
         */
    if (to.meta.unauthenticatedOnly) {
      if (isLoggedIn) {
        console.log('is login page, and logged in')
        return {name: 'first-route'}
      }
      else
        return undefined
    }
    //console.log(canNavigate(to), to)
    if (!canNavigate(to)) {
      if(isLoggedIn) {
        console.log('go to not authorized')
        return { name: 'not-authorized', params: {'previous-page': to} }
      }
      return {
        name: 'login',
        query: {
          ...to.query,
          to: to.fullPath !== '/' ? to.path : undefined,
        },
      }
    } else if(!isLoggedIn) {
      if(!useCookie('user').value && useCookie('accessToken').value && useCookie('userAbilityRules').value) {
        useAuthStore().logout()
      }
    }
    const authStore = useAuthStore()
    await authStore.setTableConfig(to)
    // todo: clearRoute for cachedGetRequests
    const shouldBeClearedList = Object.keys(appStore.autoLoad).find(key => {
      const config = appStore.autoLoad[key]
      return Array.isArray(config.clearRoute) 
        ? config.clearRoute.includes(from.name) 
        : config.clearRoute === from.name
    })
    if (shouldBeClearedList) {
      appStore.autoLoad[shouldBeClearedList].list = []
      appStore.autoLoad[shouldBeClearedList].touched = false
    }
  })
}
