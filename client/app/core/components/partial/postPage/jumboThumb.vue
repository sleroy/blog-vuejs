<template lang="pug">
.jumbo-thumb
  .media
    .jumbo-thumb-left.align-self-center.d-flex.mr-3.hidden-md-down
      a(hreflang="en" :href="permalink")
        img.thumbnail.img-fluid.float-left.rounded(:alt="title", itemprop="image", :src="thumbnailImageUrl")
    .media-body
      h1.display-3 {{title}}
      p.lead(v-html="excerpt")
      .readWrapper
        button.read-more.btn.btn-lg.btn-info(v-scroll-to="'#read, 20px'")
          i.fa.fa-arrow-circle-o-down
          | Read more
</template>

<script>
export default {
  name: 'jumboThumb',
  props: {
    title: {
      type: String,
      default: ''
    },
    excerpt: {
      type: String,
      default: ''
    },
    permalink: {
      type: String,
      default: ''
    },
    thumbnailImageUrl: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.jumbo-thumb-left {
  max-width: 30%;
}

.read-more {
  width: 30%;
}

</style>
