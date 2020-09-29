<template>
  <basic></basic>
  <custom></custom>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Basic from './examples/Basic.vue'
import Custom from './examples/Custom.vue'

export default defineComponent({
  name: 'App',
  components: {
    Basic,
    Custom
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
