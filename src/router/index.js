import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import GooglePicker from '@/components/GooglePicker'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/picker',
      name: 'GooglePicker',
      component: GooglePicker
    }
  ]
})
