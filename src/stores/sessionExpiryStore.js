import { defineStore } from 'pinia'

export const useSessionExpiryStore = defineStore('sessionExpiry', {
  state: () => ({
    isNullified: false,
  }),
  actions: {
    trigger() {
      this.isNullified = true
    },
    reset() {
      this.isNullified = false
    },
  },
})
