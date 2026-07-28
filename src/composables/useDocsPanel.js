import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getDocPage } from '@/config/docRouteMap'
import { gettext } from '@/plugins/gettext'

// Module-level state so all callers share the same panel instance
const isOpen = ref(false)
const pinnedPage = ref(null) // set when opened with an explicit page; cleared on close

export function useDocsPanel() {
  const route = useRoute()

  const docPage = computed(() => {
    return pinnedPage.value ?? getDocPage(route.name)
  })

  const docUrl = computed(() => {
    const lang = gettext.current
    const base = lang && lang !== 'en' ? `/docs/user-guide/${lang}/` : '/docs/user-guide/'
    return `${base}${docPage.value}`
  })

  function open(page) {
    pinnedPage.value = page ?? null
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    pinnedPage.value = null
  }

  function toggle() {
    if (isOpen.value) {
      close()
    } else {
      pinnedPage.value = null
      isOpen.value = true
    }
  }

  return { isOpen, docUrl, open, close, toggle }
}
