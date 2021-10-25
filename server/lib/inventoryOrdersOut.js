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

router.post('/getAllOrdersOut', async (req,res) => {

    const sql = ' SELECT o.*, date_format(o.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
                ' FROM inv__orders_out o ' +
                ' ORDER BY o.id ASC ';

    try{
        const results = await database.query(sql, []);
        logger.info("Got OrdersOut ");
        res.json(results);

    }
    catch(error){
        logger.error("OrdersOut getAllOrdersOut " + error);
        res.sendStatus(400);
    }
});

router.post('/searchAllOrdersOut', async (req,res) => {

    var search_query, table;
    if(req.body){
        if(req.body.search_query != null){
            search_query = "%" + req.body.search_query + "%";
        }else{
            search_query = "%";
        }

        if(req.body.table != null){
            table = req.body.table;
        }else{
            return;
        }
        
    }    

    const sql = ' SELECT s.*, date_format(s.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
                ' FROM inv__orders_out s ' +
                ' WHERE ?? like ? ORDER BY s.id ASC ';

    try{
        const results = await database.query(sql, [table, search_query]);
        logger.info("Got OrdersOut by search", [table, search_query]);
        res.json(results);

    }
    catch(error){
        logger.error("Search OrdersOut: " + error);
        res.sendStatus(400);
    }
});


router.post('/superSearchAllOrdersOut', async (req,res) => {

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

    var sql = ' SELECT s.*, date_format(s.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
    ' FROM inv__orders_out s ' +
        ' WHERE CONCAT(';
    tables.forEach((table,i)=> {

        sql += `IFNULL(${table}, ''), \' \'${i === tables.length -1 ? '' : ', '}`
    })
    sql+=    ') LIKE ? ' ;

    logger.info("SQL", [sql])
    try{
        const results = await database.query(sql, [ search_query]);
        logger.info("Got OrdersOut by super search", [tables, search_query]);
        res.json(results);
    }
    catch(error){
        logger.error("superSearchAllOrdersOut : " + error);
        res.sendStatus(400);
    }
});

router.post('/getOrderOutById', async (req,res) => {
    var id ;
    if(req.body){
        id = req.body.id;
    }
    logger.info("ID", id);

    const sql = ' SELECT s.*, date_format(s.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
                ' FROM inv__orders_out s ' +
                ' WHERE s.id = ? ' +
                ' limit 1 ';

    try{
        const results = await database.query(sql, [id]);
        logger.info("Got OrderOut id:"+id);
        res.json(results);
    }
    catch(error){
        logger.error("OrderOut id: " + id + " , " + error);
        res.sendStatus(400);
    }
});



router.post('/addNewOrderOut', async (req,res) => {

    var orderOut ;
    if(req.body){
        if(req.body.orderOut != null){
            orderOut = req.body.orderOut;
        }  
    }
    const sql = ' INSERT INTO inv__orders_out (description, notes, date_updated, made_by, requested_by ) ' +
                ' VALUES (?,?,?,?,?) ';

    try{
        const results = await database.query(sql, [orderOut.description, orderOut.notes,
             Util.convertISODateTimeToMySqlDateTime(orderOut.date_updated), orderOut.made_by, orderOut.requested_by ]);
        logger.info("Inventory OrderOut added ", [orderOut]);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to addNewOrderOut: " + error);
        res.sendStatus(400);
    }
});

router.post('/updateOrderOut', async (req,res) => {

    var orderOut ;
    if(req.body){
        if(req.body.orderOut != null){
            orderOut = req.body.orderOut;
        }  
    }
    logger.info('orderOut to update', [orderOut]);
    const sql = ' UPDATE inv__orders_out SET description=?, ' +
        ' notes=?, made_by=?, requested_by=?, ' +
        ' date_updated=? ' +
        ' WHERE id = ? ';
    

    try{
        logger.info("Date updated", [Util.convertISODateTimeToMySqlDateTime(orderOut.date_updated)])
        const results = await database.query(sql, [orderOut.description,  orderOut.notes, orderOut.made_by, orderOut.requested_by,
             Util.convertISODateTimeToMySqlDateTime(moment()), orderOut.id ]);
        logger.info("Inventory OrderOut updated " + orderOut.id);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to updateOrderOut: " + error);
        res.sendStatus(400);
    }
});



router.post('/deleteOrderOut', async (req,res) => {
    var id, user;

    if(req.body){
        id = req.body.id;
        user = req.body.user;
    }
    if(!id){
        logger.error("Bad id param in deleteOrderOut");
        res.sendStatus(400);
    }
    if(user && !checkPermission(user.permissions, 'inventory') && !user.isAdmin){
        logger.error("Bad permission", [user]);
        res.sendStatus(400);
        return;
    }

    const sql = ' DELETE FROM inv__orders_out WHERE id = ? LIMIT 1 ';

    try{
        const results = await database.query(sql, [id]);

        logger.info("Deleted OrderOut " + id);
        res.json(results);

    }
    catch(error){
        logger.error("InventoryOrdersOut deleteOrderOut " + error);
        res.sendStatus(400);
    }
});


router.post('/getOrderOutItems', async (req,res) => {
    var order_id ;
    if(req.body){
        order_id = req.body.order_id;
    }

    const sql = ' SELECT oi.*, date_format(p.date_updated, \'%Y-%m-%d %H:%i:%S\') as part_date_updated, date_format(oi.date_entered, \'%Y-%m-%d %H:%i:%S\') as oi_date_entered, ' +
                ' p.description, p.inv_qty, p.cost_each AS est_cost_each, p.storage_location, p.notes, p.part_type, p.reel_width, ' +
                ' pm.mf_part_number, pm.url, pm.notes AS man_notes, pm.default_man, pt.type, ' +
                ' pmm.name AS man_name ' +
                ' FROM inv__orders_out_items oi ' +
                ' LEFT JOIN inv__parts p ON p.rainey_id = oi.rainey_id ' +
                ' LEFT JOIN inv__parts_manufacturing pm ON pm.rainey_id = oi.rainey_id AND pm.id = ' +
                   '(SELECT pm2.id FROM inv__parts_manufacturing pm2 WHERE IF(oi.part_mf_id IS NULL, pm2.default_man = 1, pm.id = oi.part_mf_id) LIMIT 1)  ' +
                ' LEFT JOIN inv__manufacturers pmm ON pmm.id = pm.manufacturer ' +
                ' LEFT JOIN inv__parts_types pt ON pt.id = p.part_type ' +
                ' WHERE oi.order_id = ? ' + 
                ' ORDER BY oi.id ASC ' ;

    try{
        const results = await database.query(sql, [order_id]);
        logger.info("Got OrderOut Man Items from orderOut id:"+order_id);
        res.json(results);
    }
    catch(error){
        logger.error("getOrderOutManItems w/ OrderOut id: " + id + " , " + error);
        res.sendStatus(400);
    }
});


router.post('/updateOrderOutItem', async (req,res) => {

    var item ;
    if(req.body){
        if(req.body.item != null){
            item = req.body.item;
        }  
    }
    logger.info('item to update', [item]);
    const sql = ' UPDATE inv__orders_out_items SET rainey_id=?, order_id=?, qty_in_order=?, part_mf_id=?, actual_cost_each=? ' +
        ' WHERE id = ? ';

    try{
        const results = await database.query(sql, [item.rainey_id, item.order_id, item.qty_in_order, item.part_mf_id, item.actual_cost_each,
                  item.id ]);
        logger.info("Inventory OrderOut  Item updated " + item.rainey_id);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to updateOrderOutItem: " + error);
        res.sendStatus(400);
    }
});

router.post('/updateMultipleOrderOutItems', async (req,res) => {

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
                logger.error("Inventory OrderOut (updateMultipleOrderOutItems): " + err);
                res.sendStatus(400);
            }else{
                logger.info("Inventory OrderOut  Item updated " + item.order_id);
                res.sendStatus(200);
            }
        })
});


router.post('/deleteOrderOutItem', async (req,res) => {
    var id;

    if(req.body){
        id = req.body.id;
    }
    if(!id){
        logger.error("Bad id param in deleteOrderOutItem");
        res.sendStatus(400);
    }

    const sql = ' DELETE FROM inv__orders_out_items WHERE id = ? LIMIT 1 ';

    try{
        const results = await database.query(sql, [id]);

        logger.info("Deleted OrderOut Item " + id);
        res.json(results);

    }
    catch(error){
        logger.error("Inventory deleteOrderOutItem " + error);
        res.sendStatus(400);
    }
});

router.post('/addNewOrderOutItem', async (req,res) => {

    var orderOut_item ;
    if(req.body){
        if(req.body.orderOut_item != null){
            orderOut_item = req.body.orderOut_item;
        }  
    }
    const sql = ' INSERT INTO inv__orders_out_items (order_id, rainey_id, qty_in_order, ' + 
                ' date_entered, part_mf_id, actual_cost_each) ' +
                ' VALUES ( ?, ?, IFNULL(?, DEFAULT(qty_in_order)), IFNULL(?, NOW()), IFNULL(?, DEFAULT(part_mf_id)), IFNULL( ?, DEFAULT(actual_cost_each))) ';

    try{
        const results = await database.query(sql, [ orderOut_item.order_id, orderOut_item.rainey_id, orderOut_item.qty_in_order,
             Util.convertISODateTimeToMySqlDateTime(moment()), orderOut_item.part_mf_id, orderOut_item.actual_cost_each ]);
        logger.info("Inventory OrderOut  Item added ", [orderOut_item]);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to addNewOrderOutItem: " + error);
        res.sendStatus(400);
    }
});


router.post('/addNewMultpleOrderOutItem', async (req,res) => {

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
            logger.error("Inventory OrderOut (addNewMultpleOrderOutItem): " + err);
            res.sendStatus(400);
        }else{
            logger.info("Inventory OrderOut Multiple  Item added ", [item]);
            res.sendStatus(200);
        }
    })
});


router.post('/getOrderOutApprovers', async (req,res) => {
    var order_id ;
    if(req.body){
        order_id = req.body.order_id;
    }

    const sql = ' SELECT oa.*, gu.email, gu.displayName, date_format(oa.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' +
                ' FROM inv__orders_out_approvers oa ' +
                ' LEFT JOIN google_users gu ON oa.googleId = gu.googleId ' +
                ' WHERE oa.order_id = ? ' + 
                ' ORDER BY oa.tier ASC ' ;

    try{
        const results = await database.query(sql, [order_id]);
        logger.info("Got OrderOut Approvers from orderOut id:"+order_id);
        res.json(results);
    }
    catch(error){
        logger.error("getOrderOutApprovers w/ OrderOut id: " + order_id + " , " + error);
        res.sendStatus(400);
    }
});


router.post('/updateOrderOutApprover', async (req,res) => {

    var item,nav_item ;
    if(req.body){
        if(req.body.item != null){
            item = req.body.item;
            nav_item = req.body.nav_item;
        }  
    }
    logger.info('item to update', [item]);
    const sql = ' UPDATE inv__orders_out_approvers SET status=?  ' +
        ' WHERE id = ? ';

    try{
        const return_object = {};
        const results = await database.query(sql, [item.status, 
                  item.id ]);
        logger.info("Inventory OrderOut  Approver updated " + item.googleId);

        //Update notifications tied to 
        const not_sql = " UPDATE user_notifications SET requires_action = 0 WHERE googleId = ? AND detail_id = ?";
        const not_results = await database.query(not_sql, [item.googleId, 
            item.order_id ]);

        if(item.status == 2){ // rejected
            //get maker
            const maker_sql = ' SELECT * FROM inv__orders_out oo WHERE id = ? LIMIT 1 '
            const maker_results = await database.query(maker_sql, [item.order_id ]);
            let order = maker_results[0];
            if(order){
                //send notification to maker
                const reject_results = await notificationSystem.sendNotification(order.made_by, nav_item.type,
                    "Inventory Order Out is has been rejected.", nav_item.page, nav_item.current_view, nav_item.sub_current_view, nav_item.detail_id);

                pushSystem.getUserSubscriptions(order.made_by)
                .then((data)=>{
                    if(data && data.length > 0){
                        data.forEach((sub) => pushSystem.sendPushNotification(JSON.parse(sub.subscription), "Inventory Order Out is has been rejected."))
                    }
                })
                .catch((error)=>{
                    logger.error("Failure in sending push notifications: " + error);
                })
            }else{
                throw "Bad order from maker_results in rejection notification";
            }
            
        }else{
            if(item.status == 1){ //approved
                const sql_check = ' SELECT * FROM inv__orders_out_approvers oa WHERE order_id = ? ';
                const check_results = await database.query(sql_check, [item.order_id, item.tier ]);

                let flagged_items = check_results.filter((result)=>{
                    return item.tier >= result.tier && (result.status == 0 || result.status == 2 )
                })  

                let next_tier_items = check_results.filter((result)=>{
                    return item.tier < result.tier && result.status == 0
                })

                return_object.flagged_items = flagged_items;
                return_object.next_tier_items = next_tier_items;

                if(flagged_items.length == 0 && next_tier_items.length > 0){
                    //send notification to next tier 
                    async.forEachOf(next_tier_items, async (nt_item, i, callback) => {

                        //will automatically call callback after successful execution
                        const note_results = await notificationSystem.sendNotification(nt_item.googleId, nav_item.type,
                            "Inventory Order Out is waiting for your approval.", nav_item.page, nav_item.current_view, nav_item.sub_current_view, nav_item.detail_id);

                        pushSystem.getUserSubscriptions(nt_item.googleId)
                        .then((data)=>{
                            if(data && data.length > 0){
                                data.forEach((sub) => pushSystem.sendPushNotification(JSON.parse(sub.subscription), "Inventory Order Out is waiting for your approval."))
                            }
                            return;
                        })
                        .catch((error)=>{
                            logger.error("Failure in sending push notifications: " + error);
                            return;
                        })
                        

                    }, err=> {
                        if(err){
                            logger.error("Failed to send notification(s): " + err);
                            throw err;
                        }else{
                            logger.info("Notification sent " + next_tier_items);
                        }
                    })
                }
                if(flagged_items.length == 0 && next_tier_items.length == 0){
                    //notify maker that the order is approved
                    //get maker
                    var maker_sql = ' SELECT * FROM inv__orders_out oo WHERE id = ? LIMIT 1 '
                    var maker_results = await database.query(maker_sql, [item.order_id ]);
                    let order = maker_results[0];
                    if(order){
                        //send notification to maker
                        var reject_results = await notificationSystem.sendNotification(order.made_by, nav_item.type,
                            "Inventory Order Out is has been approved.", nav_item.page, nav_item.current_view, nav_item.sub_current_view, nav_item.detail_id);
                        pushSystem.getUserSubscriptions(order.made_by)
                        .then((data)=>{
                            if(data && data.length > 0){
                                data.forEach((sub) => pushSystem.sendPushNotification(JSON.parse(sub.subscription), "Inventory Order Out is has been approved."))
                            }
                        })
                        .catch((error)=>{
                            throw error
                        })
                    }else{
                        throw "Bad order from maker_results in approve notification";
                    }
                }
                //else skip notifications

            }
        }

        return_object.results = results;
        res.json(return_object);
    }
    catch(error){
        logger.error("Failed to updateOrderOutApprover: " + error);
        res.sendStatus(400);
    }
});

router.post('/deleteOrderOutApprover', async (req,res) => {
    var id, user;

    if(req.body){
        id = req.body.id;
        user = req.body.user;
    }
    if(!id){
        logger.error("Bad id param in deleteOrderOutApprover");
        res.sendStatus(400);
    }
    if(user && !checkPermission(user.permissions, 'inventory') && !user.isAdmin){
        logger.error("Bad permission", [user]);
        res.sendStatus(400);
        return;
    }

    const sql = ' DELETE FROM inv__orders_out_approvers WHERE id = ? LIMIT 1 ';

    try{
        const results = await database.query(sql, [id]);

        logger.info("Deleted OrderOut Approver " + id);
        res.json(results);

    }
    catch(error){
        logger.error("Inventory deleteOrderOutApprover " + error);
        res.sendStatus(400);
    }
});


router.post('/addNewOrderOutApprover', async (req,res) => {

    var orderOut_item, nav_item ;
    if(req.body){
        if(req.body.orderOut_item != null){
            orderOut_item = req.body.orderOut_item;
            nav_item =req.body.nav_item;
        }  
    }
    const sql = ' INSERT INTO inv__orders_out_approvers (order_id, status, googleId, tier,  ' + 
                ' date_entered) ' +
                ' VALUES ( ?, IFNULL(?,DEFAULT(status)),?,?, IFNULL(?, NOW()) ) ';

    try{
        var return_object = {}
        const results = await database.query(sql, [ orderOut_item.order_id,  orderOut_item.status, orderOut_item.googleId, 
             orderOut_item.tier, Util.convertISODateTimeToMySqlDateTime(moment()) ]);

        //send notification if appropriate
        if(results && orderOut_item.googleId){

            const sql_check = ' SELECT * FROM inv__orders_out_approvers oa WHERE order_id = ? ';
            const check_results = await database.query(sql_check, [orderOut_item.order_id, orderOut_item.tier ]);

            let flagged_items = check_results.filter((result)=>{
                return orderOut_item.tier > result.tier && (result.status == 0 || result.status == 2 )
            })  

            return_object.flagged_items = flagged_items;

            if(flagged_items.length == 0){
                //send notification to next tier 
                const note_results = await notificationSystem.sendNotification(orderOut_item.googleId, nav_item.type,
                  "Inventory Order Out is waiting for your approval.", nav_item.page, nav_item.current_view, nav_item.sub_current_view, nav_item.detail_id, 1);
                
                pushSystem.getUserSubscriptions(orderOut_item.googleId)
                .then((data)=>{
                    if(data && data.length > 0){
                        data.forEach((sub) => pushSystem.sendPushNotification(JSON.parse(sub.subscription), "Inventory Order Out is waiting for your approval."))
                    }
                })
                .catch((error)=>{
                    throw error
                })
                
            }
        }
        logger.info("Inventory OrderOut  Approver added ", [orderOut_item]);
        return_object.results = results;
        res.json(return_object);
    }
    catch(error){
        logger.error("Failed to addNewOrderOutApprover: " + error);
        res.sendStatus(400);
    }
});



module.exports = router;