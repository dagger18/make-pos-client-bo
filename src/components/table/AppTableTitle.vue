<script setup>
const { width: windowWidth } = useWindowSize()
const props = defineProps({
  buttons: { type: Array, default: () => [] },
  total: { type: Number, default: null },
  toggleVerticalOverlayNavActive: { type: Function }
})
const title = computed(() => {
  const route = useRoute();
  let title = route.meta.title
  if (props.total && false) {
    title += ` (${props.total})`
  }
  return title
})

const handleClick = (button) => {
  if (button.func && typeof button.func === 'function') {
    button.func.call()
  }
}
</script>
<template>
  <div class="table-view-header">
    <v-container fluid>
      <v-row class="fill-height">
        <v-col class="py-1">
          <div
            class="d-flex align-center h-100 text-h6 "
          >
            <IconBtn
              id="vertical-nav-toggle-btn"
              class="ms-n3 d-lg-none"
              @click="toggleVerticalOverlayNavActive(true)"
            >
              <VIcon
                size="26"
                icon="tabler-menu-2"
              />
            </IconBtn>
            <slot></slot>
          </div>
        </v-col>
        <v-col class="d-flex align-center justify-end h-100 py-1 pe-1">
            <template v-for="(button, i) in buttons">
              <v-btn
                v-if="!button.type || button.type == 'button'"
                color="primary"
                @click="handleClick(button)"
                :key="i"
              >
                <VIcon start :icon="!button.icon ? 'tabler-plus' : button.icon" />
                {{ button.text }}
              </v-btn>
            </template>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<style lang="scss">
.table-view-header {
  padding: 0;
  border-radius: 0 0 6px 6px;
  backdrop-filter: blur(6px);
  background-color: rgb(var(--v-theme-surface), 0.9);
  border-block-end: 1px solid rgba(0, 0, 0, 12%);
  box-shadow: 0 4px 18px rgba(var(--v-shadow-key-umbra-color), 0.1), 0 0 transparent, 0 0 transparent;
  min-block-size: 54px;

  .text-h6 {
    min-block-size: 37px;
  }

  .v-btn {
    i::before {
      line-height: 21px;
      margin-inline-end: 5px;
    }
  }
}
</style>
