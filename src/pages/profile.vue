<script setup>
import { layout, makeDefaultEntity } from '@/config/forms/Profile';
import EntityService from '@/services/UserService';
import { useAuthStore } from '@/stores/authStore';
import { useMediaUpload } from '@/composables/useMediaUpload';
import { VCardText } from 'vuetify/lib/components/index.mjs';
import { useGettext } from 'vue3-gettext'
import MyProfileService from '@/services/MyProfileService'
import { useOnlineTracking } from '@/composables/useOnlineTracking'
definePage({
  meta: { allowIfLogged: true },
})
const { $gettext } = useGettext()
const authStore = useAuthStore()
const { disableOnlineTracking } = useOnlineTracking()

const tableConfigEntries = computed(() => {
  const config = authStore.user?.tableConfig
  if (!config || typeof config !== 'object') return []
  return Object.entries(config).map(([route, props]) => ({
    route,
    keys: Object.keys(props ?? {}).filter(k => props[k]),
  })).filter(e => e.keys.length > 0)
})

const clearingTableConfig = ref(false)
async function clearTableConfig() {
  clearingTableConfig.value = true
  try {
    await authStore.clearTableConfig()
  } finally {
    clearingTableConfig.value = false
  }
}

const form = ref(null)
let user = authStore.user
const { uploadFile, uploading: avatarUploading } = useMediaUpload()
onMounted(() => {
  form.value.setEntity(user)
})
function entitySubmitted(response) {
  if(response.id) {
    const userWithoutTableConfig = JSON.parse(JSON.stringify(response))
    userWithoutTableConfig.tableConfig = null
    useCookie('user').value = userWithoutTableConfig
    authStore.user = userWithoutTableConfig
    user = userWithoutTableConfig
  }
  nextTick(() => {
    form.value.setEntity(user)
  })
}
async function uploadAvatar(file) {
  const media = await uploadFile(file)
  if (!media?.id) return
  const result = await $api('my-profile/avatar', {
    method: 'POST',
    body: { mediaId: media.id },
  })
  if (result?.logo) {
    user.logo = result.logo
    authStore.user = { ...authStore.user, logo: result.logo }
    useCookie('user').value = authStore.user
  }
}
</script>
<template>
  <VCard class="mt-4" :title="$gettext('Profile Details')">
    <VCardText class="d-flex">
      <!-- 👉 Avatar -->
      <div class="position-relative me-6">
        <VAvatar
          v-if="authStore.user?.logo?.thumbnailPath"
          rounded size="100" class="elevation-10"
          :image="authStore.user?.logo?.thumbnailPath" variant="elevated"
        />
        <VAvatar
          v-else
          color="secondary" rounded
          variant="tonal" size="100"
        >
          <VIcon size="60" icon="tabler-user"/>
        </VAvatar>
        <VProgressCircular
          v-if="avatarUploading"
          indeterminate size="24" color="primary"
          class="position-absolute"
          style="top:50%;left:50%;transform:translate(-50%,-50%)"
        />
      </div>
      <form class="d-flex flex-column justify-center gap-4">
        <div class="d-flex flex-wrap gap-2">
          <AppCropper 
            v-slot="{ openFilePicker }"
            @cropped="uploadAvatar"
          >
            <VBtn color="primary" @click="openFilePicker()">
              <VIcon icon="tabler-cloud-upload" size="24" class="me-2"/>
              <span class="d-none d-sm-block">{{ $gettext('Upload photo') }}</span>
            </VBtn>
          </AppCropper>
        </div>
        <p class="text-body-1 mb-0">
          {{ $gettext('Allowed JPG, GIF or PNG. Max size of 8MB') }}
        </p>
      </form>
    </VCardText>

    <VDivider />

    <AppForm
      :layout="layout"
      :isDialog="false"
      :makeDefaultEntity="makeDefaultEntity"
      :service="{update: EntityService.profile}"
      ref="form"
      :entityName="$gettext('Profile')"
      @entitySubmitted="entitySubmitted"
    />
  </VCard>

  <VRow class="mt-4">
    <VCol cols="12" md="6">
      <VCard :title="$gettext('Online Status')">
        <VDivider />
        <VCardText>
          <VSwitch
            v-model="disableOnlineTracking"
            :label="$gettext('Always appear offline')"
            color="primary"
            hide-details
            density="compact"
          />
          <p class="text-caption text-medium-emphasis mt-2 mb-0">
            {{ $gettext('When enabled, your online presence will not be reported to the server.') }}
          </p>
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12" md="6">
      <VCard :title="$gettext('Table Configuration')">
        <VDivider />
        <VCardText>
          <div v-if="tableConfigEntries.length === 0" class="text-body-2 text-medium-emphasis">
            {{ $gettext('No saved table configurations.') }}
          </div>
          <template v-else>
            <p class="text-body-2 mb-3">
              {{ $gettext('%{count} saved table configurations', { count: tableConfigEntries.length }) }}
            </p>
            <VList density="compact" class="rounded border mb-4" style="max-height:220px;overflow-y:auto">
              <VListItem
                v-for="entry in tableConfigEntries"
                :key="entry.route"
                :subtitle="entry.keys.join(' · ')"
              >
                <template #title>
                  <span class="text-caption text-mono">{{ entry.route }}</span>
                </template>
              </VListItem>
            </VList>
            <VBtn
              color="error"
              variant="tonal"
              size="small"
              :loading="clearingTableConfig"
              @click="clearTableConfig"
            >
              <VIcon icon="tabler-trash" size="16" class="me-1" />
              {{ $gettext('Clear all') }}
            </VBtn>
          </template>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>


</template>
