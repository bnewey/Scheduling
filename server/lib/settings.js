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

 router.get('/getGoogleUsers', async (req,res) => {
  const sql = ' SELECT id, googleId AS user_id, displayName AS name, email  ' + 
  ' FROM google_users ' +
  ' ORDER BY user_id ASC ' +
  'limit 1000';
 try{
   const results = await database.query(sql, []);
   logger.info("Got Rainey Users ");
   res.json(results);
 }
 catch(error){
   logger.error("Settings (getGoogleUsers): " + error);
   res.sendStatus(400);
 }
});

 router.get('/getEntities', async (req,res) => {
    const sql = ' SELECT record_id, name, company, entities_types_id, county_or_parish, city, state, on_hold  ' + 
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

  const sql = ' SELECT record_id, name, company, entities_types_id, county_or_parish, city, state, on_hold ' + 
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
  var name, user_id, filterAndOr, filterInOrOut, filters, task_view;
  if(req.body){
    name = req.body.name;
    user_id = req.body.user_id;
    filterAndOr = req.body.filterAndOr;
    filterInOrOut = req.body.filterInOrOut;
    filters = req.body.filters;
    task_view = req.body.task_view;
  }
  if(!name, !user_id, !filters){
    logger.error("Bad params in addSavedTaskFilter")
    res.sendStatus(400);
  }

  const sql = ' INSERT INTO task_user_filters (user_id, and_or, in_out, filter_json, name, task_view ) ' +
    ' VALUES (?,?,?,?,?, IFNULL(?, DEFAULT(task_view) )) ';
  try{
    const results = await database.query(sql, [user_id, filterAndOr, filterInOrOut, JSON.stringify(filters), name, task_view]);
    logger.info("Added task_user_filter ");
    res.json(results);
  }

  catch(error){
    logger.error("Settings (addSavedTaskFilter): " + error);
    res.sendStatus(400);
  }
});

router.post('/overwriteSavedTaskFilter', async (req,res) => {
  var filter_id, name, user_id, filterAndOr, filterInOrOut, filters;
  if(req.body){
    filter_id = req.body.filter_id;
    name = req.body.name;
    user_id = req.body.user_id;
    filterAndOr = req.body.filterAndOr;
    filterInOrOut = req.body.filterInOrOut;
    filters = req.body.filters;
  }
  if(!filter_id, !name, !user_id, !filters){
    logger.error("Bad params in overwriteSavedTaskFilter")
    res.sendStatus(400);
  }

  const sql = ' UPDATE task_user_filters SET user_id=?, and_or=?, in_out=?, filter_json=?, name=? ' +
    ' WHERE id = ? ';
  try{
    const results = await database.query(sql, [user_id, filterAndOr, filterInOrOut, JSON.stringify(filters), name, filter_id ]);
    logger.info("Overwrote task_user_filter ");
    res.json(results);
  }

  catch(error){
    logger.error("Settings (overwriteSavedTaskFilter): " + error);
    res.sendStatus(400);
  }
});

// router.post('/updateFilterTaskViewSubscribe', async (req,res) => {
//   var filter_id, sub_types;
//   if(req.body){
//     filter_id = req.body.filter_id;
//     sub_types = req.body.sub_types;
//   }
//   if(!filter_id){
//     logger.error("Bad params in updateFilterTaskViewSubscribe")
//     res.sendStatus(400);
//   }

//   let subscribed_types;
//   if(sub_types && Array.isArray(sub_types) && sub_types.length > 0){
//     subscribed_types = sub_types.reduce((acc, current,i)=> {
//       return current.checked ? acc += (acc.length > 0 ? ',' : '') + current.type  : acc ;
//     }, "")
//   }else{
//     subscribed_types = "";
//   }

//   logger.info("Test", [subscribed_types]);
  

//   const sql = ' UPDATE task_user_filters SET subscribed_types = ?' +
//     ' WHERE id = ? ';
//   try{
//     const results = await database.query(sql, [ subscribed_types, filter_id ]);
//     logger.info("Updated sub types task_user_filter ");
//     res.json(results);
//   }

//   catch(error){
//     logger.error("Settings (updateFilterTaskViewSubscribe): " + error);
//     res.sendStatus(400);
//   }
// });

router.post('/updateFilterTaskViewTie', async (req,res) => {
  var filter_id, task_view;
  if(req.body){
    filter_id = req.body.filter_id;
    task_view = req.body.task_view;
  }
  if(!filter_id, isNaN(task_view)){
    logger.error("Bad params in updateFilterTaskViewTie")
    res.sendStatus(400);
  }

  const sql = ' UPDATE task_user_filters SET task_view=? ' +
    ' WHERE id = ? ';
  try{
    const results = await database.query(sql, [ task_view, filter_id ]);
    logger.info("Update task_user_filter task_view ");
    res.json(results);
  }

  catch(error){
    logger.error("Settings (updateFilterTaskViewTie): " + error);
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


router.post('/addNotificationSetting', async (req,res) => {
  var setting;
  if(req.body){
    setting = req.body.setting;
   
  }
  if(!setting){
    logger.error("Bad params in addNotificationSetting")
    res.sendStatus(400);
  }

  const sql = ' INSERT INTO user_notifications_settings ( googleId, setting, push, notify, email ) ' +
    ' VALUES ( ? , ? , IFNULL(?, DEFAULT(push)) , IFNULL(?, DEFAULT(notify)) , IFNULL(?, DEFAULT(email))) ';
  try{
    const results = await database.query(sql, [ setting.googleId, setting.setting, setting.push, setting.notify, setting.email ]);
    logger.info("Added  user_notifications_settings");
    res.json(results);
  }

  catch(error){
    logger.error("Settings (addNotificationSetting): " + error);
    res.sendStatus(400);
  }
});

router.post('/updateNotificationSetting', async (req,res) => {
  var setting;
  if(req.body){
    setting = req.body.setting;
   
  }
  if(!setting){
    logger.error("Bad params in updateNotificationSetting")
    res.sendStatus(400);
  }

  const sql = ' UPDATE user_notifications_settings SET push=?, notify=? , email=? WHERE id=? ';
  try{
    const results = await database.query(sql, [ setting.push, setting.notify, setting.email, setting.id ]);
    logger.info("Updated  user_notifications_settings");
    res.json(results);
  }

  catch(error){
    logger.error("Settings (updateNotificationSetting): " + error);
    res.sendStatus(400);
  }
});


router.post('/getNotificationSettings', async (req,res) => {
  var googleId, page;
  if(req.body){
    googleId = req.body.googleId;
    page = req.body.page;
   
  }

  var sql, params;

  if(page){
    sql = ' SELECT ns.*, nss.id as setting_id, nss.name, nss.description, nss.page  FROM user_notifications_settings_settings nss ' + 
          ' LEFT JOIN user_notifications_settings ns ON nss.id = ns.setting AND ns.googleId = ? ' + 
          '  WHERE nss.page = ? ';
    params = [googleId, page]
  }else{
    sql = ' SELECT ns.*,nss.id as setting_id, nss.name, nss.description, nss.page  FROM user_notifications_settings_settings nss ' + 
          ' LEFT JOIN user_notifications_settings ns ON nss.id = ns.setting AND ns.googleId = ? ';
    params = [googleId]
  }


  try{
    const results = await database.query(sql, params);
    logger.info("Got  getNotificationSettings");
    res.json(results);
  }

  catch(error){
    logger.error("Settings (getNotificationSettings): " + error);
    res.sendStatus(400);
  }
});

module.exports = router;