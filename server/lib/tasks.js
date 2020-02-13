const express = require('express');
const router = express.Router();

const logger = require('../../logs');
//Handle Database
const database = require('./db');

router.get('/getAllTasks', async (req,res) => {
    const sql = ' SELECT DISTINCT t.id AS t_id, t.name AS t_name, hours_estimate, date_format(date_desired, \'%Y-%m-%d %H:%i:%S\') as date_desired, date_format(date_assigned, \'%Y-%m-%d\') as date_assigned, ' + 
    ' date_format(date_completed, \'%Y-%m-%d\') as date_completed, t.description, t.priority_order, t.task_list_id, t.task_status, t.drilling, t.sign, t.artwork, t.table_id, date_format(t.order_date, \'%Y-%m-%d\') as order_date, t.first_game, wo.type, t.install_location, ' +
    ' t.delivery_crew, t.delivery_order,t.install_order, t.install_crew, ea.name AS address_name, ea.address, ea.city, ea.state, ea.zip, ea.lat, ea.lng, ea.geocoded '  +
    ' FROM tasks t ' +
    ' LEFT JOIN work_orders wo ON t.table_id = wo.record_id ' +
    ' LEFT JOIN entities_addresses ea ON (wo.account_id = ea.entities_id AND main = 1)' +
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

    const sql = ' SELECT DISTINCT t.id AS t_id, t.name AS t_name, hours_estimate, date_format(date_desired, \'%Y-%m-%d %H:%i:%S\') as date_desired, ' +
    ' date_format(date_assigned, \'%Y-%m-%d %H:%i:%S\') as date_assigned, date_format(date_completed, \'%Y-%m-%d %H:%i:%S\') as date_completed, ' + 
    ' t.description, t.notes, t.priority_order, t.task_list_id, t.task_status, t.drilling, t.sign, t.artwork, t.table_id,  ' + 
    ' date_format(t.order_date, \'%Y-%m-%d %H:%i:%S\') as order_date, t.first_game, wo.type, t.install_location, ' +
    ' t.delivery_crew, t.delivery_order, date_format(delivery_date, \'%Y-%m-%d %H:%i:%S\') as delivery_date,t.install_order, ' + 
    ' t.install_crew, date_format(install_date, \'%Y-%m-%d %H:%i:%S\') as install_date, ea.name AS address_name, ea.address, ea.city, ea.state, ' + 
    ' ea.zip, ea.lat, ea.lng, ea.geocoded '  +
    ' FROM tasks t ' +
    ' LEFT JOIN work_orders wo ON t.table_id = wo.record_id '  +
    ' LEFT JOIN entities_addresses ea ON (wo.account_id = ea.entities_id AND main = 1) WHERE t.id = ? ';

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
    var id;
    if(req.body){
    task = req.body.task;
    }

    logger.info(JSON.stringify(task));


    const sql = ' UPDATE tasks SET name = ? , hours_estimate= ? , date_desired=date_format( ? , \'%Y-%m-%d %H:%i:%S\') , date_assigned=date_format( ? , \'%Y-%m-%d %H:%i:%S\') , ' + 
    ' date_completed=date_format( ? , \'%Y-%m-%d %H:%i:%S\') , description= ? , notes= ? , ' +
    ' task_status= ?, drilling= ? , sign= ? , artwork= ?  , delivery_crew= ? , ' + 
    ' delivery_order= ? , delivery_date=date_format( ? , \'%Y-%m-%d %H:%i:%S\'), install_crew= ? , install_date=date_format( ? , \'%Y-%m-%d %H:%i:%S\') , install_order= ? ' +
    ' WHERE id = ? ';

    const params = [task.t_name, task.hours_estimate, task.date_desired, task.date_assigned, task.date_completed, task.description, task.notes, 
    task.task_status, task.drilling, task.sign, task.artwork, task.delivery_crew,
    task.delivery_order, task.delivery_date, task.install_crew, task.install_date, task.install_order , task.t_id ];
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

router.post('/saveCoordinates', async (req,res) => {
    var t_id, coordinates;
    if(req.body){
        t_id = req.body.t_id;
        coordinates = req.body.coordinates;
    }
 

    const sql = ' UPDATE entities_addresses ea ' + 
    ' INNER JOIN work_orders wo ON wo.account_id = ea.entities_id ' +
    ' INNER JOIN tasks t ON t.table_id = wo.record_id ' +
    ' SET ea.geocoded = 1, ea.lat = ?, ea.lng = ? ' +
    ' WHERE t.id = ? AND ea.geocoded = 0';

    const params = [coordinates.lat, coordinates.lng, t_id ];

    try{
    const results = await database.query(sql, params);
    logger.verbose("Saved Entity Address Coord from task" + t_id );
    res.sendStatus(200);
    }
    catch(error){
    logger.error("Saved Entity Address (saveCoord): " + error);
    res.sendStatus(400);
    }
});





module.exports = router;