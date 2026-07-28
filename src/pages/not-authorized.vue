<script setup>

definePage({
  alias: '/pages/misc/not-authorized',
  meta: {
    public: true,
  },
})

</script>

<template>
  <div class="misc-wrapper">
    <ErrorHeader
      status-code="401"
      :title="$gettext('You are not authorized!') + '🔐'"
      :description="$gettext('You do not have permission to view this page using the credentials that you have provided while login. Please contact your site administrator.')"
    />
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/misc.scss";
</style>
