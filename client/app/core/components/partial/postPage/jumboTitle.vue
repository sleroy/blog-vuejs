<template lang="pug">
.jumbo-title
  h1.display-3 {{title}}
  p.lead(v-html="excerpt")
  .readWrapper
    button.read-more.btn.btn-lg.btn-info(v-scroll-to="'#read, 20px'")
      i.fa.fa-arrow-circle-o-down
      | Read more
</template>

<script>
export default {
  name: 'jumboTitle',
  props: {
    title: {
      type: String,
      default: ''
    },
    excerpt: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>

.read-more {
  width: 30%;
}

</style>
