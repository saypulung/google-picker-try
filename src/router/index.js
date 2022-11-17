import Vue from 'vue';
import Router from 'vue-router';
import HelloWorld from '@/components/HelloWorld';
import GooglePicker from '@/components/GooglePicker';
import DropboxChooser from '@/components/DropboxChooser';
import OneDriveChooser from '@/components/OneDriveChooser';
import RedirectOneDrive from '@/components/RedirectOneDrive';

Vue.use(Router)

export default new Router({
  mode: 'history',
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
    },
    {
      path: '/dropbox',
      name: 'DropboxChooser',
      component: DropboxChooser
    },
    {
      path: '/onedrive',
      name: 'OneDriveChooser',
      component: OneDriveChooser
    },
    {
      path: '/redirect',
      name: 'RedirectOneDrive',
      component: RedirectOneDrive
    },
  ]
})
