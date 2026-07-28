<script setup>
import UserService from '@/services/UserService';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { useUpgradeDialog } from '@/composables/useUpgradeDialog';
import { layoutConfig } from '@layouts';
import { can } from '@layouts/plugins/casl';
import { useLayoutConfigStore } from '@layouts/stores/config';
import {
getComputedNavLinkToProp,
getDynamicI18nProps,
isNavLinkActive,
} from '@layouts/utils';
const props = defineProps({
  item: {
    type: null,
    required: true,
  },
})

const configStore = useLayoutConfigStore()
const hideTitleAndBadge = configStore.isVerticalNavMini()

const route = useRoute()
const router = useRouter()
const { open: openUpgradeDialog } = useUpgradeDialog()
const isOrgOwner = computed(() => !!useAuthStore().organizationConfig)

function onNavigationLinkClicked(item, $event) {
  if (item.disabled) {
    openUpgradeDialog()
    return
  }
  console.log('checking after link clicked' , route.name, item.to.name)
  if(item.to.name === 'shipment-transport-type') {
    UserService.viewPage('manage-shipment').then(() => {
      const appStore = useAppStore()
      appStore.newEntities.shipment = 0
    })
  }
  if(item.to.name === 'client') {
    UserService.viewPage('manage-client').then(() => {
      const appStore = useAppStore()
      appStore.newEntities.client = 0
    })
  }
  if(item.to.name === 'provider-provider-type') {
    UserService.viewPage('manage-provider').then(() => {
      const appStore = useAppStore()
      appStore.newEntities.provider = 0
    })
  }
  if(item.to.name === 'accounting-id') {
    UserService.viewPage('manage-accounting').then(() => {
      const appStore = useAppStore()
      appStore.newEntities.provider = 0
    })
  }
  if(route.name === item.to.name) {
    console.log('same route clicking, force redirection')
    router.push({...item.to, force: true})
  }
  
}
</script>

<template>
  <li
    v-if="can(item.action, item.subject) && (!item.disabled || isOrgOwner)"
    class="nav-link"
    :class="{ disabled: item.disable }"
  >
    <Component
      :is="item.disabled ? 'a' : (item.to ? 'RouterLink' : 'a')"
      v-bind="item.disabled ? {} : getComputedNavLinkToProp(item)"
      :class="{ 'router-link-active router-link-exact-active': isNavLinkActive(item, $router) }"
      :style="item.disabled ? 'cursor: pointer' : undefined"
      @click="onNavigationLinkClicked(item, $event)"
    >
      <Component
        :is="layoutConfig.app.iconRenderer || 'div'"
        v-bind="item.icon || layoutConfig.verticalNav.defaultNavItemIconProps"
        class="nav-item-icon"
      />
      <TransitionGroup name="transition-slide-x">
        <!-- 👉 Title -->
        <Component
          :is="layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'"
          v-show="!hideTitleAndBadge"
          key="title"
          class="nav-item-title"
          v-bind="getDynamicI18nProps(item.title, 'span')"
        >
          {{ item.title }}
        </Component>

        <!-- 👉 Badge -->
        <Component
          :is="layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'"
          v-if="item.badgeContent"
          v-show="!hideTitleAndBadge"
          key="badge"
          class="nav-item-badge"
          :class="item.badgeClass"
          v-bind="getDynamicI18nProps(item.badgeContent, 'span')"
        >
          {{ item.badgeContent }}
        </Component>
      </TransitionGroup>
    </Component>
  </li>
</template>

<style lang="scss">
.layout-vertical-nav {
  .nav-link a {
    display: flex;
    align-items: center;
  }
}
</style>
