import Vue from 'vue'
import vuetify from './plugins/vuetify'
import VueLayers from 'vuelayers'
import App from './App.vue'

Vue.config.productionTip = false

Vue.use(VueLayers)

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
