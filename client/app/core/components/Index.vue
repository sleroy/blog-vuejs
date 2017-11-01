<template lang="pug">
extends partial/layout
block nav
  navbar(v-bind:page="page")
block header
  .blog-header.text-responsive.typography
    .container
      .row.justify-content-center
        .col-md-8.col-sm-12
          h1.blog-title
            | {{ title }}
          p.lead.blog-description {{ subtitle }}
block container
  .row.justify-content-center.text-responsive.typography
    section.home.col-md-8.col-offset-2.col-sm-12
      post-list(:pageIndex="pageIndex")
      post-paginator(:pageIndex="pageIndex")
    aside.col-md-2.col-sm-12
        blog-aside()
block copyright
  copyright()
</template>

<script>
/**
 * //    postList(:page="page")
    include mixins/post.pug
    +posts()
 */

import global from '../config/global'
import theme from '../config/theme'

export default {
  name: 'Index',
  components: {
  },
  data() {
    return {
      config: global,
      theme: theme,
      page: {
        current_url: global.url
      },
      pageIndex: null,
      title: global.title,
      subtitle: global.subtitle
    };
  },
  methods: {
    updateRoute: function(routeQuery) {
      if (routeQuery.page === undefined) {
        this.pageIndex = 0;
      } else {
        this.pageIndex = routeQuery.page;
      }
      console.debug('Index: page index is ', this.pageIndex);
    }
  },
  created: function() {
    this.$eventBus.$on('route-changed', routeEvent => {
      console.log('Index:Route has changed');
      console.log('to', routeEvent.to);
      console.log('from', routeEvent.from);
      this.updateRoute(routeEvent.to.query);
    });

    this.updateRoute(this.$route.query);
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
.blog-description {
  font-size: 1.1rem;
  color: #999;
}

@media (min-width: 768px) {
  .blog-title {
    font-size: 4rem;
    margin-bottom: 0;
    padding: 30px;
  }
}

.blog-header {
  border-bottom: .05rem solid #eee;
  margin-bottom: 20px;
}
</style>


