<template lang="pug">
.row
  spinner(class="mt4", message="Loading...", v-if="!loaded")
  transition(name="fade")
    article.post-block(v-if="hasPost")
      .media
        .postShorten-left-thumbnailimg.align-self-center.d-flex.mr-3.hidden-md-down(v-if="thumbLeft")
          router-link(class="category-link", :to="{ name: 'post_per_date', params: { year: post.year, month: post.month, day: post.day, article_name: post.slug }}")
              img.thumbnail.img-fluid.float-left.rounded(:alt="post.title", itemprop="image", :src="post.thumbnailImageUrl")
        .media-body
          h2.post-title
              router-link(class="post-title-link", :to="{ name: 'post_per_date', params: { year: post.year, month: post.month, day: post.day, article_name: post.slug }}", hreflang="en")
                  postTitle(:post="post")
          router-link(hreflang="en", class="post-title-link", :to="{ name: 'post_per_date', params: { year: post.year, month: post.month, day: post.day, article_name: post.slug }}", v-if="thumbTop")
              .postShorten-thumbnailimg
                  img.img-fluid.rounded(:alt="post.title", itemprop="image", :src="post.thumbnailImageUrl")
          postInfo(:post="post")
          a.hidden-sm-up(hreflang="en" @click="postLink", v-if="thumbLeft")
              img.thumbnail.img-fluid.rounded(:alt="post.title", itemprop="image", :src="post.thumbnailImageUrl")
          .post-content(v-html="post.excerpt" v-if="post.excerpt")
          .post-content(v-html="post.content" v-else="")

          button.btn.btn-success.read-more(@click="postLink",type="button")
            | Read more

</template>

<script>
  import * as postService from '../../../services/postService';
  import postTitle from './postTitle';
  import postInfo from './postInfo';
  import * as moment from 'moment';

  export default {
    props: [
      'postID'
    ],
    components: {
      postInfo,
      postTitle
    },
    data() {
      return {
        post: {
          path: '',
          title: 'Loading...',
          excerpt: 'Loading excerpt...'
        },
        loaded: false
      }
    },
    methods: {
      loadPost: function(postID) {
        postService.getPost(postID.code)
          .then((res, err) => {
            if (err) {
              this.$eventBus.emit('app-error', err);
            } else {
              this.post = res.body.data;
              const createdDate = moment(this.post.createdAt, moment.ISO_8601);
              this.post.year = createdDate.year();
              this.post.month = createdDate.month();
              this.post.day = createdDate.date();
              if (!this.post.year || !this.post.month || !this.post.day) {
                console.error('Problem with the date ', this.post.createdAt);
              }
              this.loaded = true;
            }
          });
      },
      postLink: function() {
        this.$router.push({
          name: 'post_per_date',
          params: {
            year: this.post.year,
            month: this.post.month,
            day: this.post.day,
            article_name: this.post.slug
          }
        });
      }

    },
    computed: {
      hasPost() {
        return this.post !== undefined && this.error === undefined;
      },
      hasError() {
        return this.error !== undefined;
      },
      thumbTop() {
        return this.post.thumbnailImagePosition === 'top' && this.post.thumbnailImageUrl;
      },
      thumbLeft() {
        return (!this.post.thumbnailImagePosition || this.post.thumbnailImagePosition === 'left') && this.post.thumbnailImageUrl;
      }

    },
    mounted() {
      this.loadPost(this.postID);
    },
    watch: {
      postID: function(newVal, oldVal) {
        console.info('postSummary: refreshing page Index', newVal);
        this.loadPost(newVal);
      }
    }
  }
</script>

<style scoped>
  .post-title {
    padding-left: 0.2rem;
  }

  .post-title a {
    color: rgb(51, 51, 51)
  }

  .post-block {
    border-bottom: .05rem solid #eee;
    margin-bottom: 20px;
    padding-left: 0.2rem;
    padding-bottom: 2rem;
  }

  .postShorten-thumbnailimg {
    margin: 0 auto;
  }

  .thumbnail {
    width: 100%;
  }

  @media (min-width: 576px) {
    .thumbnail {
      width: 200px;
    }
  }

  .post-content {
    padding-left: 4px;
  }
</style>
