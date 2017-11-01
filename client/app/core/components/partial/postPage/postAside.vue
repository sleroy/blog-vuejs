<template lang="pug">
.post-sidebar
  .panel
    .panel-header
      h3 Posts
    .panel-body
      ul
        li
          p Article 1
        li
          p Article 2
        li
          p Article 3
        li
          p Article 4
</template>

<script>

import global from '../../../config/global.js';

export default {
  data() {
    return {
      description: global.description
    }
  }


}
</script>

<style scoped>
.blog-sidebar {
  font-size: 70%;
}

.sidebar-module-inset {
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: .25rem;
}

.sidebar-module {
  padding: 1rem;
  margin: 0 -1rem 1rem;
}
</style>
