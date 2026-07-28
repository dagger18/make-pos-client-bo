<script setup>
import MediaService from '@/services/MediaService';
const menu = ref(false)
const props = defineProps({
  documents: {type: Array, default: () => []}
})
const attrs = useAttrs()
</script>
<template>
  <VMenu
    v-model="menu"
    location="bottom"
    open-on-hover
  >
    <template #activator="{ props }">
      <div :class="attrs.class" v-bind="props">{{ documents.length }} {{ $gettext('file(s)') }}</div>
    </template>

    <VCard max-width="300">
      <VList>
        <VListItem
          :title="$gettext('Documents')"
          class="mx-2"
        >
        </VListItem>
      </VList>

      <VDivider />

      <VList>
        <VListItem
          v-for="document in documents"
          @click="MediaService.download(document.id)"  
          class="mx-2"
        >
          <template #title>
            {{ document.name }}
          </template>
          <template #append>
            <VIcon
              icon="tabler-download"
              size="16"
              variant="text"
              class="ms-4 mt-n1"
            ></VIcon>
          </template>
        </VListItem>
      </VList>
    </VCard>
  </VMenu>
</template>
