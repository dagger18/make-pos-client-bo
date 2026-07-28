<script setup>
import AppDateTimePicker from '@/@core/components/app-form-elements/AppDateTimePicker.vue';
import { printDateTime, toUTCDate } from '@/services/CommonService';
const props = defineProps({
  modelValue: {type: String, default: ''},
  toUTCDateOnPick: {type: Boolean, default: true},
  toDateOnMounted: {type: Boolean, default: true}
})
const date = ref('')
onMounted(() => {
  date.value = props.toDateOnMounted 
              ? printDateTime(props.modelValue, 'DD/MM/YYYY HH:mm') 
              : props.modelValue
})
const emit = defineEmits(['update:modelValue'])
function onUpdate(value) {
  if(value !== date.value) {
    date.value = value
    emit('update:modelValue', props.toUTCDateOnPick ? toUTCDate(value, 'DD/MM/YYYY HH:mm') : value)
  }
  
}
</script>
<template>
<AppDateTimePicker
  :modelValue="date"
  @update:modelValue="onUpdate"
  :placeholder="$gettext('Select date & time') + '...'"
  :config="{ 
    time_24hr: true, enableTime: true, 
    dateFormat: 'DD/MM/YYYY HH:mm', altInput: true, altFormat: 'DD/MM/YYYY HH:mm'
  }"
  prepend-inner-icon="tabler-calendar-time"
/>
</template>
