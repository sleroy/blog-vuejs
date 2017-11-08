<i18n>
{
  "en": {
    "translate_original": "Translate the original address"
  }
}
</i18n>
<template lang="pug">
.post-info
    time.publish-date(:href="post.from", target='_blank', :title="post.from")
    | {{ full_date }} in &nbsp;
    categories(:categories="categories")
</template>

<script>
import config from '../../config/global';
import * as moment from 'moment';
import postCategories from './postCategories';

export default {
  props: ['post'],
  components: {
    categories: postCategories
  },
  data() {
    return {
      full_date: '',
      information_link: '',
      categories: []
    };
  },
  watch: {
    post: function(newVal, oldVal) {
      this.full_date = moment(newVal.createdAt, moment.ISO_8601).format(
        config.postformat
      );
      this.information_link = newVal.from; // TODO:: && (is_home() || is_post())
      this.categories = newVal.categories;
    }
  }
};
</script>

<style scoped>
.post-info {
  color: #999;
  margin-bottom: 1.25rem;
  font-size: 75%;
}
</style>
