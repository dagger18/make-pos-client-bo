<script setup>
import { getTitle as getActivityTitle } from '@/config/enums/ShipmentActivityType';
import { printDateTime } from '@/services/CommonService';
import UserService, { printFullName, printUserTitle } from '@/services/UserService';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { useMediaUrl } from '@/composables/useMediaUrl';
import NotificationService from '@/services/NotificationService'
import { useLayoutConfigStore } from '@layouts/stores/config'
import { injectionKeyIsVerticalNavHovered } from '@layouts/symbols'

const authStore = useAuthStore()
const { user } = authStore
const appStore = useAppStore()
const configStore = useLayoutConfigStore()
const isVerticalNavHovered = inject(injectionKeyIsVerticalNavHovered, ref(false))
const hideTitleAndBadge = configStore.isVerticalNavMini(isVerticalNavHovered)
// Injected from VerticalNav (ancestor) — toggling this ref controls the accordion rendered there
const isMenuOpen = inject('isUserNavMenuOpen', ref(false))

const notificationCount = computed(() => {
  return appStore.newEntities.notification
})
const notifications = ref([])
const currentPage = ref(0)
const totalPages = ref(0)
async function onOpenNotification() {
  if (currentPage.value === 0) {
    const response = await NotificationService.getNotifications(currentPage.value + 1)
    currentPage.value = response.currentPage
    totalPages.value = response.totalPages
    notifications.value = notifications.value.concat(response.list)
    NotificationService.markRead().then(() => {
      appStore.newEntities.notification = 0
    })
  }
  UserService.viewPage('manage-notification').then(() => {
    appStore.newEntities.notification = 0
  })
}
function getUser(userId) {
  const users = useAppStore().getList('users')
  const user = users.find(user => user.id === userId)
  if(!user) {
    return {
      firstName: '',
      lastName: '',
    }
  }
  return user
}
async function endIntersect (isIntersecting) {
  if (isIntersecting) {
    if (currentPage.value && totalPages.value
        && currentPage.value < totalPages.value
    ) {
      const response = await NotificationService.getNotifications(currentPage.value + 1)
      currentPage.value = response.currentPage
      totalPages.value = response.totalPages
      notifications.value = notifications.value.concat(response.list)
    }
  }
}
</script>
<template>
  <div class="d-flex align-center flex-grow-1" style="min-width: 0; overflow: hidden;">
    <!-- 👉 Avatar + name: click to toggle user menu -->
    <div
      class="d-flex align-center cursor-pointer"
      style="flex: 1 1 0; min-width: 0; overflow: hidden;"
      @click="!hideTitleAndBadge && (isMenuOpen = !isMenuOpen)"
    >
      <VBadge
        dot location="bottom right"
        offset-x="3" offset-y="3"
        bordered color="success"
        class="mt-2"
        style="flex-shrink: 0;"
      >
        <VAvatar
          color="primary" variant="tonal" size="30"
          v-if="authStore.user?.logo?.thumbnailPath" :image="authStore.user?.logo?.thumbnailPath"
        />
        <VAvatar
          v-else
          color="secondary" rounded
          variant="tonal" size="30"
        >
          <VIcon size="30" icon="tabler-user"/>
        </VAvatar>
      </VBadge>
      <div class="ms-2 mt-2 overflow-hidden" style="flex: 1 1 0; min-width: 0;" v-show="!hideTitleAndBadge">
        <div class="text-subtitle-2 font-weight-semibold text-no-wrap text-truncate">
          {{ printFullName(user) }}
        </div>
        <div class="text-caption text-no-wrap text-truncate" style="opacity: 0.5">
          {{ printUserTitle(user) }}
        </div>
      </div>
    </div>

    <!-- 👉 Notification bell -->
    <div v-if="!hideTitleAndBadge" style="flex-shrink: 0;">
    <VMenu location="end" theme="light" :offset="[12,70]" scrim max-width="400">
      <template #activator="{ props }">
        <v-badge
          :content="notificationCount"
          max="99"
          :offset-x="notificationCount > 99 ? 20 : 10" offset-y="10" color="error"
          :model-value="notificationCount > 0"
        >
          <VIcon
            v-bind="notificationCount > 0 ? props : {}"
            class="mt-3 me-3"
            icon="tabler-bell-ringing"
            @click="onOpenNotification"
          />
        </v-badge>
      </template>
      <VList lines="three">
        <VListItem
          :active="false"
          v-for="n in notifications"
          :key="n.id"
          :to="n.shipment ? {name: 'shipment-id-tab1?tab2?', params: {id: n.shipment.code, tab1: 'info', tab2: 'order'}} : undefined"
        >
          <template v-slot:prepend>
            <VIcon icon="tabler-bell" size="28" class="me-2" :color="(n.priority === 'HIGH' || n.priority === 'URGENT') ? 'error' : 'primary'" />
          </template>
          <template v-slot:title>
            <span class="line-clamp-2">{{ n.title }}</span>
          </template>
          <template v-slot:subtitle>
            <span class="text-disabled">
              {{ n.body }}
              <br/>
              {{ printDateTime(n.createdDate, 'DD/MM/YYYY HH:mm:ss') }}
            </span>
          </template>
        </VListItem>
        <div
          v-intersect="{
            handler: endIntersect,
            options: {threshold: [0.5]}
          }"
          class="search-select-loader py-3 px-2 mt-2 text-center"
          v-show="currentPage < totalPages"
        >
          <v-progress-circular indeterminate :size="20" :width="2"/>
          &nbsp;&nbsp;
          <span class="grey--text text-italic">
            {{ $gettext('Loading more notifications. Please wait') }} ...
          </span>
        </div>
        <div class="search-select-loader py-3 px-2 mt-2 text-center">
          <span class="grey--text text-italic">
            {{ $gettext('No more notifications to show') }} ...
          </span>
        </div>
      </VList>
    </VMenu>
    </div>
  </div>
</template>
