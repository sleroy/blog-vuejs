<template lang="pug">
extends partial/layout
block nav
  navbar(v-bind:page="page")
block header
  spinner(class="mt4", message="Loading...", v-if="!post")
  transition(name="fade")
    .jumbotron.jumbotron-fluid(v-if="post")
      .container
        jumboThumb(v-if="thumbLeft", :title="post.title", :excerpt="post.excerpt", :permalink="post.permalink", :thumbnailImageUrl="post.thumbnailImageUrl", :thumbnailImagePosition="post.thumbnailImagePosition")
        jumboTitle(v-else, :title="post.title", :excerpt="post.excerpt")
block container
  .row.justify-content-center.text-responsive.typography
    section.home.col-md-8.col-offset-2.col-sm-12(v-if="post")
        coverImage(v-if="hasCover", :permalink="post.permalink", :title="post.title", :thumbnailImageUrl="post.thumbnailImageUrl", :coverImage="post.coverImage")
        postContent(:post="post", :content="content", :next="next", :prev="prev")
    section.home.col-md-8.col-offset-2.col-sm-12(v-else)
      .row.justify-content-center.text-responsive.typography
        article.loading.col-md-8.col-offset-2.col-sm-12
          h1 Loading the post...
    aside.col-md-2.col-sm-12
        postAside()
block copyright
  copyright()
</template>

<script>
import global from '@/config/global.js'
import theme from '@/config/theme.js'
import * as postService from '@/services/postService'
import jumboThumb from '@/components/partial/postPage/jumboThumb';
import jumboTitle from '@/components/partial/postPage/jumboTitle';
import coverImage from '@/components/partial/postPage/coverImage';
import postContent from '@/components/partial/postPage/postContent';
import postAside from '@/components/partial/postPage/postAside';


export default {
  name: 'PostPage',
  components: {
    jumboThumb: jumboThumb,
    jumboTitle: jumboTitle,
    coverImage: coverImage,
    postContent: postContent,
    postAside: postAside
  },
  data() {
    return {
      config: global,
      theme: theme,
      page: {
        current_url: global.url
      },
      post: null,
      content: null,
      next: null,
      prev: null
    };
  },
  computed: {
    hasCover() {
      return this.post !== null && this.post.coverImage !== null;
    },
    thumbLeft() {
      return (!this.post.thumbnailImagePosition || this.post.thumbnailImagePosition === 'left') && this.post.thumbnailImageUrl;
    }
  },
  methods: {
    coverBackgroundPicture() {
      return "{ background-image: url('" + this.coverPicture() + "'); }";
    },
    loadPost() {
      postService.getPostFromDate(
        this.$route.params.year,
        this.$route.params.month,
        this.$route.params.day,
        this.$route.params.article_name)
        .then((res, err) => {
          if (err) {
            this.$eventBus.emit('app-error', err);
          } else {
            this.post = res;
            this.content = this.post.content;
          }
        });
      postService.getNavigation(this.$route.params.article_name)
        .then((res, err) => {
          if (err) {
            this.$eventBus.emit('app-error', err);
          } else {
            this.prev = res.prev;
            this.next = res.next;
          }
        });
    }
  },
  created: function() {
    this.$eventBus.$on('route-changed', routeEvent => {
      console.log('Index:Route has changed');
      console.log('to', routeEvent.to);
      console.log('from', routeEvent.from);
      this.loadPost(routeEvent.to);
    });
    this.loadPost(this.$route);
  },
  watch: {
    '$route'(to, from) {
      this.$eventBus.$emit('route-changed', {
        to,
        from
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
