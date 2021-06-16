const router = require("express").Router()
const webpush = require("web-push");
const logger = require('../../logs');
//Handle Database
const database = require('./db');

var pushSystem = {router}



webpush.setGCMAPIKey(process.env.GOOGLE_API_KEY)
webpush.setVapidDetails(
  "mailto:bnewey@raineyelectronics.com",
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
)

pushSystem.getUserSubscriptions = async function(googleId){
    const sql = ' SELECT * FROM push_subscriptions WHERE googleId = ? ';

    try{
      const results = await database.query(sql, [ googleId ]);
      logger.verbose("Got user subscriptions  :" + googleId  );
      if(results && results.length){
        return await results.json();
      }else{
        return [];
      }
       
    }
    catch(error){
      logger.error("Failed to get subscriptions error: " + error);
      throw error;
    }
}

pushSystem.sendPushNotification = function(subscription, data){
    var data_object = {
      title: "REI Icontrol",
      body: JSON.stringify(data),
      icon: "/static/rainey_elec.png"
    }
    // // sendNotification can only take a string as it's second parameter
    webpush.sendNotification(subscription, JSON.stringify(data_object))
}


  
  
  router.post("/register", async (req, res, next) => {
    let subscription = req.body
    console.log(subscription)
    // {
    //   endpoint: 'https://fcm.googleapis.com/fcm/send/dNdCVWnE0lw:APA91bHPOnOs7DS4BLo-39YDjMi_QvdXuXX5bUGuP2eNtxgi4T8yGdVAPlZHkzEZwaxOOltzLt1cZDbMAkOhs2y5r1oRLqII5hLUlvMd2Jm-BVW8qdZcHxluJ__6XtRwQZYHAO-K6DdM',
    //   expirationTime: null,
    //   keys: {
    //     p256dh: 'BOkT-vOeQnBIb5DPWa2ZgD-EFzTXQTI8J8slqD910gg2as-70Kama4YocOdyuMOfbIT2RF9U2oyiJuU8o5ltARI',
    //     auth: 'Hmhe8ra6WbXTl-DFU2dVeA'
    //   }
    // }

    //send subscription info to db
    const sql = ' INSERT INTO push_subscriptions ( googleId, subscription) VALUES (?, ?) ';


    try{
      const results = await database.query(sql, [googleId, JSON.stringify(subscription) ]);
      logger.verbose("Saved subscription for :" + googleId );
      res.sendStatus(200);
    }
    catch(error){
      logger.error("Failed to save subscription for: " + googleId + " error: " + error);
      res.sendStatus(400);
    }

    
  
  })
  
  router.delete("/unregister",  async (req, res, next) => {
    let subscription = req.body
    console.log(subscription)
    const sql = ' DELETE FROM  push_subscriptions WHERE subscription = ? ';


    try{
      const results = await database.query(sql, [ JSON.stringify(subscription) ]);
      logger.verbose("Deleted subscription  :" + subscription  );
      res.sendStatus(200);
    }
    catch(error){
      logger.error("Failed to delete subscription error: " + error);
      res.sendStatus(400);
    }
    
  })

  module.exports = pushSystem;