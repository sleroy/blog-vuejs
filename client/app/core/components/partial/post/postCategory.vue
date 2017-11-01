<template lang="pug">
router-link(class="category-link", :to="{ name: 'category1', params: { category1: category.slug }}", :title="category.name", v-if="complete")
  | {{category.name}}
</template>

<script>
export default {
  props: ['category'],
  computed: {
    complete() {
      return this.category && this.category.slug && this.category.name;
    }
  }
};
</script>

<style scoped>
.category-link {
  margin-left: 0.1rem;
  margin-right: 0.1rem;
}
</style>
