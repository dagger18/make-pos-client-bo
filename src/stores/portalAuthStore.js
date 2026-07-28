export const usePortalAuthStore = defineStore('portalAuth', {
  state: () => ({
    accessToken: useCookie('portalAccessToken').value,
    user: useCookie('portalUser').value,
  }),

  actions: {
    login(token, user) {
      useCookie('portalAccessToken').value = token
      useCookie('portalUser').value = user
      this.accessToken = token
      this.user = user
    },

    logout() {
      useCookie('portalAccessToken').value = null
      useCookie('portalUser').value = null
      this.accessToken = null
      this.user = null
    },

    isAuthenticated() {
      return !!this.accessToken
    },
  },
})
