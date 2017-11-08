<template lang="pug">
//- Post Page
.post
    article.post-block
        h1.post-title
            +postTitle(item.title)
        +postInfo(item)
        .post-content
            != item.content

</template>

<script>
  export default {

  }
</script>

<style scoped>

</style>
