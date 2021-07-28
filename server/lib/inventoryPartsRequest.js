const express = require('express');
const router = express.Router();
var async = require("async");
const _ = require("lodash");
const moment = require("moment")

const logger = require('../../logs');

const Util = require('../../js/Util');
//Handle Database
const database = require('./db');
const notificationSystem = require('./notifications');
const pushSystem = require('./webPush');

router.post('/getAllPartsRequestItems', async (req,res) => {

    //check if admin
    //if admin - get all 
    //else get items only where user == requested_by

    const sql = 
    ' SELECT * FROM ' +
        ' ( SELECT k.rainey_id, k.status, k.work_order_name, k.requested_by, g.displayName AS requested_by_name, k.notes, ik.description, ' + 
        ' k.qty , \'kit\' AS item_type, stk.type AS status_type, date_format(k.date_updated, \'%Y-%m-%d %H:%i:%S\') as date_updated, ' + 
        ' date_format(k.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
        ' FROM inv__request_kits k ' +
        ' LEFT JOIN inv__kits ik ON ik.rainey_id = k.rainey_id ' + 
        ' LEFT JOIN inv__request_status_types stk ON stk.id = k.status ' +
        ' LEFT JOIN google_users g ON g.id = k.requested_by ' +
        ' UNION ' + 
        ' SELECT p.rainey_id, p.status, p.work_order_name, p.requested_by, g.displayName AS requested_by_name, p.notes, ip.description, ' + 
        ' p.qty , \'part\' AS item_type, stp.type AS status_type, date_format(p.date_updated, \'%Y-%m-%d %H:%i:%S\') as date_updated, ' + 
        ' date_format(p.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
        ' FROM inv__request_parts p ' +
        ' LEFT JOIN inv__parts ip ON ip.rainey_id = p.rainey_id ' + 
        ' LEFT JOIN inv__request_status_types stp ON stp.id = p.status ' +
        ' LEFT JOIN google_users g ON g.id = p.requested_by  ) all_items ' +
    ' ORDER BY date_entered ASC ';

    try{
        const results = await database.query(sql, []);
        logger.info("Got PartsRequest items ");
        res.json(results);

    }
    catch(error){
        logger.error("PartsRequest getAllPartsRequestItems " + error);
        res.sendStatus(400);
    }
});



router.post('/superSearchAllRequestedItems', async (req,res) => {

    var search_query, tables;
    if(req.body){
        if(req.body.search_query != null){
            search_query = "%" + req.body.search_query + "%";
        }else{
            search_query = "%";
        }

        if(req.body.tables != null){
            tables = req.body.tables;
        }else{
            return;
        }
        
    }    

    var sql = ' SELECT  p.*, \'part\' AS item_type, stp.type AS status_type, date_format(p.date_updated, \'%Y-%m-%d %H:%i:%S\') as date_updated, date_format(p.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered  ' +
    ' FROM inv__request_parts p ' + 
    ' LEFT JOIN inv__request_status_types stp ON stp.id = p.status ' +
        ' WHERE CONCAT(';
    let part_tables = tables.filter((item)=> item.table == "parts");
    part_tables.forEach((table,i)=> {
        
        sql += `IFNULL(${table.value}, ''), \' \'${i === part_tables.length -1 ? '' : ', '}`
        
    })
    sql+=    ') LIKE ? ' + 
    ' UNION SELECT SELECT k.*, \'kit\' AS item_type, stk.type AS status_type, date_format(k.date_updated, \'%Y-%m-%d %H:%i:%S\') as date_updated, date_format(k.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
    ' FROM inv__request_kits k  LEFT JOIN inv__request_status_types stk ON stk.id = k.status ' +
        ' WHERE CONCAT(';
    let kit_tables = tables.filter((item)=> item.table == "kits");
    kit_tables.forEach((table,i)=> {

        sql += `IFNULL(${table.value}, ''), \' \'${i === kit_tables.length -1 ? '' : ', '}`
    })
    sql+=    ') LIKE ? ' ; 

    logger.info("SQL", [sql])
    try{
        const results = await database.query(sql, [ search_query,search_query]);
        logger.info("Got Parts by super search", [tables, search_query]);
        res.json(results);
    }
    catch(error){
        logger.error("superSearchAllParts : " + error);
        res.sendStatus(400);
    }
});


router.post('/updatePartsRequestItem', async (req,res) => {

    var item ;
    if(req.body){
        if(req.body.item != null){
            item = req.body.item;
        }  
    }
    logger.info('item to update', [item]);
    const sql_for_part = 'UPDATE inv__request_parts SET rainey_id=?,work_order_name=?, notes=?,qty=?,date_updated=? ' +
    ' WHERE id = ?';
    const sql_for_kit = ' UPDATE inv__request_kits SET rainey_id=?, work_order_name=?, notes=?,qty=?,date_updated=? ' +
        ' WHERE id = ? ';

    var sql = item.item_type === "kit" ? sql_for_kit : sql_for_part;

    try{
        const results = await database.query(sql, [item.rainey_id, item.work_order_name, item.notes, item.qty, Util.convertISODateTimeToMySqlDateTime(new Date())  ]);
        logger.info("Inventory PartsRequest  Item updated " + item.rainey_id);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to updatePartsRequestItem: " + error);
        res.sendStatus(400);
    }
});

router.post('/updatePartsRequestItemStatus', async (req,res) => {

    var item ;
    if(req.body){
        if(req.body.item != null){
            item = req.body.item;
        }  
    }
    logger.info('item to update', [item]);
    const sql_for_part = 'UPDATE inv__request_parts SET status=?,date_updated=? ' +
    ' WHERE id = ?';
    const sql_for_kit = ' UPDATE inv__request_kits SET status=?,date_updated=? ' +
        ' WHERE id = ? ';

    var sql = item.item_type === "kit" ? sql_for_kit : sql_for_part;

    try{
        const results = await database.query(sql, [ item.status, Util.convertISODateTimeToMySqlDateTime(new Date())  ]);
        logger.info("Inventory PartsRequest  Item Status updated " + item.rainey_id);

        if(item.status == 3) {
            const maker_sql = ' SELECT * FROM google_users WHERE id = ? LIMIT 1 '
            const maker_results = await database.query(maker_sql, [item.requested_by ]);
            let order = maker_results[0];
            if(order.googleId){
                //send notification to maker
                const reject_results = await notificationSystem.sendNotification(order.googleId, "requestedInvPart",
                `Item (${pr_item.rainey_id}) request has been denied.`, '/inventory', 'invPartRequest', 'partsRequestItemsList', item.id);

                pushSystem.getUserSubscriptions(order.googleId)
                .then((data)=>{
                    if(data && data.length > 0){
                        data.forEach((sub) => pushSystem.sendPushNotification(JSON.parse(sub.subscription), "Inventory Request is has been denied."))
                    }
                })
                .catch((error)=>{
                    logger.error("Failure in sending push notifications: " + error);
                })
            }else{
                throw "Bad order from maker_results in deny notification";
            }
        }
        
        res.json(results);
    }
    catch(error){
        logger.error("Failed to updatePartsRequestItemStatus: " + error);
        res.sendStatus(400);
    }
});

router.post('/updateMultiplePartsRequestItems', async (req,res) => {

    var item ;
    if(req.body){
        if(req.body.item != null){
            item = req.body.item;
        }  
    }
    logger.info('item to update', [item]);
    const sql = ' UPDATE inv__orders_out_items SET rainey_id=?, order_id=?, qty_in_order=?, part_mf_id=?, actual_cost_each=? ' +
        ' WHERE id = ? ';
        

    async.forEachOf(item.kit_items, async (kit_item, i, callback) => {
            //will automatically call callback after successful execution
            try{
                const results = await database.query(sql, [kit_item.rainey_id, item.order_id, kit_item.qty_in_order, kit_item.part_mf_id, kit_item.actual_cost_each,
                    kit_item.id ]);
                return;
            }
            catch(error){     
                //callback(error);         
                throw error;                 
            }
        }, err=> {
            if(err){
                logger.error("Inventory PartsRequest (updateMultiplePartsRequestItems): " + err);
                res.sendStatus(400);
            }else{
                logger.info("Inventory PartsRequest  Item updated " + item.order_id);
                res.sendStatus(200);
            }
        })
});


router.post('/deletePartsRequestItem', async (req,res) => {
    var id;

    if(req.body){
        id = req.body.id;
    }
    if(!id){
        logger.error("Bad id param in deletePartsRequestItem");
        res.sendStatus(400);
    }
    const sql_for_part = ' DELETE FROM inv__request_parts WHERE id = ? LIMIT 1 ';
    const sql_for_kit = ' DELETE FROM inv__request_kits WHERE id = ? LIMIT 1 ';

    var sql = item.item_type === "kit" ? sql_for_kit : sql_for_part;

    try{
        const results = await database.query(sql, [id]);

        logger.info("Deleted PartsRequest Item " + id);
        res.json(results);

    }
    catch(error){
        logger.error("Inventory deletePartsRequestItem " + error);
        res.sendStatus(400);
    }
});

router.post('/addNewPartsRequestItem', async (req,res) => {

    var pr_item, user ;
    if(req.body){
        if(req.body.pr_item != null){
            pr_item = req.body.pr_item;
            user = req.body.user;
        }  
    }
    if(!user){
        logger.error("Bad user", [user]);
        res.sendStatus(400);
        return;
    }

    const sql_for_part = ' INSERT INTO inv__request_parts ( rainey_id, work_order_name, requested_by, notes, qty ) ' +
    ' VALUES ( ?, IFNULL(?, DEFAULT(work_order_name)), ?, IFNULL(?, DEFAULT(notes)), IFNULL(?, DEFAULT(qty)))';
    const sql_for_kit = ' INSERT INTO inv__request_kits ( rainey_id, work_order_name, requested_by, notes, qty ) ' +
    ' VALUES ( ?, IFNULL(?, DEFAULT(work_order_name)), ?, IFNULL(?, DEFAULT(notes)), IFNULL(?, DEFAULT(qty))) ';

    var sql = pr_item.item_type === "kit" ? sql_for_kit : sql_for_part;

    try{
        const results = await database.query(sql, [ pr_item.rainey_id, pr_item.work_order_name, user.id, pr_item.notes, pr_item.qty ]);
        logger.info("Inventory PartsRequest  Item added ", [pr_item]);


        //send notification to all subscribed to add part request alerts
        const subscribed_users_sql = " SELECT ns.*, nss.name FROM user_notifications_settings ns " +
                    " LEFT JOIN user_notifications_settings_settings nss ON nss.id = ns.setting " + 
                    " WHERE nss.name = 'Part Request Inventory Alert'  "
        const subscribed_users = await database.query(subscribed_users_sql, [ ]);

        async.forEachOf(subscribed_users, async (user, i, callback) => {
            
            if(user.notify){
                //will automatically call callback after successful execution
                const note_results = await notificationSystem.sendNotification(user.googleId, "requestedInvPart",
                `Item (${pr_item.rainey_id}) has been requested.`, '/inventory', 'invPartRequest', 'partsRequestItemsList', results.insertId);
            }
            

            if(user.push){
                pushSystem.getUserSubscriptions(user.googleId)
                .then((data)=>{
                    if(data && data.length > 0){
                        data.forEach((sub) => pushSystem.sendPushNotification(JSON.parse(sub.subscription),  `Item (${pr_item.rainey_id}) has been requested.`))
                    }
                    return;
                })
                .catch((error)=>{
                    logger.error("Failure in sending push notifications: " + error);
                    return;
                })
            }
            
            

        }, err=> {
            if(err){
                logger.error("Failed to send notification(s): " + err);
                //throw err;
            }else{
                logger.info("Notification sent " + subscribed_users);
            }
        })

        res.json(results);
    }
    catch(error){
        logger.error("Failed to addNewPartsRequestItem: " + error);
        res.sendStatus(400);
    }
});


router.post('/addNewMultplePartsRequestItem', async (req,res) => {

    var item ;
    if(req.body){
        if(req.body.item != null){
            item = req.body.item;
        }  
    }
    const sql = ' INSERT INTO inv__orders_out_items (order_id, rainey_id, qty_in_order, ' + 
                ' date_entered, part_mf_id, actual_cost_each) ' +
                ' VALUES ( ?, ?, IFNULL(?, DEFAULT(qty_in_order)), IFNULL(?, NOW()), IFNULL(?, DEFAULT(part_mf_id)), IFNULL( ?, DEFAULT(actual_cost_each))) ';

    async.forEachOf(item.kit_items, async (kit_item, i, callback) => {
        //will automatically call callback after successful execution
        try{
            const results = await database.query(sql, [ item.order_id, kit_item.rainey_id, kit_item.qty_in_order,
             Util.convertISODateTimeToMySqlDateTime(moment()), kit_item.part_mf_id, kit_item.actual_cost_each  ]);
            return;
        }
        catch(error){     
            //callback(error);         
            throw error;                 
        }
    }, err=> {
        if(err){
            logger.error("Inventory PartsRequest (addNewMultplePartsRequestItem): " + err);
            res.sendStatus(400);
        }else{
            logger.info("Inventory PartsRequest Multiple  Item added ", [item]);
            res.sendStatus(200);
        }
    })
});



module.exports = router;