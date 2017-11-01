<template lang="pug">
.post-list
  postSummary(:postID="postID", v-for="postID in posts")
</template>

<script>
  import postSummary from './postSummary';
  import * as postService from '../../../services/postService';

  export default {
    props: [
      'pageIndex'
    ],
    data() {
      return {
        posts: []
      }
    },
    components: {
      postSummary
    },
    methods: {
      loadPosts: function(newVal) {
        this.posts = [];
        if (newVal) {
          this.pageIndex = newVal;
        }
        console.info('postList: loading page ', this.pageIndex);
        postService.loadPosts(this.pageIndex)
          .then((data) => {
            this.posts = data;
          })
          .catch((err) => {
            this.$eventBus.emit('app-error', err);
          })
      }
    },
    mounted() {
        if (this.pageIndex === undefined) {
          console.log('postList: page index not found');
          this.loadPosts(0);
        } else {
          console.log('postList: loading page', this.pageIndex);
          this.loadPosts(this.pageIndex);
        }
    },
    watch: {
      pageIndex: function(newVal, oldVal) {
        console.info('postList: refreshing page Index', newVal);
        this.loadPosts(newVal);
      }
    }
  }
</script>

<style scoped>

</style>
