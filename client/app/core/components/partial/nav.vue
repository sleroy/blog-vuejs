<template lang="pug">
nav.navbar.navbar-expand-lg.navbar-dark.bg-dark
  a.navbar-brand(v-bind:href="config.url", :title="config.title")
    img.logo-image(:src="theme.logo", alt='logo', v-if="theme.logo")
    span.wordwrap(v-else)
      | Blog sylvainleroy.com

  button.navbar-toggler(type='button', data-toggle='collapse', data-target='#navbarNavAltMarkup', aria-controls='navbarNavAltMarkup', aria-expanded='false', aria-label='Toggle navigation')
    span.navbar-toggler-icon
  #navbarNavAltMarkup.collapse.navbar-collapse
    .navbar-nav
      a.nav-item.nav-link(:class="{active: act(value)}", href='#',:target="tar(value)", v-for="(value, key) in theme.menu") {{ key }}
</template>

<script>
import global from '../../config/global.js'
import theme from '../../config/theme.js'

const re = /^(http|https):\/\/*/gi;


export default {
  name: 'NavBar',
  components: {
  },
  props: ['page'],
  data() {
    return {
      config: global,
      theme: theme
    };
  },
  methods: {
    tar: function(value) {
      return re.test(value) ? '_blank' : '_self'
    },
    act: function(value) {
      return !re.test(value) && '/' + this.page.current_url === value;
    }

  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>



