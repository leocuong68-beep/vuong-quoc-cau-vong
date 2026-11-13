/* eslint-disable no-console */

import { register } from 'register-service-worker';

if (import.meta.env.PROD) {
  register(`${import.meta.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log(
        'App is being served from cache by a service worker.\n' +
          'For more details, visit https://goo.gl/AFskqB'
      );
    },
    registered() {
      console.log('Service worker has been registered.');
    },
    cached() {
      console.log('Content has been cached for offline use.');
    },
    updatefound() {
      console.log('New content is downloading.');
    },
    updated() {
      console.log('New content is available.');
      // Load the new version right away when the child is on a menu page;
      // inside a game it waits, and the next start of the app shows it.
      const route = window.location.hash.replace(/^#/, '');
      if (route === '' || route === '/' || route === '/princess') {
        window.location.reload();
      }
    },
    offline() {
      console.log('No internet connection found. App is running in offline mode.');
    },
    error(error) {
      console.error('Error during service worker registration:', error);
    },
  });
}
