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


const checkKitValidity = (kit_to_add, kit_to_add_to) =>{
    return new Promise(async (resolve, reject)=>{

        const sql_children_check = 'CALL get_kits_within_kit(?)'; //stored procedure in db
        const sql_get_all_kk_ = ' SELECT * FROM inv__kits_kits where rainey_id  = ?'
        const sql_parents_check = 'CALL get_kit_parents(?,?)'; //stored procedure in db

        const all_occurances = await database.query(sql_get_all_kk_, [kit_to_add_to])

        //If no occurances, just insert, else check them
        if(kit_to_add == kit_to_add_to){
            reject("Cannot add kit to itself")
        }
        if(all_occurances && all_occurances.length){

            //Get Children
            const children = await database.query(sql_children_check, [ kit_to_add ])
            let occurance_parents = [];

            //Get all occurances of node we are adding to
            all_occurances.forEach(async(occurance)=> {
                occurance_parents.push( database.query(sql_parents_check, [occurance.id , kit_to_add_to ]))
            })

            Promise.all(occurance_parents).then((results)=>{
                //Check each occurances lineage against our children 
                //checks results and also the actual kit we are adding to
                let flattened_results = results.reduce(((prev, curr)=> prev.concat(curr[0])), []);
                let test = [...flattened_results, {parent_rainey_id: kit_to_add_to}].every((item)=> {
                    console.log("-------- TEST WITH " + item.parent_rainey_id + " --------------")
                    let testt2 = children[0].every((child)=> {
                        console.log( " ++  " + child.rainey_id + "   ++" )
                        return child.rainey_id != item.parent_rainey_id
                    }) 
                    console.log("-------------" + testt2 + "----------------------")
                    return testt2;
                })

                if(test){
                    resolve(test);
                }else{
                    reject("Kit failed to pass validity test. Check Kit Tree");
                }
            })
        }else{
            resolve(true);
        }
    })
}

router.post('/getAllPartsAndKits', async (req,res) => {

    const sql = ' SELECT k.rainey_id, k.description, \'0.00\' AS cost_each, k.notes,k.min_inv, k.obsolete, \' \' AS type, \'kit\' AS item_type, date_format(k.date_updated, \'%Y-%m-%d %H:%i:%S\') as date_updated, date_format(k.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
                ' FROM inv__kits k ' +
                ' UNION ' + 
                ' SELECT p.rainey_id, p.description, p.cost_each, p.notes, p.min_inv, p.obsolete, pt.type, \'part\' AS item_type, date_format(p.date_updated, \'%Y-%m-%d %H:%i:%S\') as date_updated, date_format(p.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
                ' FROM inv__parts p ' +
                ' LEFT JOIN inv__parts_types pt ON pt.id = p.part_type ' +
                ' ORDER BY rainey_id ASC ';

    try{
        const results = await database.query(sql, []);
        logger.info("Got Kits ");
        res.json(results);

    }
    catch(error){
        logger.error("Kits getAllPartsAndKits " + error);
        res.sendStatus(400);
    }
});

router.post('/getAllKits', async (req,res) => {

    const sql = ' SELECT s.*, date_format(s.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
                ' FROM inv__kits s ' +
                ' ORDER BY s.rainey_id ASC ';

    try{
        const results = await database.query(sql, []);
        logger.info("Got Kits ");
        res.json(results);

    }
    catch(error){
        logger.error("Kits getAllKits " + error);
        res.sendStatus(400);
    }
});

router.post('/searchAllKits', async (req,res) => {

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

    const sql = ' SELECT k.*, date_format(k.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
                ' FROM inv__kits k ' +
                ' WHERE ?? like ? ORDER BY k.rainey_id ASC ';

    try{
        const results = await database.query(sql, [table, search_query]);
        logger.info("Got Kits by search", [table, search_query]);
        res.json(results);

    }
    catch(error){
        logger.error("Search Kits: " + error);
        res.sendStatus(400);
    }
});


router.post('/superSearchAllKits', async (req,res) => {

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

    var sql = ' SELECT k.*, date_format(k.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
    ' FROM inv__kits k ' +
        ' WHERE CONCAT(';
    tables.forEach((table,i)=> {

        sql += `IFNULL(${table}, ''), \' \'${i === tables.length -1 ? '' : ', '}`
    })
    sql+=    ') LIKE ? ' ;

    logger.info("SQL", [sql])
    try{
        const results = await database.query(sql, [ search_query]);
        logger.info("Got Kits by super search", [tables, search_query]);
        res.json(results);
    }
    catch(error){
        logger.error("superSearchAllKits : " + error);
        res.sendStatus(400);
    }
});

router.post('/getKitById', async (req,res) => {
    var rainey_id ;
    if(req.body){
        rainey_id = req.body.rainey_id;
    }

    const sql = ' SELECT s.*, date_format(s.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
                ' FROM inv__kits s ' +
                ' WHERE s.rainey_id = ? ' +
                ' limit 1 ';

    try{
        const results = await database.query(sql, [rainey_id]);
        logger.info("Got Kit id:"+rainey_id);
        res.json(results);
    }
    catch(error){
        logger.error("Kit id: " + id + " , " + error);
        res.sendStatus(400);
    }
});



router.post('/addNewKit', async (req,res) => {

    var kit, user ;
    if(req.body){
        if(req.body.kit != null){
            kit = req.body.kit;
            user = req.body.user;
        }  
    }
    if(!user || !user.isAdmin){
        logger.error("Bad user or not admin", [user]);
        res.sendStatus(400);
        return;
    }

    const sql = ' INSERT INTO inv__kits (description, inv_qty, min_inv, num_in_kit, notes, storage_location, date_updated, obsolete ) ' +
                ' VALUES (?,IFNULL(?, default(inv_qty)),IFNULL(?, default(min_inv)),IFNULL(?, default(num_in_kit)),?,?,?,IFNULL(?, default(obsolete))) ';

    try{
        const results = await database.query(sql, [kit.description, kit.inv_qty, kit.min_inv, kit.num_in_kit, kit.notes, kit.storage_location,
             kit.date_updated, kit.obsolete ]);
        logger.info("Inventory Kit added ", [kit]);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to addNewKit: " + error);
        res.sendStatus(400);
    }
});

router.post('/updateKit', async (req,res) => {

    var kit, user ;
    if(req.body){
        if(req.body.kit != null){
            kit = req.body.kit;
            user = req.body.user;
        }  
    }
    if(!user || !user.isAdmin){
        logger.error("Bad user or not admin", [user]);
        res.sendStatus(400);
        return;
    }

    logger.info('kit to update', [kit]);
    const sql = ' UPDATE inv__kits SET description=?, min_inv=?, num_in_kit=?, ' +
        ' notes=?,storage_location=?,  ' +
        ' date_updated=?, obsolete=? ' +
        ' WHERE rainey_id = ? ';
    

    try{
        logger.info("Date updated", [Util.convertISODateTimeToMySqlDateTime(kit.date_updated)])
        const results = await database.query(sql, [kit.description,kit.min_inv, kit.num_in_kit,  kit.notes, kit.storage_location,
             Util.convertISODateTimeToMySqlDateTime(moment()), kit.obsolete, kit.rainey_id ]);
        logger.info("Inventory Kit updated " + kit.rainey_id);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to updateKit: " + error);
        res.sendStatus(400);
    }
});

router.post('/updateKitInv', async (req,res) => {

    var kit, user ;
    if(req.body){
        if(req.body.kit != null){
            kit = req.body.kit;
            user = req.body.user;
        }  
    }
    if(!user || !user.isAdmin){
        logger.error("Bad user or not admin", [user]);
        res.sendStatus(400);
        return;
    }

    logger.info('kit to update', [kit]);
    const sql = ' UPDATE inv__kits SET  inv_qty=?, date_updated=? ' +
        ' WHERE rainey_id = ?;  ' + 
        ' INSERT INTO inv__kits_transactions (rainey_id, type, new_value, old_value) ' +
        ' VALUES (?,?,?,?) ';
    

    try{
        //Check against min_inv and give notification 
        logger.info("Date updated", [Util.convertISODateTimeToMySqlDateTime(kit.date_updated)])
        const results = await database.query(sql, [ kit.inv_qty, Util.convertISODateTimeToMySqlDateTime(moment()), kit.rainey_id, kit.rainey_id,
                "inv_qty", kit.inv_qty, kit.old_inv_qty  ]);
        logger.info("Inventory INV_QTY updated " + kit.rainey_id);

        //check against min_inv and get notification if going below
        if(kit.inv_qty <= kit.min_inv){
            //send notification to all subscribed to kit min inv alerts
            const subscribed_users_sql = " SELECT ns.*, nss.name FROM user_notifications_settings ns " +
                        " LEFT JOIN user_notifications_settings_settings nss ON nss.id = ns.setting " + 
                        " WHERE nss.name = 'Kit Minimum Inventory Alert'  "
            const subscribed_users = await database.query(subscribed_users_sql, [ ]);

            async.forEachOf(subscribed_users, async (user, i, callback) => {

                //will automatically call callback after successful execution
                const note_results = await notificationSystem.sendNotification(user.googleId, "minInvKit",
                    `Kit (${kit.rainey_id}) has reached minimum inventory.`, '/inventory', 'invKits', 'kitsDetail', kit.rainey_id);

                pushSystem.getUserSubscriptions(user.googleId)
                .then((data)=>{
                    if(data && data.length > 0){
                        data.forEach((sub) => pushSystem.sendPushNotification(JSON.parse(sub.subscription),  `Kit (${kit.rainey_id}) has reached minimum inventory.`))
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
        logger.error("Failed to updateKitInv: " + error);
        res.sendStatus(400);
    }
});


router.post('/deleteKit', async (req,res) => {
    var rainey_id,user ;

    if(req.body){
        rainey_id = req.body.rainey_id;
        user = req.body.user;
    }
    if(!rainey_id){
        logger.error("Bad rainey_id param in deleteKit");
        res.sendStatus(400);
    }
    if(!user || !user.isAdmin){
        logger.error("Bad user or not admin", [user]);
        res.sendStatus(400);
        return;
    }

    const sql = ' DELETE FROM inv__kits WHERE rainey_id = ? LIMIT 1 ';

    try{
        const results = await database.query(sql, [rainey_id]);

        logger.info("Deleted Kit " + rainey_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities deleteEntityAddress " + error);
        res.sendStatus(400);
    }
});


router.post('/getKitItems', async (req,res) => {
    var rainey_id ;
    if(req.body){
        rainey_id = req.body.rainey_id;
    }

    const sql = 
            ' SELECT kp.id, kp.kit_rainey_id, kp.rainey_id, kp.qty_in_kit, date_format(p.date_updated, \'%Y-%m-%d %H:%i:%S\') as item_date_updated, date_format(kp.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered,  ' +
            '         p.description, p.inv_qty, p.min_inv, p.cost_each, p.storage_location, p.notes,  p.part_type, pt.type AS type_name, \'part\' AS item_type, p.reel_width  ' +
            ' FROM inv__kits_parts kp  ' +
            ' LEFT JOIN inv__parts p ON p.rainey_id = kp.rainey_id  ' +
            ' LEFT JOIN inv__parts_types pt ON pt.id = p.part_type  ' +
            ' WHERE kp.kit_rainey_id = ?   ' +
            ' UNION   ' +
            ' SELECT kk.id, kk.kit_rainey_id, kk.rainey_id, kk.qty_in_kit, date_format(k.date_updated, \'%Y-%m-%d %H:%i:%S\') as item_date_updated, date_format(kk.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered,  ' +
            ' k.description, k.inv_qty, k.min_inv,   ' +
            ' \'0.00\' AS cost_each,   ' +
            ' k.storage_location, k.notes, k.part_type, pt.type AS type_name, \'kit\' AS item_type, \' \' AS reel_width  ' +
            ' FROM inv__kits_kits kk  ' +
            ' LEFT JOIN inv__kits k ON k.rainey_id = kk.rainey_id  ' +
            ' LEFT JOIN inv__parts_types pt ON pt.id = k.part_type  ' +
            ' WHERE kk.kit_rainey_id = ?  ' +
            ' ORDER BY date_entered DESC; ';




    try{
        const results = await database.query(sql, [rainey_id,rainey_id]);
        logger.info("Got Kit Man Items from kit id:"+rainey_id);
        res.json(results);
    }
    catch(error){
        logger.error("getKitManItems w/ Kit id: " + rainey_id + " , " + error);
        res.sendStatus(400);
    }
});

router.post('/getKitItemsCostData', async (req,res) => {
    var rainey_id ;
    if(req.body){
        rainey_id = req.body.rainey_id;
    }

    const sql = 
    '  SELECT  all_kits.id, all_kits.rainey_id AS kit_rainey_id, all_kits.kit_rainey_id AS kit_parent_id,kp.rainey_id AS part_id,  ' +
    '                           all_kits.qty_in_kit AS kit_kit_qty, kp.qty_in_kit AS kit_item_qty,  all_kits.num_in_kit AS kit_qty, pt.type AS type_name, ' + 
    '                           p.cost_each, date_format(kp.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' +                  
    '  FROM ' +
    '      (select id, rainey_id, kit_rainey_id, qty_in_kit , num_in_kit ' +
    '      from     ' +
    '              (select  sub_ikk.*,sub_ik.num_in_kit  from inv__kits_kits sub_ikk  ' +
    '              LEFT JOIN inv__kits sub_ik ON sub_ik.rainey_id = sub_ikk.rainey_id  ' +
    '              ORDER BY sub_ikk.rainey_id, sub_ikk.kit_rainey_id) ps,    ' +
    '              (select @pv := ? ) initialization    ' +
    '      where   find_in_set(kit_rainey_id, @pv)    ' +
    '      and     length(@pv := concat(@pv, \',\', rainey_id)) ) all_kits ' +
    '  LEFT JOIN inv__kits_parts kp ON (kp.kit_rainey_id = all_kits.rainey_id )  ' +
    '  LEFT JOIN inv__parts p ON p.rainey_id = kp.rainey_id  ' +
    '  LEFT JOIN inv__parts_types pt ON pt.id = p.part_type  ' +
    '  UNION ' +
    '  SELECT NULL AS id, kp.kit_rainey_id AS kit_rainey_id, NULL AS kit_parent_id, kp.rainey_id AS part_id,   ' +
    '          1 AS kit_item_qty, kp.qty_in_kit AS kit_kit_qty, ik.num_in_kit AS kit_qty, pt.type AS type_name, ' +
    '          p.cost_each , date_format(kp.date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' +
    '          FROM inv__kits_parts kp    ' +
    '          LEFT JOIN inv__parts p ON p.rainey_id = kp.rainey_id   ' +
    '          LEFT JOIN inv__parts_types pt ON pt.id = p.part_type  ' +
    '          LEFT JOIN inv__kits ik ON ik.rainey_id = kp.kit_rainey_id  ' +
    '          WHERE kp.kit_rainey_id = ? ; ' ;



    try{
        const results = await database.query(sql, [rainey_id, rainey_id]);
        logger.info("Got Kit Items data from kit id:"+rainey_id);
        //use data to recursively find cost

    
        if(results.length == 1 ){
            return results[0].cost_each;
        }
        var kitArray = _.uniqBy(results.map((v)=> ({id: v.id, kit_rainey_id: v.kit_rainey_id, kit_parent_id: v.kit_parent_id, 
                kit_kit_qty: v.kit_kit_qty, kit_qty: v.kit_qty })), 'kit_rainey_id');

        
        const calculateCost = async (kitArray, data, root_id, multiplier) => {
            return new Promise( async(resolve,reject )=> {
                //Find root
                var root_item = kitArray.find((row)=> row.kit_rainey_id == root_id);
                if(!root_item){
                    console.error("No root node");
                    reject("No root found");
                }
                
                //adjust multiplier 
                let new_multiplier = multiplier * root_item.kit_qty;
                if(root_item.id){
                    new_multiplier *= root_item.kit_kit_qty;
                }

                //check for children
                let children = kitArray.filter((row)=> row.kit_parent_id == root_item.kit_rainey_id)
                
                if(children.length){
                    let price  = 0.00;
                    let promises = [];
                    children.forEach(async (child)=> {
                        promises.push(
                            calculateCost(kitArray, data, child.kit_rainey_id, new_multiplier)
                        )
                    } );

                    Promise.all(promises).then((price_array)=>{
                        //Add kit childrens prices too our price
                        price = price_array.reduce((total, current)=> (total += current), price)

                        //Get Root Part's chlildren included
                        price +=  data.filter((item)=> item.kit_rainey_id == root_id && item.id == root_item.id)
                                      .reduce((total, item)=>  (total + item.kit_item_qty * item.cost_each * new_multiplier), 0)
                        
                        resolve(price);
                    })
                    
                }else{
                    let price = data.filter((item)=> item.kit_rainey_id == root_id && item.id == root_item.id)
                                    .reduce((total, item)=>  (total + item.kit_item_qty * item.cost_each * new_multiplier), 0)
                  
                    resolve(price); 
                }
            })
        }

        calculateCost(kitArray, results, rainey_id, 1)
        .then((result)=>{
            console.log("RESULT: ", result);
            res.json(result);
        })
        .catch((error)=>{
            console.error("Error in calculateCost", error);
        })


        

        
    }
    catch(error){
        logger.error("getKitManItems w/ Kit id: " + rainey_id + " , " + error);
        res.sendStatus(400);
    }
});




router.post('/getKitItemsWithManf', async (req,res) => {
    var rainey_id ;
    if(req.body){
        rainey_id = req.body.rainey_id;
    }

    const sql = ' SELECT si.*, date_format(p.date_updated, \'%Y-%m-%d %H:%i:%S\') as part_date_updated, date_format(si.date_entered, \'%Y-%m-%d %H:%i:%S\') as si_date_entered, ' +
                ' p.description, p.inv_qty, p.cost_each, p.storage_location, p.notes, p.part_type, p.reel_width, ' +
                ' pm_all.id AS mf_id, pm_all.manufacturer,  pm_all.mf_part_number, pm_all.url, pm_all.notes AS man_notes, pm_all.default_man, pm.id AS default_man_id, ' +
                ' pmm.name AS man_name ' +
                ' FROM inv__kits_parts si ' +
                ' LEFT JOIN inv__parts p ON p.rainey_id = si.rainey_id ' +
                ' LEFT JOIN inv__parts_manufacturing pm_all ON pm_all.rainey_id = si.rainey_id ' +
                ' LEFT JOIN inv__parts_manufacturing pm ON pm.rainey_id = si.rainey_id AND pm.id = ' +
                   '(SELECT pm2.id FROM inv__parts_manufacturing pm2 WHERE IF(si.part_mf_id IS NULL, pm2.default_man = 1, pm.id = si.part_mf_id) LIMIT 1)  ' +
                ' LEFT JOIN inv__manufacturers pmm ON pmm.id = pm_all.manufacturer ' +
                ' WHERE si.kit_rainey_id = ? ' + 
                ' ORDER BY date_entered DESC ' ;


    try{
        const results = await database.query(sql, [rainey_id]);
        logger.info("Got Kit Man Items from kit id:"+rainey_id);
        res.json(results);
    }
    catch(error){
        logger.error("getKitManItems w/ Kit id: " + rainey_id + " , " + error);
        res.sendStatus(400);
    }
});


router.post('/updateKitPart', async (req,res) => {

    var item, user;
    if(req.body){
        if(req.body.item != null){
            item = req.body.item;
            user = req.body.user;
        }  
    }
    if(!user || !user.isAdmin){
        logger.error("Bad user or not admin", [user]);
        res.sendStatus(400);
        return;
    }

    logger.info('item to update', [item]);
    const sql = ' UPDATE inv__kits_parts SET  qty_in_kit=?, rainey_id=? ' +
        ' WHERE id = ? ';

    try{
        const results = await database.query(sql, [item.qty_in_kit, item.rainey_id, item.id ]);
        logger.info("Inventory Kit  Part updated " + item.id);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to updateKitPart: " + error);
        res.sendStatus(400);
    }
});


router.post('/deleteKitPart', async (req,res) => {
    var id, user;

    if(req.body){
        id = req.body.id;
        user = req.body.user;
    }
    if(!id){
        logger.error("Bad id param in deleteKitPart");
        res.sendStatus(400);
    }
    if(!user || !user.isAdmin){
        logger.error("Bad user or not admin", [user]);
        res.sendStatus(400);
        return;
    }

    const sql = ' DELETE FROM inv__kits_parts WHERE id = ? LIMIT 1 ';

    try{
        const results = await database.query(sql, [id]);

        logger.info("Deleted Kit ufacturing Part " + id);
        res.json(results);

    }
    catch(error){
        logger.error("Inventory deleteKitPart " + error);
        res.sendStatus(400);
    }
});


router.post('/addNewKitPart', async (req,res) => {

    var kit_item, user ;
    if(req.body){
        if(req.body.kit_item != null){
            kit_item = req.body.kit_item;
            user = req.body.user;
        }  
    }
    if(!user || !user.isAdmin){
        logger.error("Bad user or not admin", [user]);
        res.sendStatus(400);
        return;
    }

    const sql = ' INSERT INTO inv__kits_parts (kit_rainey_id, rainey_id, qty_in_kit, ' + 
                ' date_entered, part_mf_id) ' +
                ' VALUES ( ?, ?, IFNULL(?, DEFAULT(qty_in_kit)), IFNULL(?, NOW()), IFNULL(?, DEFAULT(part_mf_id)) ) ';

    try{
        const results = await database.query(sql, [ kit_item.kit_rainey_id, kit_item.rainey_id, kit_item.qty_in_kit,
             Util.convertISODateTimeToMySqlDateTime(moment()), kit_item.part_mf_id ]);
        logger.info("Inventory Kit  Part added ", [kit_item]);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to addNewKitPart: " + error);
        res.sendStatus(400);
    }
});


router.post('/updateKitKit', async (req,res) => {

    var item, user ;
    if(req.body){
        if(req.body.item != null){
            item = req.body.item;
            user = req.body.user;
        }  
    }
    if(!user || !user.isAdmin){
        logger.error("Bad user or not admin", [user]);
        res.sendStatus(400);
        return;
    }
    logger.info('item to update', [item]);
    const sql = ' UPDATE inv__kits_kits SET  qty_in_kit=?, rainey_id=? ' +
        ' WHERE id = ? ';


    //We must check if kit to be added is already in this kits lineage, parent or child
    checkKitValidity(item.rainey_id, item.kit_rainey_id).then(async (result)=>{
        if(result){
            const results = null ; //await database.query(sql, [ item.qty_in_kit, item.rainey_id, item.id ]);
            logger.info("Inventory Kit  Kit updated " + item.id);
            res.json(results);
        }else{
            throw "Kit change failed to pass validity test"
        }
    })
    .catch((error)=>{
        logger.error("Failed to updateKitKit: " + error);
        res.json({error});
    })
});


router.post('/deleteKitKit', async (req,res) => {
    var id, user;

    if(req.body){
        id = req.body.id;
        user = req.body.user;
    }
    if(!id){
        logger.error("Bad id param in deleteKitKit");
        res.sendStatus(400);
    }
    if(!user || !user.isAdmin){
        logger.error("Bad user or not admin", [user]);
        res.sendStatus(400);
        return;
    }

    const sql = ' DELETE FROM inv__kits_kits WHERE id = ? LIMIT 1 ';

    try{
        const results = await database.query(sql, [id]);

        logger.info("Deleted Kit ufacturing Kit " + id);
        res.json(results);

    }
    catch(error){
        logger.error("Inventory deleteKitKit " + error);
        res.sendStatus(400);
    }
});


router.post('/addNewKitKit', async (req,res) => {

    var kit_item, user ;
    if(req.body){
        if(req.body.kit_item != null){
            kit_item = req.body.kit_item;
            user = req.body.user;
        }  
    }
    if(!user || !user.isAdmin){
        logger.error("Bad user or not admin", [user]);
        res.sendStatus(400);
        return;
    }
    
    const sql = ' INSERT INTO inv__kits_kits (kit_rainey_id, rainey_id, qty_in_kit, ' + 
                ' date_entered) ' +
                ' VALUES ( ?, ?, IFNULL(?, DEFAULT(qty_in_kit)), IFNULL(?, NOW()) ) ';

    //We must check if kit to be added is already in this kits lineage, parent or child
    checkKitValidity(kit_item.rainey_id, kit_item.kit_rainey_id).then(async (result)=>{
        if(result){
            const results = await database.query(sql, [ kit_item.kit_rainey_id, kit_item.rainey_id, kit_item.qty_in_kit,
                Util.convertISODateTimeToMySqlDateTime(moment()) ]);
            logger.info("Inventory Kit  Kit added ", [kit_item]);
            res.json(results);
        }else{
            throw "Kit change failed to pass validity test"
        }
    })
    .catch((error)=>{
        logger.error("Failed to addNewKitKit: " + error);
        res.json({error});
    })
       
});



module.exports = router;