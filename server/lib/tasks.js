const express = require('express');
var async = require("async");
const router = express.Router();

const {checkPermission} = require("../util/util");
const logger = require('../../logs');
//Handle Database
const database = require('./db');

router.get('/getAllTasks', async (req,res) => {
    const sql = ' SELECT DISTINCT t.id AS t_id, t.name AS old_task_name, hours_estimate, date_format(date_desired, \'%Y-%m-%d %H:%i:%S\') as date_desired, '+
    ' date_format(t.date_assigned, \'%Y-%m-%d\') as date_assigned, ' + 
    ' date_format(t.date_completed, \'%Y-%m-%d\') as date_completed, t.description, t.priority_order, t.task_list_id, ' + 
    ' t.task_status, t.drilling, t.sign, t.artwork, t.table_id, date_format(t.order_date, \'%Y-%m-%d\') as order_date, ' + 
    ' t.first_game, date_format(wo.date, \'%Y-%m-%d\') as wo_date, wo.type AS wo_type, t.type, t.install_location,' +
    ' wo.completed as completed_wo, wo.invoiced as invoiced_wo, ' + 
    ' t.delivery_crew, t.delivery_order,t.install_order, e.name AS customer_name,' + 
    '  ea.name AS address_name, ea.address, ea.city, ea.state, ea.zip, ea.lat, ea.lng, ea.geocoded , ea.record_id AS address_id , ea.entities_id, '  +
    ' concat(e.name, \', \', ea.city, \', \', ea.state  ) AS t_name ' + 
    ' FROM tasks t ' +
    ' LEFT JOIN work_orders wo ON t.table_id = wo.record_id ' +
    ' LEFT JOIN entities_addresses ea ON wo.customer_address_id = ea.record_id ' + 
    ' LEFT JOIN entities e ON wo.customer_id = e.record_id ' + 
    // ' LEFT JOIN entities_addresses ea ON (wo.account_id = ea.entities_id AND ' + 
    //     ' IF(ea.task = 1, true, ' + //selects task = 1 address if available, defaults to mail =1 
    //         ' IF(ea.main =1 AND NOT EXISTS(select address from entities_addresses where task = 1 AND entities_id = ea.entities_id), true, false ))) ' +
    ' ORDER BY t_id DESC ' + 
    ' limit 1000';
   try{
     const results = await database.query(sql, []);
     logger.info("Got Tasks");
     res.json(results);
   }
   catch(error){
     logger.error("Tasks (getAll): " + error);
     res.sendStatus(400);
   }
 });

router.post('/getTask', async (req,res) => {
    var id;
    if(req.body){
        id = req.body.id;
    }

    const sql = ' SELECT DISTINCT t.id AS t_id, t.name AS old_task_name, t.hours_estimate, date_format(t.date_desired, \'%Y-%m-%d %H:%i:%S\') as date_desired, ' +
    ' date_format(t.date_assigned, \'%Y-%m-%d %H:%i:%S\') as date_assigned, date_format(t.date_completed, \'%Y-%m-%d %H:%i:%S\') as date_completed, ' + 
    ' t.description, t.notes, t.priority_order, t.task_list_id, t.task_status, t.drilling, t.sign, t.artwork, t.table_id,  ' + 
    ' date_format(t.order_date, \'%Y-%m-%d %H:%i:%S\') as order_date, t.first_game, date_format(wo.date, \'%Y-%m-%d\') as wo_date, wo.type AS wo_type, t.install_location, ' +
    ' wo.completed as completed_wo, wo.invoiced as invoiced_wo, t.type, ' + 
    ' t.delivery_crew, t.delivery_order, date_format(delivery_date, \'%Y-%m-%d %H:%i:%S\') as delivery_date,t.install_order, ' + 
    ' cjd.crew_id AS drill_crew, date_format(cjd.job_date, \'%Y-%m-%d %H:%i:%S\') as drill_date, ' + 
    ' cji.crew_id AS install_crew, cji.id AS install_job_id,  ' + 
    ' date_format(cji.job_date, \'%Y-%m-%d %H:%i:%S\') as sch_install_date, ea.name AS address_name, ea.address, ea.city, ea.state, ' + 
    ' ea.zip, ea.lat, ea.lng, ea.geocoded, ea.record_id AS address_id, ea.entities_id, tli.task_list_id, tli.id AS task_list_item_id, e.name AS customer_name, '  +
    ' concat(e.name, \', \', ea.city, \', \', ea.state  ) AS t_name ' + 
    ' FROM tasks t ' +
    ' LEFT JOIN work_orders wo ON t.table_id = wo.record_id '  +
    ' LEFT JOIN entities_addresses ea ON wo.customer_address_id = ea.record_id ' + 
    ' LEFT JOIN entities e ON wo.customer_id = e.record_id ' + 
    ' LEFT JOIN crew_jobs cji ON cji.job_type = \'install\' AND cji.task_id = t.id  ' + 
    ' LEFT JOIN crew_jobs cjd ON cjd.job_type = \'drill\' AND cjd.task_id = t.id  ' + 
    // ' LEFT JOIN entities_addresses ea ON (wo.account_id = ea.entities_id AND ' + 
    //     ' IF(ea.task = 1, true, ' + //selects task = 1 address if available, defaults to mail =1 
    //         ' IF(ea.main =1 AND NOT EXISTS(select address from entities_addresses where task = 1 AND entities_id = ea.entities_id), true, false ))) ' + 
    ' LEFT JOIN task_list_items tli ON t.id = tli.task_id ' +
    ' WHERE t.id = ?  ';

    try{
        const results = await database.query(sql, id);
        logger.info("Got Task " + id );
        res.json(results);
    }
    catch(error){
        logger.error("Tasks (getTask): " + error);
        res.sendStatus(400);
    }
});

router.post('/removeTask', async (req,res) => {
    const sql = 'DELETE FROM tasks WHERE id = ? LIMIT 1';
    var id;
    if(req.body){
        id = req.body.id;
    }
    
    try{
        const results = await database.query(sql, id);
        logger.info("Deleted Task " + id);
        res.sendStatus(200);
    }
    catch(error){
        logger.error("Tasks (removeTask): " + error);
        res.sendStatus(400);
    }
});

router.post('/updateTask', async (req,res) => {
    var task, user;
    if(req.body){
    task = req.body.task;
    user = req.body.user;
    }

    logger.info(JSON.stringify(task));

    if(!user){
        logger.error("Bad user", [user]);
        res.sendStatus(400);
        return;
    }
    if(!checkPermission(user.permissions, 'scheduling') && !user.isAdmin){
        logger.error("Bad permission", [user]);
        res.sendStatus(400);
        return;
    }
    

    const sql = ' UPDATE tasks SET name = ? , hours_estimate= ? , date_desired=date_format( ? , \'%Y-%m-%d %H:%i:%S\'),first_game=date_format( ? , \'%Y-%m-%d %H:%i:%S\') , date_assigned=date_format( ? , \'%Y-%m-%d %H:%i:%S\') , ' + 
    ' date_completed=date_format( ? , \'%Y-%m-%d %H:%i:%S\') , description= ? , notes= ? , ' +
    ' task_status= ?, drilling= ? , sign= ? , artwork= ?  ' + 
    ' WHERE id = ? ';

    const params = [task.t_name, task.hours_estimate, task.date_desired, task.first_game, task.date_assigned, task.date_completed, task.description, task.notes, 
    task.task_status, task.drilling, task.sign, task.artwork, task.t_id ];
    //todo  table_id (address, in db), first_game(in db, add to form), install_location(in db), 
    //       assigned users(not in db),  maybe missing something...

    try{
    const results = await database.query(sql, params);
    logger.info("Update Task " + task.t_id );
    res.sendStatus(200);
    }
    catch(error){
    logger.error("Tasks (updateTask): " + error);
    res.sendStatus(400);
    }
});

router.post('/updateMultipleTaskDates', async (req,res) => {
    var ids, date, job_type, user;
    if(req.body){
        ids = req.body.ids;
        date = req.body.date;
        job_type = req.body.job_type;
        user = req.body.user;
    }

    if(user && !checkPermission(user.permissions, 'scheduling') && !user.isAdmin){
        logger.error("Bad permission", [user]);
        res.sendStatus(400);
        return;
    }

    const sql = ' UPDATE crew_jobs SET  job_date=date_format( ? , \'%Y-%m-%d %H:%i:%S\') ' + 
    ' WHERE id = ? AND job_type = ? ';

    //sch_install_date, delivery_date,  date_desired


    async.forEachOf(ids, async (id, i, callback) => {
        logger.info(id + " " + date);

        const params = [date, id , job_type];
            //todo  table_id (address, in db), first_game(in db, add to form), install_location(in db), 
             //       assigned users(not in db),  maybe missing something...

        //will automatically call callback after successful execution
        try{
            const results = await database.query(sql, params);
            return;
        }
        catch(error){
            throw error;  
        }
    }, err=> {
        if(err){
            logger.error("Tasks (updateMultipleTaskDates): " + err);
    res.sendStatus(400);
        }else{
            logger.info("Update MultipleTaskDates " + [ids] );
            res.sendStatus(200);
        }
    })
});

router.post('/saveCoordinates', async (req,res) => {
    var record_id, coordinates;
    if(req.body){
        record_id = req.body.record_id;
        coordinates = req.body.coordinates;
    }
 

    const sql = ' UPDATE entities_addresses ea ' +
    ' SET ea.geocoded = 1, ea.lat = ?, ea.lng = ? ' +
    ' WHERE ea.record_id = ?';

    const params = [coordinates.lat, coordinates.lng, record_id ];

    try{
    const results = await database.query(sql, params);
    logger.verbose("Saved Entity Address Coord from record_id:" + record_id );
    res.sendStatus(200);
    }
    catch(error){
    logger.error("Saved Entity Address (saveCoord): " + error);
    res.sendStatus(400);
    }
});

router.post('/addAndSaveAddress', async (req,res) => {
    var addressObj, entities_id, user;
    if(req.body){
        addressObj = req.body.addressObj;
        entities_id = req.body.entities_id;
        user = req.body.user;
    }

    if(user && !checkPermission(user.permissions, 'scheduling') && !user.isAdmin){
        logger.error("Bad permission", [user]);
        res.sendStatus(400);
        return;
    }
    
    //Add a new address to entities_addresses and set task = 1, remove task =1 from all others
    const sql = ' UPDATE entities_addresses set task = 0 WHERE entities_id = ? ; ' + 
    ' INSERT INTO entities_addresses (name,to_name, address, city, state,zip, residence, geocoded, task, entities_id, lat, lng) ' + 
    ' VALUES ( ? , ? , ? , ? , ? , ? , 0, 0, 1, ?, 0, 0 ) ';

    try{
        const results = await database.query(sql, [entities_id, addressObj.address_name, addressObj.address_name, addressObj.address,
                            addressObj.city, addressObj.state, addressObj.zip, entities_id]);
        logger.info("addAndSaveAddress " + addressObj );
        res.json(results[1]);
    }
    catch(error){
        logger.error("Tasks (addAndSaveAddress): " + error);
        res.sendStatus(400);
    }
});

router.post('/copyTaskForNewType', async (req,res) => {
    var t_id, new_type;
    if(req.body){
        t_id = req.body.t_id;
        new_type = req.body.new_type;
    }
    if(new_type == null){
        res.sendStatus(400);
        logger.error("No new type in copyTaskForNewType");
        return;
    }

    //copy task and give it new type
    const sql = ' INSERT INTO tasks (id_history, name, id_users_entered, description, hours_estimate, date_entered, date_desired, date_assigned, order_assigned, ' + 
    '  id_task_types, table_id, id_time_tracker_category, date_completed, company, priority_order, drilling, sign, artwork, order_date, ' +
    ' first_game, account_id, work_type, install_location, notes, task_status, task_list_id, type  ) ' +
    ' SELECT id_history, name, id_users_entered, description, hours_estimate, date_entered, date_desired, date_assigned, order_assigned, ' + 
    '  id_task_types, table_id, id_time_tracker_category, date_completed, company, priority_order, drilling, sign, artwork, order_date, ' +
    ' first_game, account_id, work_type, install_location, notes, task_status, task_list_id, ? as type FROM tasks WHERE id = ? ';

    try{
        const results = await database.query(sql, [new_type, t_id]);
        logger.info("copyTaskForNewType " + t_id + ' new type: ' + new_type );
        res.json(results);
    }
    catch(error){
        logger.error("Tasks (copyTaskForNewType): " + error);
        res.sendStatus(400);
    }
});




module.exports = router;