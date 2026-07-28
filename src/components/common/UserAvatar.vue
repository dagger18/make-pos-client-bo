<script setup>
import { dateAdapter } from "@/plugins/vuetify";
import { useAuthStore } from '@/stores/authStore';
import { useMediaUrl } from '@/composables/useMediaUrl';
import UserService from '@/services/UserService';

const authStore = useAuthStore()
const menu = ref(false)
const props = defineProps({
  user: {},
  showName: { type: Boolean, default: false }
})

const userDetail = ref(null)
const detailLoaded = ref(false)

watch(() => props.user?.id, () => {
  userDetail.value = null
  detailLoaded.value = false
})

watch(menu, async (opened) => {
  if (opened && !detailLoaded.value) {
    userDetail.value = await UserService.get(props.user?.id ?? props.user)
    detailLoaded.value = true
  }
})

function lastPingCheck(user) {
  if (user.id === authStore.user.id)
    return { isOnline: true, fromNow: null }
  if (!user.lastPing)
    return { isOnline: false, fromNow: 'unknown' }
  const date = dateAdapter.date(user.lastPing)
  const diff = date.diff()
  if (diff < -10 * 60 * 1000)
    return { isOnline: false, fromNow: date.fromNow() }
  return { isOnline: true, fromNow: null }
}
</script>
<template>
  <div>
    <div v-if="showName" class="px-2">
      {{ user?.firstName + ' ' + user?.lastName }}
    </div>
    <VMenu v-else
      v-model="menu"
      location="bottom"
      open-on-hover
    >
      <template #activator="{ props }">
        <VAvatar
          v-bind="props"
          color="secondary" size="small"
          v-if="user?.logo?.thumbnailPath"
          :image="user?.logo?.thumbnailPath"
          class="cursor-pointer"
          :class="$attrs.class"
        />
        <VAvatar
          v-bind="props"
          color="secondary" size="small"
          class="cursor-pointer"
          :class="$attrs.class"
          v-else
        >
          <v-icon icon="tabler-user" size="30"></v-icon>
        </VAvatar>
      </template>

      <VCard max-width="300" v-if="userDetail">
        <VList>
          <VListItem :subtitle="userDetail.userGroup?.name" class="mx-2">
            <template #title>
              <span class="text-h6">{{ userDetail.firstName + ' ' + userDetail.lastName }}</span>
              <template v-if="lastPingCheck(userDetail).isOnline">
                <v-badge dot inline color="success" class="ps-1" />
                <VChip color="success" variant="tonal">Online</VChip>
              </template>
              <template v-else>
                <v-badge dot inline color="secondary" class="ps-1" />
                <span class="text-subtitle" style="font-size: 13px; opacity: 0.7">
                  Off {{ lastPingCheck(userDetail).fromNow }}
                </span>
              </template>
            </template>
          </VListItem>
        </VList>
        <VDivider />
        <VCardText>
          <div class="py-1">Title: {{ userDetail.title }}</div>
          <div class="py-1">Email: {{ userDetail.email }}</div>
          <div class="py-1">Phone: {{ userDetail.phone }}</div>
        </VCardText>
      </VCard>

      <VCard max-width="300" v-else>
        <VCardText class="d-flex justify-center pa-4">
          <v-progress-circular indeterminate size="24" />
        </VCardText>
      </VCard>
    </VMenu>
  </div>
</template>
