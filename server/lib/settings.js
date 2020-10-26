const express = require('express');
var async = require("async");

const router = express.Router();

const logger = require('../../logs');
//Handle Database
const database = require('./db');

router.get('/getRaineyUsers', async (req,res) => {
    const sql = ' SELECT user_id, name, initials  ' + 
    ' FROM users ' +
    ' ORDER BY user_id ASC ' +
    'limit 1000';
   try{
     const results = await database.query(sql, []);
     logger.info("Got Rainey Users ");
     res.json(results);
   }
   catch(error){
     logger.error("Settings (getRaineyUsers): " + error);
     res.sendStatus(400);
   }
 });

 router.get('/getEntities', async (req,res) => {
    const sql = ' SELECT record_id, name, company, entities_types_id, county_or_parish, city, state   ' + 
      ' FROM entities ' +
      ' ORDER BY name ASC ';
    try{
      const results = await database.query(sql, []);
      logger.info("Got Entities ");
      res.json(results);
    }

    catch(error){
      logger.error("Settings (getEntities): " + error);
      res.sendStatus(400);
    }
});

router.post('/getEntitiesSearch', async (req,res) => {
  var query;
  if(req.body){
    if(req.body.query != null){
        query = "%" + req.body.query + "%";
    }else{
        query = "%";
    }
  }

  const sql = ' SELECT record_id, name, company, entities_types_id, county_or_parish, city, state ' + 
  ' FROM entities ' +
  ' WHERE name like ? ';

  try{
      const results = await database.query(sql, [query]);
      logger.info("Got Entity Search " + query );
      res.json(results);
  }
  catch(error){
      logger.error("Settings (getEntitiesSearch): " + error);
      res.sendStatus(400);
  }
});


router.post('/getEntityNameById', async (req,res) => {
  var id;
  if(req.body){
      id = req.body.id;
  }

  const sql = ' SELECT name   ' + 
  ' FROM entities ' +
  ' WHERE record_id = ? ';

  try{
      const results = await database.query(sql, id);
      logger.info("Got Entity " + id );
      res.json(results);
  }
  catch(error){
      logger.error("Settings (getEntityNameById): " + error);
      res.sendStatus(400);
  }
});

// router.post('/updateTaskList', async (req,res) => {
//     var taskList;
//     if(req.body){
//     taskList = req.body.taskList;
//     }

//     const sql = ' UPDATE task_list SET list_name = ? ' +
//     ' WHERE id = ? ';

//     const params = [taskList.list_name, taskList.id ];

//     try{
//         const results = await database.query(sql, params);
//         logger.info("Update TaskList " + taskList.id );
//         res.sendStatus(200);
//     }
//     catch(error){
//         logger.error("TasksList (updateTaskList): " + error);
//         res.sendStatus(400);
//     }
// });


module.exports = router;