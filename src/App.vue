<template>
  <v-app>
  <v-map>
  </v-map>
  </v-app>  
</template>

<script>
import vMap from './components/map'
export default {
  name: 'App',
  components: {
    vMap
  },
  data: () => ({
  }),
  methods: {
    click() {
      alert('click')
    }
  },
  computed: {
    width() {
      return window.innerWidth
    },
    height() {
      return window.innerHeight
    }
  }
}; 
</script>
<style lang="scss" scoped>
</style>