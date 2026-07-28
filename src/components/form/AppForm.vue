<template>
  <div :class="{ 'form-dialog': isDialog, 'w-100': fullWidth }" v-show="entity">
    <VCard
      class="form-title mx-4"
      v-if="entity && isDialog"
    >
      <template #title>
        <div class="d-flex align-items-center">
          <IconBtn
            id="vertical-nav-toggle-btn"
            class="ms-n3 d-lg-none"
            @click="$parent.$parent.$attrs.toggleVerticalOverlayNavActive(true)"
          >
            <VIcon size="26" icon="tabler-menu-2" />
          </IconBtn>
          <span class="text-h5 d-flex align-center">{{ (entity.id ? $gettext('Edit') : $gettext('Add')) + ' ' + entityName }}</span>
        </div>
      </template>
      <template #append>
        <div class="form-close d-flex me-n3">
          <v-btn variant="text" @click="reset" color="primary">
            <VIcon icon="tabler-x" size="30" />
          </v-btn>
        </div>
      </template>
    </VCard>

    <v-form ref="form" autocomplete="shut-google" v-if="entity" :class="[isDialog ? 'px-4 pt-1' : 'pa-0']">
      <v-tabs
        v-model="tabActive"
        centered
        v-show="tabLayout.length > 0"
        slider-color="primary"
        class="form-tab"
      >
        <v-tab v-for="(tab, tabIndex) in tabLayout.length > 0 ? tabLayout : ['dummy']" :key="tabIndex">
          {{ tab.name }}
        </v-tab>
      </v-tabs>

      <VCard :class="[isDialog ? 'my-4' : 'elevation-0']">
        <VCardText :class="{ 'pa-0': isSubForm }">
          <v-window v-model="tabActive" :class="[tabLayout[tabActive] ? tabLayout[tabActive].activeClass : '']">
            <v-window-item
              v-for="(tab, tabIndex) in tabs"
              :key="tabIndex"
              :transition="false"
              :reverse-transition="false"
            >
              <v-row v-for="(row, rowIndex) in rows(tab)" :key="rowIndex">
                <v-col
                  v-for="(column, columnIndex) in columns(row)"
                  :key="columnIndex"
                  cols="12"
                  :lg="columnWidth == 0 ? (column[0] && column[0].columnSpan ? column[0].columnSpan : (12 / columns(row).length)) : columnWidth"
                  :class="{
                    'groupedInputs': column[0] && column[0].groupedInputs,
                    'scrollable': column[0] && column[0].scrollable
                  }"
                >
                  <v-row
                    v-for="(input, inputIndex) in column"
                    v-show="input.show || typeof(input.show) == 'undefined'"
                    :key="inputIndex"
                    px-2 pb-3
                    :class="{
                      'visibility-hidden': input.hidden,
                      'small-row': input.smallRow,
                      'pt-2': input.columnName && !input.isTopLegend,
                      ...input.rowClass,
                      'flex-grow-0': !!input.groupedWidth
                    }"
                    :style="[input.groupedWidth ? ('width:' + input.groupedWidth) : '']"
                  >
                    <template v-if="input.columnName">
                      <v-col
                        class="pb-2 text-secondary text-uppercase text-h6 form-legend no-after d-lg-block d-none"
                        v-if="input.columnName === 'empty'"
                      >
                        &nbsp;
                      </v-col>
                      <v-col class="pb-2 text-secondary text-uppercase text-h6 form-legend" v-else>
                        {{ input.columnName }}
                      </v-col>
                    </template>
                    <template v-else>
                      <v-col :class="[(input.checkBoxInline || input.radioGroupInline) ? 'd-flex align-content-start' : '']">
                        <label
                          class="v-label"
                          :class="[
                            input.checkBoxInline ? '' : 'pb-1',
                            input.radioGroupInline ? 'align-content-start flex-wrap pt-2' : '',
                            input.groupedInputsLabelClass
                          ]"
                          v-if="input.text && !turnOffAllTitle"
                        >
                          <span v-if="input.text === 'empty'">
                            <span class="text-body-2 text-high-emphasis">&nbsp;</span>
                          </span>
                          <span v-else>
                            <span class="text-body-2 text-high-emphasis">{{ input.text }}</span>
                            <span v-if="isInputRequired(input)" class="text-error">&nbsp;*</span>
                          </span>
                        </label>

                        <Component
                          :is="resolveComponent(input)"
                          :ref="getInputRef(input)"
                          v-model="entity[input.name]"
                          v-bind="resolvedBindings(input, column)"
                          @update:modelValue="onInput(input.name, $event)"
                        />
                      </v-col>
                    </template>
                  </v-row>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
        </VCardText>

        <div class="px-4 py-3" v-if="!isSubForm">
          <slot name="SubmitBtn" :entity="entity">
            <SubmitBtn
              color="primary"
              @click="submit"
              class="mr-2"
              :size="miniActionButtons ? 'small' : 'default'"
              v-if="isSaveable"
              :disabled="isImageUploading"
            >
              <template v-slot:prepend>
                <v-icon icon="tabler-device-floppy" size="24"></v-icon>
              </template>
              {{ saveText }}&nbsp;{{ entityName }}
            </SubmitBtn>
          </slot>

          <v-btn color="secondary" variant="tonal" depressed v-if="isDialog" @click="reset">
            {{ $gettext('Cancel') }}
          </v-btn>
        </div>
      </VCard>
    </v-form>
  </div>
</template>

<script setup>
import { VSwitch, VCheckbox } from 'vuetify/lib/components/index.mjs'
import AppCombobox from '@/@core/components/app-form-elements/AppCombobox.vue'
import AppTextarea from '@/@core/components/app-form-elements/AppTextarea.vue'
import AppRadioGroup from '@/components/common/AppRadioGroup.vue'
import AppTable from '@/components/table/AppTable.vue'
import Uploader from '@/components/common/Uploader/Uploader.vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import BtnSelectGroup from '@/components/form/BtnSelectGroup.vue'
import DatePicker from '@/components/form/DatePicker.vue'
import DateTimePicker from '@/components/form/DateTimePicker.vue'
import SubForm from '@/components/form/SubForm.vue'
import ImageUpload from '@/components/form/ImageUpload.vue'
import Money from '@/components/form/Money.vue'
import OrderedMultiSelect from '@/components/form/OrderedMultiSelect.vue'
import GoodSearchSelect from '@/components/form/GoodSearchSelect.vue'
import PortSearchSelect from '@/components/form/PortSearchSelect.vue'
import CurrencySearchSelect from '@/components/form/CurrencySearchSelect.vue'
import AppFormSelect from '@/components/form/AppFormSelect.vue'
import AppFormRadioGroup from '@/components/form/AppFormRadioGroup.vue'
import AppFormTextField from '@/components/form/AppFormTextField.vue'
import AppFormButton from '@/components/form/AppFormButton.vue'
import AppFormTextDisplay from '@/components/form/AppFormTextDisplay.vue'
import CommonService from '@/services/CommonService'
import { $gettext } from '@/utils/api'

const props = defineProps({
  layout: { type: Function },
  entityName: { type: String, default: '' },
  service: {},
  makeDefaultEntity: { type: Function, default: null },
  disabled: { type: Boolean, default: false },
  width: { type: String, default: '500px' },
  columnWidth: { type: Number, default: 0 },
  isDialog: { type: Boolean, default: true },
  isSubForm: { type: Boolean, default: false },
  isSaveable: { type: Boolean, default: true },
  fullWidth: { type: Boolean, default: false },
  smallWidth: { type: Boolean, default: true },
  miniActionButtons: { type: Boolean, default: false },
  notRemoveScrollAfterSubmit: { type: Boolean, default: false },
  turnOffAllTitle: { type: Boolean, default: false },
  tabLayout: { type: Array, default: () => [] },
  inputCallBack: {},
  entityPreForm: { type: Function, default: null },
  entityPreSubmit: { type: Function, default: null },
  entitySubmitted: { type: Function, default: null },
  submitBtnSaveText: { type: String, default: '' },
  context: { type: Object, default: () => ({}) },
  updateEntityMethod: { type: String, default: 'update' }
})

const emit = defineEmits(['update:modelValue', 'entitySubmitted', 'formClosed'])

const form = ref(null)
const entity = ref(null)
const tabActive = ref(null)
const imageUploadingCount = ref(0)
const imageUploadTimeouts = {}
const customRefs = {}
const subFormRefs = {}

const typeMap = {
  btnSelectGroup:     markRaw(BtnSelectGroup),
  datePicker:         markRaw(DatePicker),
  datetimePicker:     markRaw(DateTimePicker),
  subForm:            markRaw(SubForm),
  imageUpload:        markRaw(ImageUpload),
  switch:             markRaw(VSwitch),
  checkbox:           markRaw(VCheckbox),
  radioCustom:        markRaw(AppRadioGroup),
  radioGroup:         markRaw(AppFormRadioGroup),
  select:             markRaw(AppFormSelect),
  orderedMultiSelect: markRaw(OrderedMultiSelect),
  table:              markRaw(AppTable),
  'select-search':    markRaw(GoodSearchSelect),
  'port-search':      markRaw(PortSearchSelect),
  'currency-search':  markRaw(CurrencySearchSelect),
  combobox:           markRaw(AppCombobox),
  button:             markRaw(AppFormButton),
  uploader:           markRaw(Uploader),
  textarea:           markRaw(AppTextarea),
  text:               markRaw(AppFormTextDisplay),
}
const defaultInputComponent = markRaw(AppFormTextField)
const moneyComponent = markRaw(Money)

function resolveComponent(input) {
  if (input.type === 'number' && input.numberMode === 'money') return moneyComponent
  if (input.type === 'custom') return markRaw(input.component)
  return typeMap[input.type] ?? defaultInputComponent
}

function resolvedBindings(input, column) {
  const bindings = { ...input }
  if (!bindings.validateOn) bindings.validateOn = 'blur'
  if (column[0]?.groupedInputs) bindings['hide-details'] = true
  switch (input.type) {
    case 'number':
      bindings.min = bindings.min ?? 0
      break
    case 'imageUpload':
      bindings.onUploading = (v) => onImageUploading(input.name, v)
      break
    case 'checkbox':
      bindings.disabled = props.disabled
      break
    case 'select-search':
    case 'port-search':
    case 'currency-search':
      bindings.itemTitle = bindings.itemTitle ?? 'name'
      bindings.itemValue = bindings.itemValue ?? 'id'
      bindings.placeholder = bindings.placeholder ?? ($gettext('Enter your search') + ' ...')
      break
    case 'combobox':
      bindings.autocomplete = bindings.autocomplete ?? 'new-password'
      bindings.style = bindings.style ?? 'min-inline-size:75px'
      break
    case 'textarea':
      bindings.rows = bindings.rows ?? 3
      break
  }
  return bindings
}

function getInputRef(input) {
  if (input.type === 'custom') {
    return (el) => { el ? (customRefs[input.name] = el) : delete customRefs[input.name] }
  }
  if (input.type === 'subForm') {
    return (el) => { el ? (subFormRefs[input.name] = el) : delete subFormRefs[input.name] }
  }
  return undefined
}

const isImageUploading = computed(() => imageUploadingCount.value > 0)

const tabs = computed(() => {
  if (!entity.value) return []
  const layout = props.layout(entity.value, props.context)
  if (layout.length === 0) return []
  return props.tabLayout.length === 0 ? [layout] : layout
})

const saveText = computed(() => props.submitBtnSaveText || $gettext('Save'))

function rows(tab) {
  return tab[0] && Array.isArray(tab[0]) ? tab.filter(Boolean) : [tab]
}

function columns(row) {
  return row[0] && Array.isArray(row[0]) ? row.filter(Boolean) : [row]
}

async function setEntity(entityData = null) {
  let editingEntity = entityData
    ? Object.assign({}, entityData)
    : Object.assign({}, await props.makeDefaultEntity(props.context))
  if (props.entityPreForm) editingEntity = props.entityPreForm(editingEntity)
  entity.value = editingEntity
  if (props.isDialog) {
    document.querySelector('html').classList.add('overflow-y-hidden')
    nextTick(() => {
      const formWrapper = form.value.$el.parentNode
      formWrapper.scroll({ top: 0, behavior: 'smooth' })
    })
  }
  if (props.tabLayout) {
    const tabIndex = props.tabLayout.findIndex(tab => tab.active)
    tabActive.value = tabIndex === -1 ? 0 : tabIndex
  }
}

function onImageUploading(name, isUploading) {
  if (isUploading) {
    imageUploadingCount.value++
    imageUploadTimeouts[name] = setTimeout(() => {
      if (imageUploadTimeouts[name]) {
        imageUploadingCount.value = Math.max(0, imageUploadingCount.value - 1)
        delete imageUploadTimeouts[name]
      }
    }, 30000)
  } else if (imageUploadTimeouts[name]) {
    clearTimeout(imageUploadTimeouts[name])
    delete imageUploadTimeouts[name]
    imageUploadingCount.value = Math.max(0, imageUploadingCount.value - 1)
  }
}

function onInput(field, value) {
  if (!props.inputCallBack) return
  const callback = typeof props.inputCallBack === 'function'
    ? props.inputCallBack(entity.value)
    : props.inputCallBack
  if (callback?.[field]) callback[field](entity.value, columns, value)
}

function reset() {
  entity.value = null
  if (props.isDialog && !props.notRemoveScrollAfterSubmit) {
    document.querySelector('html').classList.remove('overflow-y-hidden')
    emit('formClosed')
  }
}

async function doValidate() {
  const formValids = await Promise.all([
    form.value.validate(),
    ...Object.entries(customRefs).map(([, el]) => {
      if (el?.validate && typeof el.validate === 'function') return el.validate()
      return { valid: true }
    }),
    ...Object.values(subFormRefs).map(sForm => sForm.form.$refs.form.validate())
  ])
  const isValid = formValids.every(r => r.valid)
  if (!isValid) {
    const formWrapper = form.value.$el.parentNode
    const firstError = formValids.find(r => !r.valid)
    const firstErrorEl = document.querySelector('[name="' + firstError.errors[0].id + '"]')
    if (firstErrorEl) {
      formWrapper.scroll({
        top: formWrapper.scrollTop + firstErrorEl.getBoundingClientRect().top - 100,
        behavior: 'smooth'
      })
    }
    return false
  }
  return true
}

async function submit() {
  if (!await doValidate()) return
  const clonedEntity = toRaw(Object.assign({}, entity.value))
  const data = props.entityPreSubmit ? await props.entityPreSubmit(clonedEntity) : clonedEntity
  if (data === null || data === false) return
  const action = entity.value.id ? props.updateEntityMethod : 'add'
  let response = await props.service[action](data)
  if (!response.errors) {
    response = props.entitySubmitted ? props.entitySubmitted(response) : response
    emit('entitySubmitted', response)
    if (props.isDialog) entity.value = null
  }
  if (props.isDialog && !props.notRemoveScrollAfterSubmit) {
    document.querySelector('html').classList.remove('overflow-y-hidden')
  }
}

function isInputRequired(input) {
  if (!input.rules) return false
  const { required } = CommonService.rules()
  return input.rules.some(rule => rule.toString() === required.toString())
}

function defaultTextPlaceholder(input) {
  return isInputRequired(input) ? $gettext('Required field') : $gettext('Optional field')
}

onBeforeUnmount(() => {
  if (props.isDialog) document.querySelector('html').classList.remove('overflow-y-hidden')
})

watch(entity, (value) => {
  if (props.isSubForm) emit('update:modelValue', value)
}, { deep: true })

defineExpose({ setEntity, doValidate, submit })
</script>

<style lang="scss">
.field-label {
  padding-block-start: 6px !important;
}

[type="file"] {
  block-size: 36px;
  font-size: 14px;
}

.row.small-row {
  margin-inline: auto;
  max-inline-size: 600px;
}

.form-tab {
  .v-tab {
    border-block-end: 1px solid #eee;
  }
}

.v-row + .v-row {
  margin-block-start: 0;
}

.groupedInputs {
  display: flex;

  & > .v-row {
    margin-block-start: 0 !important;

    & > .v-col {
      padding-block-start: 0 !important;
    }
  }
}
</style>
