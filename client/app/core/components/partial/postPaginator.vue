<template lang="pug">
.paginator.container
  .row.justify-content-center.text-responsive.typography
    .col-md-8.col-sm-8.text-center
      button.btn.btn-success(href="#", class="pure-menu-link", @click.prevent="changePage(previousPage)", v-if="hasPrevious") Previous post
      label.mr-3.ml-3.btn(href="#", class="pure-menu-link", @click.prevent="changePage(currentPage)") {{ currentPage }}
      button.btn.btn-success(href="#", class="pure-menu-link", @click.prevent="changePage(nextPage)", v-if="hasNext") Next post
</template>

<script>
import * as postService from '../../services/postService';

export default {
  props: [
    'pageIndex'
  ],
  data() {
    return {
      numberPages: 100,
      pageIdx: null
    }
  },
  computed: {
    hasPrevious() {
      return this.pageIdx > 0;
    },
    hasNext() {
      return this.pageIdx < this.numberPages;
    },
    currentPage() {
      return this.pageIdx;
    },
    nextPage() {
      return this.pageIdx + 1;
    },
    previousPage() {
      return this.pageIdx - 1;
    }
  },
  methods: {
    changePage: function(page) {
      var data = Object.assign({}, this.$route.query);
      data['page'] = page;
      this.$router.push({
        name: 'articles',
        query: data
      });
    }
  },
  mounted: function() {
    postService.getNumberOfPages().then((data) => {
      this.numberPages = data;
    })
    this.pageIdx = parseInt(this.pageIndex);
  },
  watch: {
    pageIndex: function (newVal, oldVal) {
      this.pageIdx = parseInt(newVal);
    }
  }

}
</script>

<style scoped>
.paginator button {
  width : 150px;
}
</style>
