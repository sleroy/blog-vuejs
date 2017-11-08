<i18n>
{
  "en": {
    "untitled": "Untitled"
  }

}
</i18n>
<template lang="pug">
  span(v-if="post.title") {{ post.title }}
  span(v-else) {{ $t('untitled') }}

</template>

<script>
  export default {
    props: ['post']
  }
</script>

<style scoped>

</style>
