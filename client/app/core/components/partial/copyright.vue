<template lang="pug">
.container-fluid
  .copyright.text-responsive.typography
    .row.justify-content-center
      .col-md-4.col-sm-8.text-center
        p
          | &copy; {{copyrightYear}}
        a(:href=copyrightURL) {{ copyrightName }}.
            br
            | Powered by #[a(href='https://hexo.io/', target='_blank') Hexo] &amp; Vue.js
</template>

<script>

import global from '../../config/global.js'
import theme from '../../config/theme.js'

export default {
  data() {
    return {
      currentDate: new Date(),
      currentYear: null,
      copyrightYear: null,
      copyrightURL: null,
      copyrightName: null
    }
  },
  created: function() {
    this.currentYear = this.currentDate.getFullYear();
    this.copyrightYear = !theme.copyright.since || this.currentYear === theme.copyright.since ? this.currentYear : theme.copyright.since + ' - ' + this.currentYear;
    this.copyrightURL = theme.copyright.url || global.url;
    this.copyrightName = theme.copyright.name || global.author;
  }
}
</script>

<style scoped>
.copyright {
  margin-top:10px;
  background-color: #eee;
}
</style>
