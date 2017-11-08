<template lang="pug">
div(v-if="categories")
  template(v-for="(category,index) in categories")
    post-category(:category="category")
    span(v-if="index+1 < categories.length") |
</template>

<script>
import postcategory from './postCategory'

export default {
  props: ['categories'],
  components: {
    'post-category': postcategory
  }
};
</script>

<style scoped>

</style>
