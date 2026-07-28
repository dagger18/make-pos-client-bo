import { firstRouteFromAbilities } from '@/config/enums/Permission'
import { useAuthStore } from '@/stores/authStore'
// 👉 Redirects
export const redirects = [
  // ℹ️ We are redirecting to different pages based on role.
  // NOTE: Role is just for UI purposes. ACL is based on abilities.
  {
    path: '/',
    name: 'index',
    redirect: to => {
      const isLoggedIn = !!(useCookie('user').value && useCookie('accessToken').value && useCookie('userAbilityRules').value)
      console.log(isLoggedIn, 'isLoggedIn index')
      if(!isLoggedIn) {
        return { name: 'login', query: to.query }
      }
      
      console.log('abilities in index', useCookie('userAbilityRules').value)

      return firstRouteFromAbilities(useCookie('userAbilityRules').value)
    },
  },
  {
    path: '/first-route',
    name: 'first-route',
    redirect: to => {
      const authStore = useAuthStore()
      const isLoggedIn = !!(authStore.user && authStore.accessToken && authStore.userAbilityRules)
      console.log(isLoggedIn, 'isLoggedIn first route')
      if(!isLoggedIn) {
        return { name: 'login', query: to.query }
      }
      console.log('abilities in first-route', authStore.userAbilityRules)

      return firstRouteFromAbilities(authStore.userAbilityRules)
    },
  }
]
export const routes = [
  
]
