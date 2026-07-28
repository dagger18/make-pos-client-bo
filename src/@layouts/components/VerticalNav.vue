<script setup>
import UserProfile from '@/layouts/components/UserProfile.vue'
import { layoutConfig } from '@layouts'
import {
  TransitionExpand,
  VerticalNavGroup,
  VerticalNavLink,
  VerticalNavSectionTitle,
} from '@layouts/components'
import { useLayoutConfigStore } from '@layouts/stores/config'
import { injectionKeyIsVerticalNavHovered } from '@layouts/symbols'
import { useAuthStore } from '@/stores/authStore'
import { useDocsPanel } from '@/composables/useDocsPanel'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
const props = defineProps({
  tag: {
    type: [
      String,
      Object,
      Function,
    ],
    required: false,
    default: 'aside',
  },
  navItems: {
    type: null,
    required: true,
  },
  isOverlayNavActive: {
    type: Boolean,
    required: true,
  },
  toggleIsOverlayNavActive: {
    type: Function,
    required: true,
  },
})

const refNav = ref()
const isHovered = useElementHover(refNav)

provide(injectionKeyIsVerticalNavHovered, isHovered)

const configStore = useLayoutConfigStore()

const resolveNavItemComponent = item => {
  if ('heading' in item)
    return VerticalNavSectionTitle
  if ('children' in item)
    return VerticalNavGroup
  
  return VerticalNavLink
}

/*ℹ️ Close overlay side when route is changed
Close overlay vertical nav when link is clicked
*/
const route = useRoute()

watch(() => route.name, () => {
  props.toggleIsOverlayNavActive(false)
})

const isVerticalNavScrolled = ref(false)
const updateIsVerticalNavScrolled = val => isVerticalNavScrolled.value = val

const handleNavScroll = evt => {
  isVerticalNavScrolled.value = evt.target.scrollTop > 0
}

const hideTitleAndIcon = configStore.isVerticalNavMini(isHovered)

// User nav accordion — provided DOWN to UserProfile so it can toggle the ref
const isUserNavMenuOpen = ref(false)
provide('isUserNavMenuOpen', isUserNavMenuOpen)

// Auto-close user menu when nav goes mini
watch(hideTitleAndIcon, (isMini) => {
  if (isMini) isUserNavMenuOpen.value = false
})

const { logout: userNavLogout } = useAuthStore()
const docsPanel = useDocsPanel()
</script>

<template>
  <Component
    :is="props.tag"
    ref="refNav"
    class="layout-vertical-nav"
    :class="[
      {
        'overlay-nav': configStore.isLessThanOverlayNavBreakpoint,
        'hovered': isHovered,
        'visible': isOverlayNavActive,
        'scrolled': isVerticalNavScrolled,
      },
    ]"
  >
    <!-- 👉 Header -->
    <div class="nav-header mx-0 pe-0 ps-2 pt-1 pb-2">
      <slot name="nav-header">
        <UserProfile class="d-flex flex-grow-1"/>
        <!-- 👉 Vertical nav actions -->
        <!-- Show toggle collapsible in >md and close button in <md -->
        <Component
          :is="layoutConfig.app.iconRenderer || 'div'"
          v-show="configStore.isVerticalNavCollapsed"
          class="header-action d-none nav-unpin"
          :class="configStore.isVerticalNavCollapsed && 'd-lg-block'"
          v-bind="layoutConfig.icons.verticalNavUnPinned"
          @click="configStore.isVerticalNavCollapsed = !configStore.isVerticalNavCollapsed"
          v-if="false"
        />
        <Component
          :is="layoutConfig.app.iconRenderer || 'div'"
          v-show="!configStore.isVerticalNavCollapsed"
          class="header-action d-none nav-pin"
          :class="!configStore.isVerticalNavCollapsed && 'd-lg-block'"
          v-bind="layoutConfig.icons.verticalNavPinned"
          @click="configStore.isVerticalNavCollapsed = !configStore.isVerticalNavCollapsed"
          v-if="false"
        />
      </slot>
    </div>
    <!-- 👉 User nav menu accordion (rendered outside nav-header to avoid layout clipping) -->
    <TransitionExpand>
      <ul v-show="isUserNavMenuOpen" class="nav-items ps-0 mb-0" style="block-size: auto; flex-shrink: 0;">
        <li class="nav-link">
          <RouterLink :to="{name: 'profile'}">
            <VIcon icon="tabler-user" class="nav-item-icon"/>
            <span v-show="!hideTitleAndIcon" class="nav-item-title">{{ $gettext('Profile') }}</span>
          </RouterLink>
        </li>
        <li class="nav-link">
          <RouterLink :to="{name: 'user-settings'}">
            <VIcon icon="tabler-settings" class="nav-item-icon"/>
            <span v-show="!hideTitleAndIcon" class="nav-item-title">{{ $gettext('Settings') }}</span>
          </RouterLink>
        </li>
        <li class="nav-link">
          <a style="cursor: pointer" @click="docsPanel.toggle(); isUserNavMenuOpen = false">
            <VIcon icon="tabler-books" class="nav-item-icon"/>
            <span v-show="!hideTitleAndIcon" class="nav-item-title">{{ $gettext('Documents / Guides') }}</span>
          </a>
        </li>
        <li class="nav-link">
          <a style="cursor: pointer" @click="userNavLogout()">
            <VIcon icon="tabler-logout" class="nav-item-icon"/>
            <span v-show="!hideTitleAndIcon" class="nav-item-title">{{ $gettext('Logout') }}</span>
          </a>
        </li>
        <li><VDivider class="mt-1"/></li>
      </ul>
    </TransitionExpand>

    <slot name="before-nav-items">
      <div class="vertical-nav-items-shadow" />
    </slot>
    <slot
      name="nav-items"
      :update-is-vertical-nav-scrolled="updateIsVerticalNavScrolled"
    >
      <PerfectScrollbar
        :key="configStore.isAppRTL"
        tag="ul"
        class="nav-items"
        :options="{ wheelPropagation: false }"
        @ps-scroll-y="handleNavScroll"
      >
        <Component
          :is="resolveNavItemComponent(item)"
          v-for="(item, index) in navItems"
          :key="index"
          :item="item"
        />
      </PerfectScrollbar>
    </slot>
  </Component>
</template>

<style lang="scss" scoped>
.app-logo {
  display: flex;
  align-items: center;
  column-gap: 0.75rem;

  .app-logo-title {
    font-size: 1.375rem;
    font-weight: 700;
    line-height: 1.75rem;
    text-transform: capitalize;
  }
}
</style>

<style lang="scss">
@use "@configured-variables" as variables;
@use "@layouts/styles/mixins";
@use "@/assets/styles/variables/vuetify.scss" as v-variables;
@use 'sass:map';

// 👉 Vertical Nav
.layout-vertical-nav {
  position: fixed;
  z-index: variables.$layout-vertical-nav-z-index;
  display: flex;
  flex-direction: column;
  block-size: 100%;
  inline-size: variables.$layout-vertical-nav-width;
  inset-block-start: 0;
  inset-inline-start: 0;
  transition: inline-size 0.25s ease-in-out, box-shadow 0.25s ease-in-out;
  will-change: transform, inline-size;

  .nav-header {
    display: flex;
    align-items: center;

    .header-action {
      cursor: pointer;

      @at-root {
        #{variables.$selector-vertical-nav-mini} .nav-header .header-action {
          &.nav-pin,
          &.nav-unpin {
            display: none !important;
          }
        }
      }
    }
  }

  .app-title-wrapper {
    margin-inline-end: auto;
  }

  .nav-items {
    block-size: 100%;

    // ℹ️ We no loner needs this overflow styles as perfect scrollbar applies it
    // overflow-x: hidden;

    // // ℹ️ We used `overflow-y` instead of `overflow` to mitigate overflow x. Revert back if any issue found.
    // overflow-y: auto;
  }

  .nav-item-title {
    overflow: hidden;
    margin-inline-end: auto;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  // 👉 Collapsed
  .layout-vertical-nav-collapsed & {
    &:not(.hovered) {
      inline-size: variables.$layout-vertical-nav-collapsed-width;
    }
  }
}

// Small screen vertical nav transition

@media (max-width:(map.get(v-variables.$grid-breakpoints, 'lg') - 1px)) {
  .layout-vertical-nav {
    &:not(.visible) {
      transform: translateX(-#{variables.$layout-vertical-nav-width});

      @include mixins.rtl {
        transform: translateX(variables.$layout-vertical-nav-width);
      }
    }

    transition: transform 0.25s ease-in-out;
  }
}
</style>
