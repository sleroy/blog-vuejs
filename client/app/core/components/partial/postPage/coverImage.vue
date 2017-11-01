<template lang="pug">
.row.justify-content-center.text-responsive.typography
  img( :src="coverPicture").cover-image.img-rounded
  a(hreflang="en" :href="permalink", v-if="thumbTop")
      .postShorten-thumbnailimg
        img.img-fluid.rounded(:alt="title", itemprop="image", :src="thumbnailImageUrl")
</template>

<script>

export default {
  props: {
    permalink: {
      type: String,
      default: 'http://'
    },
    title: {
      type: String,
      default: 'Title'
    },
    thumbnailImageUrl: {
      type: String,
      default: null
    },
    thumbnailImagePosition: {
      type: String,
      default: 'top'
    },
    coverImage: {
      type: String,
      default: null
    }
  },
  computed: {
    coverPicture() {
      return this.coverImage ? this.coverImage : "https://previews.123rf.com/images/pashabo/pashabo1412/pashabo141200082/34371516-Business-background-abstrait-avec-stylis-s-fl-ches-vers-le-haut-For-Cover-livre-brochure-rapport-ann-Banque-d'images.jpg";
    }
  },
  methods: {

    thumbTop() {
      return this.thumbnailImagePosition === 'top' && this.thumbnailImageUrl;
    }
  }
}
</script>

<style scoped>
.cover-image {
  max-width: 100%;
  max-height: 100%;
  height: 800px;
  margin-top: 3rem;
  margin-bottom: 3rem;
}
</style>
