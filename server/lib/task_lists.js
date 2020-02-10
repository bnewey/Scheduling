const express = require('express');
var async = require("async");

const router = express.Router();

const logger = require('../../logs');
//Handle Database
const database = require('./db');

router.get('/getAllTaskLists', async (req,res) => {
    const sql = ' SELECT DISTINCT id, list_name, date_format(date_entered, \'%Y-%m-%d %H:%i:%S\') as date_entered ' + 
    ' FROM task_list ' +
    ' ORDER BY id DESC ' +
    'limit 1000';
   try{
     const results = await database.query(sql, []);
     logger.info("Got TaskLists ");
     res.json(results);
   }
   catch(error){
     logger.error("TaskLists (getAllLists): " + error);
     res.sendStatus(400);
   }
 });

router.post('/getTaskList', async (req,res) => {
    var id;
    if(req.body){
        id = req.body.id;
    }

    const sql =    
     'SELECT tl.id as tl_id, tl.list_name as tl_name, date_format(tl.date_entered, \'%Y-%m-%d %H:%i:%S\') as tl_date_entered ,  ' + 
        ' t.id AS t_id, t.name AS t_name, t.task_list_id, t.hours_estimate, ' + 
        ' date_format(t.date_desired, \'%Y-%m-%d %H:%i:%S\') as date_desired, ' +
        ' date_format(t.date_assigned, \'%Y-%m-%d %H:%i:%S\') as date_assigned, date_format(t.date_completed, \'%Y-%m-%d %H:%i:%S\') as date_completed, ' + 
        ' t.description, t.notes, t.priority_order, t.task_status, t.drilling, t.sign, t.artwork, t.table_id,  ' + 
        ' date_format(t.order_date, \'%Y-%m-%d %H:%i:%S\') as order_date, t.first_game, t.work_type, t.install_location, ' +
        ' t.delivery_crew, t.delivery_order, date_format(t.delivery_date, \'%Y-%m-%d %H:%i:%S\') as delivery_date,t.install_order, ' + 
        ' t.install_crew, date_format(t.install_date, \'%Y-%m-%d %H:%i:%S\') as install_date, ea.name AS address_name, ea.address, ea.city, ea.state, ' + 
        ' ea.zip, ea.lat, ea.lng, ea.geocoded '  +
    ' FROM tasks t  ' +
    ' LEFT JOIN task_list tl ON tl.id = t.task_list_id ' + 
    ' LEFT JOIN entities_addresses ea ON (t.account_id = ea.entities_id AND main = 1) ' +
    ' WHERE t.task_list_id = ? ORDER BY t.priority_order ASC' ;

    try{
        const results = await database.query(sql, id);
        logger.info("Got TaskList " + id );
        res.json(results);
    }
    catch(error){
        logger.error("TasksList (getTaskList): " + error);
        res.sendStatus(400);
    }
});

router.post('/removeTaskList', async (req,res) => {
    const sql = 'DELETE FROM task_list WHERE id = ? LIMIT 1';
    var id;
    if(req.body){
        id = req.body.id;
    }
    
    try{
        const results = await database.query(sql, id);
        logger.info("Deleted TaskList " + id);
        res.sendStatus(200);
    }
    catch(error){
        logger.error("TasksList (removeTaskList): " + error);
        res.sendStatus(400);
    }
});

router.post('/addTaskList', async (req,res) => {
    const sql = 'INSERT INTO task_list (list_name) VALUES (?) ; SELECT LAST_INSERT_ID() as last_id ;';
    var list_name;
    if(req.body){
        list_name = req.body.list_name;
        if(!list_name){
            list_name = "New List";
        }
    }
    
    try{
        const last_id_results = await database.query(sql, list_name);
        logger.info("Added TaskList " + list_name);
        res.json(last_id_results[1]);
    }
    catch(error){
        logger.error("TasksList (addTaskList): " + error);
        res.sendStatus(400);
    }
});

router.post('/updateTaskList', async (req,res) => {
    var taskList;
    if(req.body){
    taskList = req.body.taskList;
    }

    logger.info(JSON.stringify(taskList));


    const sql = ' UPDATE task_list SET list_name = ? ' +
    ' WHERE id = ? ';

    const params = [taskList.list_name, taskList.id ];

    try{
    const results = await database.query(sql, params);
    logger.info("Update TaskList " + taskList.id );
    res.sendStatus(200);
    }
    catch(error){
    logger.error("TasksList (updateTaskList): " + error);
    res.sendStatus(400);
    }
});

router.post('/addTasktoList', async (req,res) => {
    var task_id, taskList_id;
    if(req.body){
    task_id = req.body.id;
    taskList_id = req.body.tl_id;
    }

    const sql_select = ' select max(priority_order) AS max_priority from tasks where task_list_id = ? ' ; 

    const sql = ' UPDATE tasks SET task_list_id = ?, priority_order = ? ' +
    ' WHERE id = ? ';

    try{
    const select_results = await database.query(sql_select, taskList_id);
    const max_priority = select_results[0]["max_priority"] + 1;
    const results = await database.query(sql, [taskList_id, max_priority, task_id]);
    logger.info("Add Task: " + task_id +" to TaskList with priority: " + max_priority);
    res.sendStatus(200);
    }
    catch(error){
    logger.error("TasksList (addTaskToList): " + error);
    res.sendStatus(400);
    }
});

router.post('/addMultipleTaskstoList', async (req,res) => {
    var taskList_id, task_ids;
    if(req.body){
        taskList_id = req.body.tl_id;
        task_ids = req.body.ids;
    }

    const sql_select = ' select max(priority_order) AS max_priority from tasks where task_list_id = ? ' ; 

    //Update tasks normally except if task is already in TaskList
    const sql = ' UPDATE tasks SET task_list_id = ?, priority_order = ? ' +
    ' WHERE id = ? AND  (task_list_id is NULL OR task_list_id <> ? ) ';

    var select_results;
    try{
        select_results = await database.query(sql_select, taskList_id);
    }catch(error){
        throw error;
    }

    async.forEachOf(task_ids, async (id, i, callback) => {
        //will automatically call callback after successful execution
        try{
            const priority = select_results[0]["max_priority"] ? select_results[0]["max_priority"] + 1 + i  :   i+1;
            const results = await database.query(sql, [taskList_id, priority, id, taskList_id]);
            return;
        }
        catch(error){     
            //callback(error);         
            throw error;                 
        }
    }, err=> {
        if(err){
            logger.error("TasksList (addMultipleTaskList): " + err);
            res.sendStatus(400);
        }else{
            logger.info("Add Tasks: " + JSON.stringify(task_ids) + "to Task List: " + taskList_id);
            res.sendStatus(200);
        }
    })
});

router.post('/removeTaskFromList', async (req,res) => {
    var task_id;
    if(req.body){
    task_id = req.body.id;
    }
    //we need to reorder priority_order in the list

    const sql = ' UPDATE tasks SET task_list_id = NULL ' +
    ' WHERE id = ? ';

    try{
    const results = await database.query(sql, task_id);
    logger.info("Remove Task: " + task_id +" from TaskList ");
    res.sendStatus(200);
    }
    catch(error){
    logger.error("TasksList (removeTaskFromList): " + error);
    res.sendStatus(400);
    }
});

router.post('/reorderTaskList', async (req,res) => {
    var taskList_id, task_ids;
    if(req.body){
        taskList_id = req.body.tl_id;
        task_ids = req.body.ids;
    }
    
    const sql = ' UPDATE tasks SET priority_order = ? ' +
    ' WHERE id = ? AND task_list_id = ?';

    async.forEachOf(task_ids, async (id, i, callback) => {
        //will automatically call callback after successful execution
        try{
            const results = await database.query(sql, [i+1, id, taskList_id]);
            return;
        }
        catch(error){     
            //callback(error);         
            throw error;                 
        }
    }, err=> {
        if(err){
            logger.error("TasksList (reorderTaskList): " + err);
            res.sendStatus(400);
        }else{
            logger.info("Reorder TaskList: " + taskList_id);
            res.sendStatus(200);
        }
    })
});



module.exports = router;