import axios from "axios"
const vapidPublicKey = "BKTbHPoxBADK46purpWUaDhWXIuoofRGTgxcgqVPC2XNfok1N6hCr99c0G7dwvh-Bz18ze0Fa7w_ayvQaVzDR6c";

function subscribePush() {
    console.log("Navigator", navigator);
    if(!navigator?.serviceWorker){
        return;
    }

    navigator.serviceWorker.ready.then(registration => {
    if (!registration.pushManager) {
      alert("Push Unsupported")
      return
    }
    
    registration.pushManager
      .subscribe({
        userVisibleOnly: true, //Always display notifications
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })
      .then(subscription => axios.post("/api/push/register", subscription))
      .catch(err => console.error("Push subscription error: ", err))
  })
}

function unsubscribePush() {
    
    if(!navigator?.serviceWorker){
        return;
    }
    navigator.serviceWorker.ready.then(registration => {
      //Find the registered push subscription in the service worker
      registration.pushManager
        .getSubscription()
        .then(subscription => {
          if (!subscription) {
            return 
            //If there isn't a subscription, then there's nothing to do
          }
          subscription
            .unsubscribe()
            .then(() => axios.delete("/api/push/unregister"))
            .catch(err => console.error(err))
        })
        .catch((err) => console.error(err))
    })
  }

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/")
  
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  module.exports = {
    subscribePush,
    unsubscribePush

};