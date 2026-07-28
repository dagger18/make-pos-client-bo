<script setup>
import { layout, layoutInvite, makeDefaultEntity, makeInvite } from '@/config/forms/User';
import UserInviteService from '@/services/UserInviteService';
import EntityService from '@/services/UserService';

const form = ref(null)
const formInvite = ref(null)

function setEntity(entity = null) {
  form.value.setEntity(entity)
}
function setInviteEntity(entity = null) {
  formInvite.value.setEntity(entity)
}
defineExpose({
  setEntity,
  setInviteEntity
})
const emit = defineEmits(['entitySubmitted'])
</script>
<template>
  <AppForm
    :layout="layout"
    :entityName="$gettext('User')"
    :makeDefaultEntity="makeDefaultEntity"
    :service="EntityService"
    ref="form"
    :width="'800px'"
    @entitySubmitted="emit('entitySubmitted')"
  />
  <AppForm
    ref="formInvite"
    :layout="layoutInvite"
    :entityName="$gettext('User')"
    :makeDefaultEntity="makeInvite"
    :service="UserInviteService"
    :submitBtnSaveText="$gettext('Invite')"
    :width="'800px'"
    @entitySubmitted="emit('entitySubmitted')"
  />
</template>
