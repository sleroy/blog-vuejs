<template lang="pug">
.archive
    - var year = 0;
    - var change = false;
    - page.posts.each(function (item) {
        - var itemYear = date(item.date, 'YYYY') - 0;
        - change = year !== itemYear;
        - year = change ? itemYear : year;
        if change
            h2.archive-year
                != year
        .post-item
            +postInfo(item)
            a.post-title-link(href=url_for(item.path))
                +postTitle(item.title)
    - })
</template>

<script>
  export default {

  }
</script>

<style scoped>

</style>
