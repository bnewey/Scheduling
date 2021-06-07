const logger = require('../../logs');
const express = require('express');
const database = require('./db');
var async = require("async");
const router = express.Router();
const moment = require("moment")

var notificationSystem = {router: router};

notificationSystem.sendNotification = function(user_id, type,body, page, current_view, sub_current_view, detail_id) {
    return new Promise( async (resolve,reject) => {
        const sql = ' INSERT INTO user_notifications (googleId, type, body, page, current_view,sub_current_view, detail_id) VALUES (?, IFNULL(?,DEFAULT(type)) ,?, IFNULL(?,DEFAULT(page)) , ' +
        ' IFNULL(?,DEFAULT(current_view)),IFNULL(?,DEFAULT(sub_current_view)), IFNULL(?,DEFAULT(detail_id)) ) ' ;


            try{
                const results = await database.query(sql, [user_id, type, body, page, current_view, sub_current_view, detail_id]);
                logger.info("Inserted notification :"+ user_id);
                resolve(results);
            }
            catch(error){
                logger.error("sendNotification for user id: " + user_id + " , " + error);
                reject(error);
            }
    })
}


router.post('/getNotificationsForUser', async (req,res) => {

    var id ;
    if(req.body){
        id = req.body.id;
    }

    const sql = ' SELECT un.*, date_format(un.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
                ' FROM user_notifications un ' +
                ' WHERE un.googleId = ? ' +
                ' ORDER BY un.id DESC ';

    try{
        const results = await database.query(sql, [id]);
        logger.info("Got Notifications for user: " + id);
        res.json(results);

    }
    catch(error){
        logger.error("Notifications getNotificationsForUser " + error);
        res.sendStatus(400);
    }
});


router.post('/updateNotificationsViewed', async (req,res) => {

    var items ;
    if(req.body){
        if(req.body.items != null){
            items = req.body.items;
        }  
    }
    const sql = ' UPDATE user_notifications SET viewed = ?  ' +
        ' WHERE id = ? ';


    async.forEachOf(items, async (item, i, callback) => {

        //will automatically call callback after successful execution
        try{
            const results = await database.query(sql, [item.viewed,   item.id ]);
            return;
        }
        catch(error){
            throw error;  
        }
    }, err=> {
        if(err){
            logger.error("Failed to updateNotificationsViewed: " + err);
    res.sendStatus(400);
        }else{
            logger.info("Notification viewed " + items);
            res.sendStatus(200);
        }
    })
});


module.exports = notificationSystem;