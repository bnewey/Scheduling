const express = require('express');
const router = express.Router();
var async = require("async");
const _ = require("lodash");
const moment = require("moment")

const logger = require('../../logs');

const Util = require('../../js/Util');
//Handle Database
const database = require('./db');


router.post('/getAllSets', async (req,res) => {

    const sql = ' SELECT s.*, date_format(s.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
                ' FROM inv__sets s ' +
                ' ORDER BY s.rainey_id ASC ';

    try{
        const results = await database.query(sql, []);
        logger.info("Got Sets ");
        res.json(results);

    }
    catch(error){
        logger.error("Sets getAllSets " + error);
        res.sendStatus(400);
    }
});

router.post('/searchAllSets', async (req,res) => {

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
                ' FROM inv__sets s ' +
                ' WHERE ?? like ? ORDER BY s.rainey_id ASC ';

    try{
        const results = await database.query(sql, [table, search_query]);
        logger.info("Got Sets by search", [table, search_query]);
        res.json(results);

    }
    catch(error){
        logger.error("Search Sets: " + error);
        res.sendStatus(400);
    }
});


router.post('/superSearchAllSets', async (req,res) => {

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
    ' FROM inv__sets s ' +
        ' WHERE CONCAT(';
    tables.forEach((table,i)=> {

        sql += `IFNULL(${table}, ''), \' \'${i === tables.length -1 ? '' : ', '}`
    })
    sql+=    ') LIKE ? ' ;

    logger.info("SQL", [sql])
    try{
        const results = await database.query(sql, [ search_query]);
        logger.info("Got Sets by super search", [tables, search_query]);
        res.json(results);
    }
    catch(error){
        logger.error("superSearchAllSets : " + error);
        res.sendStatus(400);
    }
});

router.post('/getSetById', async (req,res) => {
    var rainey_id ;
    if(req.body){
        rainey_id = req.body.rainey_id;
    }

    const sql = ' SELECT s.*, date_format(s.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
                ' FROM inv__sets s ' +
                ' WHERE s.rainey_id = ? ' +
                ' limit 1 ';

    try{
        const results = await database.query(sql, [rainey_id]);
        logger.info("Got Set id:"+rainey_id);
        res.json(results);
    }
    catch(error){
        logger.error("Set id: " + id + " , " + error);
        res.sendStatus(400);
    }
});



router.post('/addNewSet', async (req,res) => {

    var set ;
    if(req.body){
        if(req.body.set != null){
            set = req.body.set;
        }  
    }
    const sql = ' INSERT INTO inv__sets (description, inv_qty, min_inv, num_in_set, notes, date_updated, obsolete ) ' +
                ' VALUES (?,IFNULL(?, default(inv_qty)),IFNULL(?, default(min_inv)),IFNULL(?, default(num_in_set)),?,?,IFNULL(?, default(obsolete))) ';

    try{
        const results = await database.query(sql, [set.description, set.inv_qty, set.min_inv, set.num_in_set, set.notes,
             set.date_updated, set.obsolete ]);
        logger.info("Inventory Set added ", [set]);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to addNewSet: " + error);
        res.sendStatus(400);
    }
});

router.post('/updateSet', async (req,res) => {

    var set ;
    if(req.body){
        if(req.body.set != null){
            set = req.body.set;
        }  
    }
    logger.info('set to update', [set]);
    const sql = ' UPDATE inv__sets SET description=?, min_inv=?, num_in_set=?, ' +
        ' notes=?,  ' +
        ' date_updated=?, obsolete=? ' +
        ' WHERE rainey_id = ? ';
    

    try{
        logger.info("Date updated", [Util.convertISODateTimeToMySqlDateTime(set.date_updated)])
        const results = await database.query(sql, [set.description,set.min_inv, set.num_in_set,  set.notes,
             Util.convertISODateTimeToMySqlDateTime(moment()), set.obsolete, set.rainey_id ]);
        logger.info("Inventory Set updated " + set.rainey_id);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to updateSet: " + error);
        res.sendStatus(400);
    }
});

router.post('/updateSetInv', async (req,res) => {

    var set ;
    if(req.body){
        if(req.body.set != null){
            set = req.body.set;
        }  
    }
    logger.info('set to update', [set]);
    const sql = ' UPDATE inv__sets SET  inv_qty=?, date_updated=? ' +
        ' WHERE rainey_id = ?;  ' + 
        ' INSERT INTO inv__sets_transactions (rainey_id, type, new_value, old_value) ' +
        ' VALUES (?,?,?,?) ';
    

    try{
        //Check against min_inv and give notification 
        logger.info("Date updated", [Util.convertISODateTimeToMySqlDateTime(set.date_updated)])
        const results = await database.query(sql, [ set.inv_qty, Util.convertISODateTimeToMySqlDateTime(moment()), set.rainey_id, set.rainey_id,
                "inv_qty", set.inv_qty, set.old_inv_qty  ]);
        logger.info("Inventory INV_QTY updated " + set.rainey_id);

        //check against min_inv and get notification if going below
        if(set.inv_qty <= set.min_inv){
            //send notification to all subscribed to set min inv alerts
            const subscribed_users_sql = " SELECT ns.*, nss.name FROM user_notifications_settings ns " +
                        " LEFT JOIN user_notifications_settings_settings nss ON nss.id = ns.setting " + 
                        " WHERE nss.name = 'Set Minimum Inventory Alert'  "
            const subscribed_users = await database.query(subscribed_users_sql, [ ]);

            async.forEachOf(subscribed_users, async (user, i, callback) => {

                //will automatically call callback after successful execution
                const note_results = await notificationSystem.sendNotification(user.googleId, "minInvSet",
                    `Set (${set.rainey_id}) has reached minimum inventory.`, '/inventory', 'invSets', 'setsDetail', set.rainey_id);

                pushSystem.getUserSubscriptions(user.googleId)
                .then((data)=>{
                    if(data && data.length > 0){
                        data.forEach((sub) => pushSystem.sendPushNotification(JSON.parse(sub.subscription),  `Set (${set.rainey_id}) has reached minimum inventory.`))
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
                    //throw err;
                }else{
                    logger.info("Notification sent " + subscribed_users);
                }
            })
        }

        res.json(results);
    }
    catch(error){
        logger.error("Failed to updateSetInv: " + error);
        res.sendStatus(400);
    }
});


router.post('/deleteSet', async (req,res) => {
    var rainey_id;

    if(req.body){
        rainey_id = req.body.rainey_id;
    }
    if(!rainey_id){
        logger.error("Bad rainey_id param in deleteSet");
        res.sendStatus(400);
    }

    const sql = ' DELETE FROM inv__sets WHERE rainey_id = ? LIMIT 1 ';

    try{
        const results = await database.query(sql, [rainey_id]);

        logger.info("Deleted Set " + rainey_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities deleteEntityAddress " + error);
        res.sendStatus(400);
    }
});


router.post('/getSetItems', async (req,res) => {
    var rainey_id ;
    if(req.body){
        rainey_id = req.body.rainey_id;
    }

    const sql = ' SELECT si.*, date_format(p.date_updated, \'%Y-%m-%d %H:%i:%S\') as part_date_updated, date_format(si.date_entered, \'%Y-%m-%d %H:%i:%S\') as si_date_entered, ' +
                ' p.description, p.inv_qty, p.cost_each, p.storage_location, p.notes, p.part_type, p.reel_width, ' +
                ' pm.mf_part_number, pm.url, pm.notes AS man_notes, pm.default_man, ' +
                ' pmm.name AS man_name ' +
                ' FROM inv__sets_items si ' +
                ' LEFT JOIN inv__parts p ON p.rainey_id = si.rainey_id ' +
                ' LEFT JOIN inv__parts_manufacturing pm ON pm.rainey_id = si.rainey_id AND pm.id = ' +
                   '(SELECT pm2.id FROM inv__parts_manufacturing pm2 WHERE IF(si.part_mf_id IS NULL, pm2.default_man = 1, pm.id = si.part_mf_id) LIMIT 1)  ' +
                ' LEFT JOIN inv__manufacturers pmm ON pmm.id = pm.manufacturer ' +
                ' WHERE si.set_rainey_id = ? ' + 
                ' ORDER BY date_entered DESC ' ;


    try{
        const results = await database.query(sql, [rainey_id]);
        logger.info("Got Set Man Items from set id:"+rainey_id);
        res.json(results);
    }
    catch(error){
        logger.error("getSetManItems w/ Set id: " + id + " , " + error);
        res.sendStatus(400);
    }
});


router.post('/getSetItemsWithManf', async (req,res) => {
    var rainey_id ;
    if(req.body){
        rainey_id = req.body.rainey_id;
    }

    const sql = ' SELECT si.*, date_format(p.date_updated, \'%Y-%m-%d %H:%i:%S\') as part_date_updated, date_format(si.date_entered, \'%Y-%m-%d %H:%i:%S\') as si_date_entered, ' +
                ' p.description, p.inv_qty, p.cost_each, p.storage_location, p.notes, p.part_type, p.reel_width, ' +
                ' pm_all.id AS mf_id, pm_all.manufacturer,  pm_all.mf_part_number, pm_all.url, pm_all.notes AS man_notes, pm_all.default_man, pm.id AS default_man_id, ' +
                ' pmm.name AS man_name ' +
                ' FROM inv__sets_items si ' +
                ' LEFT JOIN inv__parts p ON p.rainey_id = si.rainey_id ' +
                ' LEFT JOIN inv__parts_manufacturing pm_all ON pm_all.rainey_id = si.rainey_id ' +
                ' LEFT JOIN inv__parts_manufacturing pm ON pm.rainey_id = si.rainey_id AND pm.id = ' +
                   '(SELECT pm2.id FROM inv__parts_manufacturing pm2 WHERE IF(si.part_mf_id IS NULL, pm2.default_man = 1, pm.id = si.part_mf_id) LIMIT 1)  ' +
                ' LEFT JOIN inv__manufacturers pmm ON pmm.id = pm_all.manufacturer ' +
                ' WHERE si.set_rainey_id = ? ' + 
                ' ORDER BY date_entered DESC ' ;


    try{
        const results = await database.query(sql, [rainey_id]);
        logger.info("Got Set Man Items from set id:"+rainey_id);
        res.json(results);
    }
    catch(error){
        logger.error("getSetManItems w/ Set id: " + rainey_id + " , " + error);
        res.sendStatus(400);
    }
});


router.post('/updateSetItem', async (req,res) => {

    var item ;
    if(req.body){
        if(req.body.item != null){
            item = req.body.item;
        }  
    }
    logger.info('item to update', [item]);
    const sql = ' UPDATE inv__sets_items SET mf_set_number=?, default_qty=?, manufacturer=?, notes=?, date_updated=?, ' +
        ' default_man=?, url=? ' +
        ' WHERE id = ? ';

    try{
        const results = await database.query(sql, [item.mf_set_number, item.default_qty, item.manufacturer, item.notes,
                 Util.convertISODateTimeToMySqlDateTime(moment()), item.default_man, item.url, item.id ]);
        logger.info("Inventory Set  Item updated " + item.rainey_id);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to updateSetItem: " + error);
        res.sendStatus(400);
    }
});

router.post('/deleteSetItem', async (req,res) => {
    var id;

    if(req.body){
        id = req.body.id;
    }
    if(!id){
        logger.error("Bad id param in deleteSetItem");
        res.sendStatus(400);
    }

    const sql = ' DELETE FROM inv__sets_items WHERE id = ? LIMIT 1 ';

    try{
        const results = await database.query(sql, [id]);

        logger.info("Deleted Set ufacturing Item " + id);
        res.json(results);

    }
    catch(error){
        logger.error("Inventory deleteSetItem " + error);
        res.sendStatus(400);
    }
});


router.post('/addNewSetItem', async (req,res) => {

    var set_item ;
    if(req.body){
        if(req.body.set_item != null){
            set_item = req.body.set_item;
        }  
    }
    const sql = ' INSERT INTO inv__sets_items (set_rainey_id, rainey_id, qty_in_set, ' + 
                ' date_entered, part_mf_id) ' +
                ' VALUES ( ?, ?, IFNULL(?, DEFAULT(qty_in_set)), IFNULL(?, NOW()), IFNULL(?, DEFAULT(part_mf_id)) ) ';

    try{
        const results = await database.query(sql, [ set_item.set_rainey_id, set_item.rainey_id, set_item.qty_in_set,
             Util.convertISODateTimeToMySqlDateTime(moment()), set_item.part_mf_id ]);
        logger.info("Inventory Set  Item added ", [set_item]);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to addNewSetItem: " + error);
        res.sendStatus(400);
    }
});



module.exports = router;