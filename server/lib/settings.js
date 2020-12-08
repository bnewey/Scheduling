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


router.post('/getPastScoreboardParams', async (req,res) => {
  var column;
  if(req.body){
    column = req.body.column;
  }


  const sql = ' SELECT DISTINCT ??   ' + 
  ' FROM work_orders_items WHERE ?? is not null ORDER BY ?? desc ';

  try{
      const results = await database.query(sql, [column,column,column]);
      logger.info("Got Past Scbd Param. Column: " +  column);
      res.json(results);
  }
  catch(error){
      logger.error("Settings (getPastScoreboardParams): " + error);
      res.sendStatus(400);
  }
});


router.post('/getTaskUserFilters', async (req,res) => {
  var user_id;
  if(req.body){
    user_id = req.body.user_id;
  }

  if(!user_id){
    logger.error("No user_id provided to getTaskUserFilters")
    res.sendStatus(400);
  }

  const sql = ' SELECT *  ' + 
    ' FROM task_user_filters ' +
    ' WHERE user_id = ? ';
  try{
    const results = await database.query(sql, [user_id]);
    logger.info("Got task_user_filters ");
    res.json(results);
  }

  catch(error){
    logger.error("Settings (getTaskUserFilters): " + error);
    res.sendStatus(400);
  }
});

router.post('/addSavedTaskFilter', async (req,res) => {
  var name, user_id, filterAndOr, filterInOrOut, filters;
  if(req.body){
    name = req.body.name;
    user_id = req.body.user_id;
    filterAndOr = req.body.filterAndOr;
    filterInOrOut = req.body.filterInOrOut;
    filters = req.body.filters;
  }
  if(!name, !user_id, !filters){
    logger.error("Bad params in addSavedTaskFilter")
    res.sendStatus(400);
  }

  const sql = ' INSERT INTO task_user_filters (user_id, and_or, in_out, filter_json, name ) ' +
    ' VALUES (?,?,?,?,?) ';
  try{
    const results = await database.query(sql, [user_id, filterAndOr, filterInOrOut, JSON.stringify(filters), name ]);
    logger.info("Added task_user_filter ");
    res.json(results);
  }

  catch(error){
    logger.error("Settings (addSavedTaskFilter): " + error);
    res.sendStatus(400);
  }
});

router.post('/removedSavedFilter', async (req,res) => {
  var filter_id;
  if(req.body){
    filter_id = req.body.filter_id;
    
  }
  if(!filter_id){
    logger.error("Bad params in removedSavedFilter")
    res.sendStatus(400);
  }

  const sql = ' DELETE FROM task_user_filters  ' +
    ' WHERE id = ? LIMIT 1 ';
  try{
    const results = await database.query(sql, [ filter_id ]);
    logger.info("Removed task_user_filter " + filter_id);
    res.json(results);
  }

  catch(error){
    logger.error("Settings (removedSavedFilter): " + error);
    res.sendStatus(400);
  }
});


module.exports = router;