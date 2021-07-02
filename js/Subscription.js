import axios from "axios"
import cogoToast from "cogo-toast";
const vapidPublicKey = "BKTbHPoxBADK46purpWUaDhWXIuoofRGTgxcgqVPC2XNfok1N6hCr99c0G7dwvh-Bz18ze0Fa7w_ayvQaVzDR6c";

function subscribePush(googleId) {
  return new Promise((resolve, reject)=>{
      if(!navigator?.serviceWorker){
          reject("No service worker in navigator");
      }
      
      navigator.serviceWorker.ready.then(registration => {
      if (!registration.pushManager) {
        cogoToast.warn("Push Unsupported")
        reject("Push Unsupported");
      }

      
      registration.pushManager.getSubscription()
        .then((subscription)=>{
            if(!subscription){
              console.log("Subscribing");
              registration.pushManager.subscribe({
                userVisibleOnly: true, //Always display notifications
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
              })
              .then((subscription) => {
                axios.post("/scheduling/webPush/register", {subscription, googleId})
                resolve(true)
              } )
              .catch(err => {
                console.error("Push subscription error: ", err)
                reject('Push subscription error');
              })
            }else{
              console.log("Subscription exists", subscription)
              resolve(true);
            }

        })
    })
  });
}

function askPermission() {
  return new Promise(function(resolve, reject) {
    Notification.requestPermission()
    .then((result) => {
      console.log("result",result);
      if (result != 'granted') {
        console.log("reject");
        reject(result)
      }else{
        console.log("grant");
        resolve(result);
      }
      
    });
  })
}

function listenServiceWorkerMessages(setNotificationsRefetch) {
  const serviceWorker = navigator.serviceWorker;
  let handler = (event) => {
      if (event.data) {
          // The data payload got from nodejs
          console.log("event.data", event.data)
          if(setNotificationsRefetch){
            setNotificationsRefetch(true)
          }
          
      }
  };

  serviceWorker.addEventListener('message', handler);
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
            .then(() => axios.post("/scheduling/webPush/unregister", subscription))
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
    askPermission,
    listenServiceWorkerMessages,
    unsubscribePush,
    

};