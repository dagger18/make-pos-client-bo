import { VThemeProvider } from 'vuetify/components/VThemeProvider'
import { useConfigStore } from '@core/stores/config'
import { AppContentLayoutNav } from '@layouts/enums'

// TODO: Use `VThemeProvider` from dist instead of lib (Using this component from dist causes navbar to loose sticky positioning)
export const useSkins = () => {
  const configStore = useConfigStore()

  const layoutAttrs = computed(() => ({
    verticalNavAttrs: {
      wrapper: h(VThemeProvider, { tag: 'aside' }),
      wrapperProps: {
        withBackground: true,
        theme: (configStore.appContentLayoutNav === AppContentLayoutNav.Vertical && configStore.navTheme !== 'system')
          ? configStore.navTheme
          : undefined,
      },
    },
  }))

  const injectSkinClasses = () => {
    if (typeof document !== 'undefined') {
      const bodyClasses = document.body.classList
      const genSkinClass = _skin => `skin--${_skin}`

      watch(() => configStore.skin, (val, oldVal) => {
        bodyClasses.remove(genSkinClass(oldVal))
        bodyClasses.add(genSkinClass(val))
      }, { immediate: true })
    }
  }

  return {
    injectSkinClasses,
    layoutAttrs,
  }
}
