<script setup>
import AppDateTimePicker from '@/@core/components/app-form-elements/AppDateTimePicker.vue';
import { printDate, toUTCDate } from '@/services/CommonService';
const props = defineProps({
  modelValue: {type: String, default: ''},
  toUTCDateOnPick: {type: Boolean, default: true},
  toDateOnMounted: {type: Boolean, default: true}
})
const date = ref('')
onMounted(() => {
  if(props.modelValue && props.modelValue.includes(',')) {
    const [from, to] = props.modelValue.split(',');
    date.value = props.toDateOnMounted 
      ? (printDate(from) + ' to ' + printDate(to))
      : props.modelValue.replace(',', ' to ')
  } else {
    date.value = props.toDateOnMounted ? printDate(props.modelValue) : props.modelValue
  }
  
})
const emit = defineEmits(['update:modelValue'])
function onUpdate(value) {
  
  if(value !== date.value) {
    date.value = value
    console.log('picked date value', value, props.toUTCDateOnPick )
    if(value && value.includes(' to ')) {
      const [from, to] = value.split(' to ');
      emit('update:modelValue', 
        props.toUTCDateOnPick 
        ? (toUTCDate(from, 'DD/MM/YYYY') +','+ toUTCDate(to, 'DD/MM/YYYY'))
        : value.replace(' to ', ',')
      )
    } else {
      emit('update:modelValue', props.toUTCDateOnPick ? toUTCDate(value + ' 12:00:00', 'DD/MM/YYYY HH:mm:ss') : value)
    }
  }
  
}
</script>
<template>
<AppDateTimePicker
  :modelValue="date"
  @update:modelValue="onUpdate"
  :placeholder="$gettext('Select date') + '...'"
  :config="{ dateFormat: 'DD/MM/YYYY', altInput: true, altFormat: 'DD/MM/YYYY'}"
  prepend-inner-icon="tabler-calendar"
/>
</template>
