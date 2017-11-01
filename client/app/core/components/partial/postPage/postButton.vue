<template lang="pug">
button.postButton.justify-content-center.btn.btn-lg.btn-secondary(
  @click="clickPost",
  @mouseenter="hovered=true",
  @mouseleave="hovered=false",
)
  img(:src="bgImg", alt="Post picture", class="image", style="width:100%")
  .middle
    .text
      | {{title}}
</template>

<script>
export default {
  name: 'PostButton',
  props: [
    'title', 'bgImg', 'link', 'thumb'
  ],
  data: function() {
    return {
      hovered: false
    }
  },
  computed: {
    picture() { return this.bgImg ? this.bgImg : this.thumb; }
  },
  methods: {

    clickPost() {
      this.$router.push({ name: this.link });
    }

  }
}
</script>

<style scoped>
.postButton {
  width: 100%;
  height: 300px;
  border-radius: 4px;
}


.postButton:hover .image {
  opacity: 0.3;
  max-width: 100%;
  *width: 100%;
  height: auto;
}

.postButton:hover .middle {
  opacity: 1;
}


.image {
  opacity: 1;
  display: block;
  width: 100%;
  height: auto;
  transition: .5s ease;
  backface-visibility: hidden;
}

.middle {
  transition: .5s ease;
  opacity: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%)
}

.text {
  background-color: #4CAF50;
  color: white;
  font-size: 16px;
  padding: 16px 32px;
  word-wrap: break-word;
  width: 100%;
}

.middle {
  transition: .5s ease;
  opacity: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%)
}
</style>
