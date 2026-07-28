<script setup>
const [dialog, toggleDialog] = useToggle()
const state = reactive({
  resolve: null,
  message: null,
  title: null,
  options: {
    color: 'primary',
    width: 400
  }
})
function open (title, message, options) {
  toggleDialog(true)
  state.title = title
  state.message = message
  state.options = Object.assign(state.options, options)

  return new Promise(resolve => {
    state.resolve = resolve
  })
}
function cancel () {
  state.resolve(false)
  toggleDialog(false)
}
function confirm () {
  state.resolve(true)
  toggleDialog(false)
}
defineExpose({open})
</script>
<template>
  <v-dialog v-model="dialog" :max-width="state.options.width" @keyup.esc="cancel">
    <DialogCloseBtn @click="cancel" />
    <v-card>
      <template #title>
        <div class="px-2">{{ state.title }}</div>
      </template>
      <v-card-text v-show="!!state.message" class="mt-n2">
        <span :class="[state.options.color === 'error' ? 'text-error':'']">
          {{ state.message }}
        </span>
      </v-card-text>
      <v-card-text class="d-flex justify-start gap-3 flex-wrap">
        <v-btn
          variant="elevated" :color="state.options.color"  size="small"
          @click="confirm"
        >{{ $gettext('Confirm') }}</v-btn>
        <v-btn variant="text" color="gray" @click="cancel" size="small">
          {{ $gettext('Cancel') }}
        </v-btn>
        
        
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
