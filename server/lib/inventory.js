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


router.post('/getAllParts', async (req,res) => {

    const sql = ' SELECT p.*, pt.type, date_format(p.date_updated, \'%Y-%m-%d %H:%i:%S\') as date_updated, \'part\' AS item_type, date_format(p.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
                ' FROM inv__parts p ' +
                ' LEFT JOIN inv__parts_types pt ON pt.id = p.part_type ' +
                ' ORDER BY pt.type ASC ';

    try{
        const results = await database.query(sql, []);
        logger.info("Got Parts ");
        res.json(results);

    }
    catch(error){
        logger.error("Parts getAllParts " + error);
        res.sendStatus(400);
    }
});

router.post('/searchAllParts', async (req,res) => {

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

    const sql = ' SELECT p.*, pt.type, date_format(p.date_updated, \'%Y-%m-%d %H:%i:%S\') as date_updated, date_format(p.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' +
                ' FROM inv__parts p ' + 
                ' LEFT JOIN inv__parts_types pt ON pt.id = p.part_type ' +
                ' WHERE ?? like ? ORDER BY pt.type ASC ';

    try{
        const results = await database.query(sql, [table, search_query]);
        logger.info("Got Parts by search", [table, search_query]);
        res.json(results);

    }
    catch(error){
        logger.error("Search Parts: " + error);
        res.sendStatus(400);
    }
});


router.post('/superSearchAllParts', async (req,res) => {

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

    var sql = ' SELECT p.*, pt.type, date_format(p.date_updated, \'%Y-%m-%d %H:%i:%S\') as date_updated, date_format(p.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' +
    ' FROM inv__parts p ' + 
    ' LEFT JOIN inv__parts_types pt ON pt.id = p.part_type ' +
        ' WHERE CONCAT(';
    tables.forEach((table,i)=> {

        sql += `IFNULL(${table}, ''), \' \'${i === tables.length -1 ? '' : ', '}`
    })
    sql+=    ') LIKE ? ' ;
    
    logger.info("SQL", [sql])
    try{
        const results = await database.query(sql, [ search_query]);
        logger.info("Got Parts by super search", [tables, search_query]);
        res.json(results);
    }
    catch(error){
        logger.error("superSearchAllParts : " + error);
        res.sendStatus(400);
    }
});


router.post('/superSearchAllPartsAndKits', async (req,res) => {

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

    var sql = ' SELECT p.rainey_id, p.description, p.cost_each, p.notes, p.min_inv, p.obsolete, pt.type, \'part\' AS item_type, date_format(p.date_updated, \'%Y-%m-%d %H:%i:%S\') as date_updated, date_format(p.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' +
    ' FROM inv__parts p ' + 
    ' LEFT JOIN inv__parts_types pt ON pt.id = p.part_type ' +
        ' WHERE CONCAT(';
    let part_tables = tables.filter((item)=> item.table == "parts");
    part_tables.forEach((table,i)=> {
        
        sql += `IFNULL(${table.value}, ''), \' \'${i === part_tables.length -1 ? '' : ', '}`
        
    })
    sql+=    ') LIKE ? ' + 
    ' UNION SELECT k.rainey_id, k.description, \'0.00\' AS cost_each, k.notes,k.min_inv, k.obsolete, \' \' AS type, \'kit\' AS item_type, date_format(k.date_updated, \'%Y-%m-%d %H:%i:%S\') as date_updated, date_format(k.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
    ' FROM inv__kits k ' +
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

router.post('/getPartById', async (req,res) => {
    var rainey_id ;
    if(req.body){
        rainey_id = req.body.rainey_id;
    }

    const sql = ' SELECT p.*, pt.type,  date_format(p.date_updated, \'%Y-%m-%d %H:%i:%S\') as date_updated, date_format(p.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
                ' FROM inv__parts p ' +
                ' LEFT JOIN inv__parts_types pt ON pt.id = p.part_type ' +
                ' WHERE p.rainey_id = ? ' +
                ' limit 1 ';

    try{
        const results = await database.query(sql, [rainey_id]);
        logger.info("Got Part id:"+rainey_id);
        res.json(results);
    }
    catch(error){
        logger.error("Part id: " + id + " , " + error);
        res.sendStatus(400);
    }
});

router.post('/getPartTypes', async (req,res) => {

    const sql = ' SELECT * from inv__parts_types ORDER BY type ASC ';

    try{
        const results = await database.query(sql, []);
        logger.info("Got Part Types");
        res.json(results);

    }
    catch(error){
        logger.error("Parts getPartTypes " + error);
        res.sendStatus(400);
    }
});

router.post('/getManufactures', async (req,res) => {

    const sql = ' SELECT * from inv__manufacturers ORDER BY name ASC ';

    try{
        const results = await database.query(sql, []);
        logger.info("Got All Manufacturers");
        res.json(results);

    }
    catch(error){
        logger.error("Parts getManufactures " + error);
        res.sendStatus(400);
    }
});

router.post('/addNewPart', async (req,res) => {

    var part ;
    if(req.body){
        if(req.body.part != null){
            part = req.body.part;
        }  
    }
    const sql = ' INSERT INTO inv__parts (description, inv_qty, min_inv, cost_each, storage_location, notes, part_type, reel_width, date_updated, obsolete ) ' +
                ' VALUES (?,IFNULL(?, default(inv_qty)),IFNULL(?, default(min_inv)),IFNULL(?,default(cost_each)),?,?,?,?,?,IFNULL(?, default(obsolete))) ';

    try{
        const results = await database.query(sql, [part.description, part.inv_qty, part.min_inv , part.cost_each, part.storage_location, part.notes,
            part.part_type, part.reel_width, part.date_updated, part.obsolete ]);
        logger.info("Inventory Part added ", [part]);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to addNewPart: " + error);
        res.sendStatus(400);
    }
});

router.post('/updatePart', async (req,res) => {

    var part ;
    if(req.body){
        if(req.body.part != null){
            part = req.body.part;
        }  
    }
    logger.info('part to update', [part]);
    const sql = ' UPDATE inv__parts SET description=?,min_inv=?,  cost_each=?, storage_location=IFNULL(?, DEFAULT(storage_location)), ' +
        ' notes=?, part_type=?, reel_width=?, ' +
        ' date_updated=?, obsolete=? ' +
        ' WHERE rainey_id = ? ';
    

    try{
        logger.info("Date updated", [Util.convertISODateTimeToMySqlDateTime(part.date_updated)])
        const results = await database.query(sql, [part.description,part.min_inv,  part.cost_each, part.storage_location, part.notes,
            part.part_type, part.reel_width, Util.convertISODateTimeToMySqlDateTime(moment()), part.obsolete, part.rainey_id ]);
        logger.info("Inventory Part updated " + part.rainey_id);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to updatePart: " + error);
        res.sendStatus(400);
    }
});

router.post('/updatePartInv', async (req,res) => {

    var part ;
    if(req.body){
        if(req.body.part != null){
            part = req.body.part;
        }  
    }
    logger.info('part to update', [part]);
    const sql = ' UPDATE inv__parts SET  inv_qty=?, date_updated=? ' +
        ' WHERE rainey_id = ?;  ' + 
        ' INSERT INTO inv__parts_transactions (rainey_id, type, new_value, old_value) ' +
        ' VALUES (?,?,?,?) ';

    try{
        
        const results = await database.query(sql, [ part.inv_qty, Util.convertISODateTimeToMySqlDateTime(moment()), part.rainey_id, part.rainey_id,
                "inv_qty", part.inv_qty, part.old_inv_qty  ]);
        logger.info("Inventory INV_QTY updated " + part.rainey_id);

        //check against min_inv and get notification if going below
        if(part.inv_qty <= part.min_inv){
            //send notification to all subscribed to part min inv alerts
            const subscribed_users_sql = " SELECT ns.*, nss.name FROM user_notifications_settings ns " +
                        " LEFT JOIN user_notifications_settings_settings nss ON nss.id = ns.setting " + 
                        " WHERE nss.name = 'Part Minimum Inventory Alert'  "
            const subscribed_users = await database.query(subscribed_users_sql, [ ]);

            async.forEachOf(subscribed_users, async (user, i, callback) => {
                
                if(user.notify){
                    //will automatically call callback after successful execution
                    const note_results = await notificationSystem.sendNotification(user.googleId, "minInvPart",
                    `Part (${part.rainey_id}) has reached minimum inventory.`, '/inventory', 'invParts', 'partsDetail', part.rainey_id);
                }
                

                if(user.push){
                    pushSystem.getUserSubscriptions(user.googleId)
                    .then((data)=>{
                        if(data && data.length > 0){
                            data.forEach((sub) => pushSystem.sendPushNotification(JSON.parse(sub.subscription),  `Part (${part.rainey_id}) has reached minimum inventory.`))
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
        }

        res.json(results);
    }
    catch(error){
        logger.error("Failed to updatePartInv: " + error);
        res.sendStatus(400);
    }
});

// router.post('/updateMultipleParts', async (req,res) => {

//     var parts_array ;
//     if(req.body){
//         parts_array = req.body.parts_array;
//     }

//     const sql = ' UPDATE inv__parts SET description=?, inv_qty=?, cost_each=?, storage_location=IFNULL(?, DEFAULT(storage_location)), ' +
//     ' notes=?, part_type=?, reel_width=?, ' +
//     ' date_updated=?, obsolete=? ' +
//     ' WHERE rainey_id = ? ';

//     async.forEachOf(parts_array, async (part, i, callback) => {
//         //will automatically call callback after successful execution

//         try{
            
//             const results = await database.query(sql, [part.description, part.inv_qty, part.cost_each, part.storage_location, part.notes,
//                 part.part_type, part.reel_width,Util.convertISODateTimeToMySqlDateTime(part.date_updated), part.obsolete, part.rainey_id ]);
//             return;
//         }
//         catch(error){     
//             //callback(error);         
//             throw error;                 
//         }
//     }, err=> {
//         if(err){
//             logger.error("Failed to updateMultipleParts: " + err);
//             res.sendStatus(400);
//         }else{
//             logger.info("Inventory Parts updated " + parts_array);
//             res.sendStatus(200);
//         }
//     })
// });

router.post('/deletePart', async (req,res) => {
    var rainey_id;

    if(req.body){
        rainey_id = req.body.rainey_id;
    }
    if(!rainey_id){
        logger.error("Bad rainey_id param in deletePart");
        res.sendStatus(400);
    }

    const sql = ' DELETE FROM inv__parts WHERE rainey_id = ? LIMIT 1 ';

    try{
        const results = await database.query(sql, [rainey_id]);

        logger.info("Deleted Part " + rainey_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities deleteEntityAddress " + error);
        res.sendStatus(400);
    }
});


router.post('/getPartManItems', async (req,res) => {
    var rainey_id ;
    if(req.body){
        rainey_id = req.body.rainey_id;
    }

    const sql = ' SELECT pm.*, IFNULL(pm.manufacturer, 0) AS manufacturer, m.name AS manufacture_name, date_format(pm.date_updated, \'%Y-%m-%d %H:%i:%S\') as date_updated, ' + 
                ' date_format(pm.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
                ' FROM inv__parts_manufacturing pm ' +
                ' LEFT JOIN inv__manufacturers m ON m.id = pm.manufacturer ' +
                ' WHERE pm.rainey_id = ?  ORDER BY pm.date_entered DESC ';

    try{
        const results = await database.query(sql, [rainey_id]);
        logger.info("Got Part Man Items from part id:"+rainey_id);
        res.json(results);
    }
    catch(error){
        logger.error("getPartManItems w/ Part id: " + id + " , " + error);
        res.sendStatus(400);
    }
});

router.post('/getPartManItemById', async (req,res) => {
    var id ;
    if(req.body){
        id = req.body.id;
    }

    const sql = ' SELECT pm.*, IFNULL(pm.manufacturer, 0) AS manufacturer, m.name AS manufacture_name, date_format(pm.date_updated, \'%Y-%m-%d %H:%i:%S\') as date_updated, ' + 
                ' date_format(pm.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
                ' FROM inv__parts_manufacturing pm ' +
                ' LEFT JOIN inv__manufacturers m ON m.id = pm.manufacturer ' +
                ' WHERE pm.id = ? LIMIT 1';

    try{
        const results = await database.query(sql, [id]);
        logger.info("Got Part Man Item from manf id:"+id);
        res.json(results);
    }
    catch(error){
        logger.error("getPartManItemById w/ Part manf id: " + id + " , " + error);
        res.sendStatus(400);
    }
});




router.post('/updatePartManItem', async (req,res) => {

    var item ;
    if(req.body){
        if(req.body.item != null){
            item = req.body.item;
        }  
    }

    //runs only if we are setting default_man to 1
    const sql2 = ' UPDATE inv__parts_manufacturing SET default_man = 0 WHERE rainey_id = ? ';

    logger.info('item to update', [item]);
    const sql = ' UPDATE inv__parts_manufacturing SET mf_part_number=?, default_qty=?, manufacturer=?, notes=?, date_updated=?, ' +
        ' default_man=?, url=? ' +
        ' WHERE id = ? ';

    try{
        if(item.default_man === 1){
            var pre_results = await database.query(sql2, [ item.rainey_id ]);
        }
        const results = await database.query(sql, [item.mf_part_number, item.default_qty, item.manufacturer, item.notes,
                 Util.convertISODateTimeToMySqlDateTime(moment()), item.default_man, item.url, item.id ]);
        logger.info("Inventory Part Man Item updated " + item.rainey_id);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to updatePartManItem: " + error);
        res.sendStatus(400);
    }
});

router.post('/deletePartManItem', async (req,res) => {
    var id;

    if(req.body){
        id = req.body.id;
    }
    if(!id){
        logger.error("Bad id param in deletePartManItem");
        res.sendStatus(400);
    }

    const sql = ' DELETE FROM inv__parts_manufacturing WHERE id = ? LIMIT 1 ';

    try{
        const results = await database.query(sql, [id]);

        logger.info("Deleted Part Manufacturing Item " + id);
        res.json(results);

    }
    catch(error){
        logger.error("Inventory deletePartManItem " + error);
        res.sendStatus(400);
    }
});


router.post('/addNewPartManItem', async (req,res) => {

    var part_item ;
    if(req.body){
        if(req.body.part_item != null){
            part_item = req.body.part_item;
        }  
    }
    const sql = ' INSERT INTO inv__parts_manufacturing (rainey_id, mf_part_number, default_qty, ' + 
                ' manufacturer, notes,date_entered, date_updated, default_man, url) ' +
                ' VALUES ( ?, ?, IFNULL(?, DEFAULT(default_qty)), ?,?,IFNULL(?, NOW()),?, IFNULL(?, DEFAULT(default_man)), ? ) ';

    try{
        const results = await database.query(sql, [part_item.rainey_id, part_item.mf_part_number, part_item.default_qty, part_item.manufacturer ? part_item.manufacturer : null,
            part_item.notes, null, Util.convertISODateTimeToMySqlDateTime(moment()), part_item.default_man, null ]);
        logger.info("Inventory Part Man Item added ", [part_item]);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to addNewPartManItem: " + error);
        res.sendStatus(400);
    }
});

router.post('/addNewManufacturer', async (req,res) => {

    var manf ;
    if(req.body){
        if(req.body.manf != null){
            manf = req.body.manf;
        }  
    }
    const sql = ' INSERT INTO inv__manufacturers (name ) ' +
                ' VALUES (?) ';

    try{
        const results = await database.query(sql, [manf.name ]);
        logger.info("Inventory Manufacturer added ", [manf]);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to addNewManufacturer: " + error);
        res.sendStatus(400);
    }
});

router.post('/updateManufacturer', async (req,res) => {

    var manf ;
    if(req.body){
        if(req.body.manf != null){
            manf = req.body.manf;
        }  
    }
    logger.info('manf to update', [manf]);
    const sql = ' UPDATE inv__manufacturers SET name=? ' + 
        ' WHERE id = ? ';

    

    try{
        const results = await database.query(sql, [manf.name, manf.id ]);
        logger.info("Inventory Manufacturer updated " + manf.id);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to updateManufacturer: " + error);
        res.sendStatus(400);
    }
});



router.post('/deleteManufacturer', async (req,res) => {
    var id;

    if(req.body){
        id = req.body.id;
    }
    if(!id){
        logger.error("Bad id param in deleteManufacturer");
        res.sendStatus(400);
    }

    const sql = ' DELETE FROM inv__manufacturers WHERE id = ? LIMIT 1 ';

    try{
        const results = await database.query(sql, [id]);

        logger.info("Deleted Manufacturer " + id);
        res.json(results);

    }
    catch(error){
        logger.error("Inventory deleteManufacturer " + error);
        res.sendStatus(400);
    }
});

router.post('/addNewPartType', async (req,res) => {

    var part_type ;
    if(req.body){
        if(req.body.part_type != null){
            part_type = req.body.part_type;
        }  
    }
    const sql = ' INSERT INTO inv__parts_types (type ) ' +
                ' VALUES (?) ';

    try{
        const results = await database.query(sql, [part_type.type ]);
        logger.info("Inventory PartType added ", [part_type]);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to addNewPartType: " + error);
        res.sendStatus(400);
    }
});

router.post('/updatePartType', async (req,res) => {

    var part_type ;
    if(req.body){
        if(req.body.part_type != null){
            part_type = req.body.part_type;
        }  
    }
    logger.info('part_type to update', [part_type]);
    const sql = ' UPDATE inv__parts_types SET type=? ' + 
        ' WHERE id = ? ';

    

    try{
        const results = await database.query(sql, [part_type.type, part_type.id ]);
        logger.info("Inventory PartType updated " + part_type.id);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to updatePartType: " + error);
        res.sendStatus(400);
    }
});



router.post('/deletePartType', async (req,res) => {
    var id;

    if(req.body){
        id = req.body.id;
    }
    if(!id){
        logger.error("Bad id param in deletePartType");
        res.sendStatus(400);
    }

    const sql = ' DELETE FROM inv__parts_types WHERE id = ? LIMIT 1 ';

    try{
        const results = await database.query(sql, [id]);

        logger.info("Deleted PartType " + id);
        res.json(results);

    }
    catch(error){
        logger.error("Inventory deletePartType " + error);
        res.sendStatus(400);
    }
});

module.exports = router;