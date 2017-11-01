<template lang="pug">
.row.justify-content-center.text-responsive.typography
  article.home.col-md-10.col-offset-1.col-sm-12
    .article-content#read(v-html="content")
    .container.postNavigation
      .row
        .col-md-6.col-sm-12
          postButton( :title="prev.title", :bgImg="prev.coverImage", :link="prev.permalink", :thumb="prev.thumbnailImageUrl")
        .col-md-6.col-sm-12
          postButton( :title="next.title", :bgImg="next.coverImage", :link="next.permalink", :thumb="next.thumbnailImageUrl")
      .row.mt-3
        .col
          button.backHome.justify-content-center.btn.btn-lg.btn-secondary(@click="backHome")
            i.fa.fa-arrow-circle-o-right
            | Return to the posts

</template>

<script>

import postButton from './postButton';


export default {
  name: 'PostContent',
  components: {
    postButton: postButton
  },
  props: [
    'post', 'content', 'prev', 'next'
  ],
  methods: {
    backHome() {
      this.$router.push({ name: '/' });
    }
  }
}
</script>



<style>
.article-content img {
  max-width: 100%;
  height: auto;
  *width: 100%;
  display: block;
  margin: 0 auto;
}

.backHome {
  width: 50%;
}
</style>
