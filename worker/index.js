'use strict'



self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      if (clientList.length > 0) {
        let client = clientList[0]
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i]
          }
        }
        return client.focus()
      }
      return clients.openWindow('/')
    })
  )
})

/**
 * Send message to client
 * @param {Object} client The current client to be sent
 * @param {Object} data The data to be sent to current web application
 * @return {Promise} The promise with thenable
 */
 function messageToClient(client, data) {
  return new Promise(function (resolve, reject) {
      const channel = new MessageChannel();

      channel.port1.onmessage = function (event) {
          if (event.data.error) {
              reject(event.data.error);
          } else {
              resolve(event.data);
          }
      };

      client.postMessage(JSON.stringify(data), [channel.port2]);
  });
}

self.addEventListener('push', function (event) {
  if (event && event.data) {
      self.pushData = event.data.json();
      if (self.pushData) {
          self.clients.matchAll({ type: 'window' }).then(function (clientList) {
              if (clientList.length > 0) {
                  messageToClient(clientList[0], self.pushData);
              }
          });
      }

      const data = JSON.parse(event.data.text());
      event.waitUntil(
        registration.showNotification(data.title, {
          body: data.message,
          icon: '/static/drilling-icon.png'
        })
      )
  }
});

// A common UX pattern for progressive web apps is to show a banner when a service worker has updated and waiting to install.
// NOTE: MUST set skipWaiting to false in next.config.js pwa object
// https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users
const promptNewVersionAvailable = event => {
  // `event.wasWaitingBeforeRegister` will be false if this is the first time the updated service worker is waiting.
  // When `event.wasWaitingBeforeRegister` is true, a previously updated service worker is still waiting.
  // You may want to customize the UI prompt accordingly.
  if (confirm('A newer version of this web app is available, reload to update?')) {
    self.addEventListener('controlling', event => {
      window.location.reload()
    })  

    // Send a message to the waiting service worker, instructing it to activate.
    self.messageSkipWaiting()
  } else {
    console.log(
      'User rejected to reload the web app, keep using old version. New version will be automatically load when user open the app next time.'
    )
  }
}

self.addEventListener('waiting', promptNewVersionAvailable);