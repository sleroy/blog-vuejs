<template lang="pug">
.blog-sidebar
  .sidebar-module.sidebar-module-inset
    h3.h3 About
    p
      | {{ description }}
  .sidebar-module
    h3.h3 Archives
    ol.list-unstyled
      li
        a(href='#') March 2014
      li
        a(href='#') February 2014
      li
        a(href='#') January 2014
      li
        a(href='#') December 2013
      li
        a(href='#') November 2013
      li
        a(href='#') October 2013
      li
        a(href='#') September 2013
      li
        a(href='#') August 2013
      li
        a(href='#') July 2013
      li
        a(href='#') June 2013
      li
        a(href='#') May 2013
      li
        a(href='#') April 2013
  .sidebar-module
    h4 Elsewhere
    ol.list-unstyled
      li
        a(href='#') GitHub
      li
        a(href='#') Twitter
      li
        a(href='#') Facebook

</template>

<script>

import global from '../../config/global.js';

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
