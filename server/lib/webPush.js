const router = require("express").Router()
module.exports = router
const webpush = require("web-push")

webpush.setGCMAPIKey(process.env.GOOGLE_API_KEY)
webpush.setVapidDetails(
  "mailto:bnewey@raineyelectronics.com",
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
)

const testData = {
    title: "Testing",
    body: "It's a success!",
    icon: "/static/rainey_elec.png"
  }
  
  let subscription
  let pushIntervalID
  
  router.post("/register", (req, res, next) => {
    subscription = req.body
    console.log(subscription)
    
    pushIntervalID = setInterval(() => {
      console.log("Send notification");
      // sendNotification can only take a string as it's second parameter
      webpush.sendNotification(subscription, JSON.stringify(testData))
        .catch(() => { console.log("Failed to send"); return clearInterval(pushIntervalID)})
    }, 30000)
    res.sendStatus(201)
  })
  
  router.delete("/unregister", (req, res, next) => {
    subscription = null
    clearInterval(pushIntervalID)
    res.sendStatus(200)
  })