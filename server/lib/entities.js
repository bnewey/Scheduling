const express = require('express');
const router = express.Router();
var async = require("async");

const logger = require('../../logs');

const Util = require('../../js/Util');
//Handle Database
const database = require('./db');


router.post('/getAllEntities', async (req,res) => {

    const sql = ' SELECT * FROM entities ' +
    ' WHERE company = 2 AND name IS NOT NULL ORDER BY name ASC';

    try{
        const results = await database.query(sql, []);
        logger.info("Got Entities for Scheduler");
        res.json(results);

    }
    catch(error){
        logger.error("Entities getAllEntities " + error);
        res.sendStatus(400);
    }
});

router.post('/searchAllEntities', async (req,res) => {

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

    const sql = 'SELECT * FROM entities '+
    ' WHERE ?? like ? AND company = 2 ';

    try{
        const results = await database.query(sql, [table, search_query]);
        logger.info("Got Entities by search", [table, search_query]);
        res.json(results);

    }
    catch(error){
        logger.error("Search Entities: " + error);
        res.sendStatus(400);
    }
});


router.post('/getEntityById', async (req,res) => {
    var ent_id;

    if(req.body){
        ent_id = req.body.ent_id;
    }

    const sql = ' SELECT e.*, et.name AS entities_types FROM entities e ' +
    ' LEFT JOIN entities_types et ON e.entities_types_id = et.record_id ' + 
    ' WHERE e.record_id = ? ';

    try{
        const results = await database.query(sql, [ent_id]);
        logger.info("Got Entity "+ent_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities getEntityById " + error);
        res.sendStatus(400);
    }
});

router.post('/updateEntity', async (req,res) => {
    var entity;

    if(req.body){
        entity = req.body.entity;
    }
    if(!entity){
        logger.error("Bad entity param in updateEntity");
        res.sendStatus(400);
    }

    const sql = ' UPDATE entities SET name = ?, company = IFNULL(? , 2 ), other_organization =?, account_number=?,purchase_order_required=?, purchase_order=?, ' +
    ' notes=?, county_or_parish=?, entities_types_id=?, class=?, prepayment_required=?, phone=?, fax=?, website=?, shipping=?, billing=?, mailing=?, ' +
    ' city = ?, state=? ' +
    ' WHERE record_id = ? ';

    try{
        const results = await database.query(sql, [entity.name, entity.company, entity.other_organization, entity.account_number,
                entity.purchase_order_required, entity.purchase_order, entity.notes, entity.county_or_parish, entity.entities_types_id,
                 entity.class, entity.prepayment_required, entity.phone, entity.fax, entity.website, entity.shipping, entity.billing,
                  entity.mailing, entity.city, entity.state, entity.record_id]);

        logger.info("Update Entity " + entity.record_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities updateEntity " + error);
        res.sendStatus(400);
    }
});

router.post('/addEntity', async (req,res) => {
    var entity;

    if(req.body){
        entity = req.body.entity;
    }
    if(!entity){
        logger.error("Bad entity param in addEntity");
        res.sendStatus(400);
    }

    const sql = ' INSERT INTO entities (name, company, other_organization, account_number, purchase_order_required, purchase_order, ' + 
    ' notes, county_or_parish, entities_types_id, class, prepayment_required, phone, fax, website, shipping, billing, mailing, ' + 
    ' city, state)  VALUES (?, IFNULL(? , 2 ), ?, ?,?, ?, ?, ?,?,?, ?, ?, ?,?, IFNULL(? ,DEFAULT(shipping)), IFNULL(? ,DEFAULT(billing)), IFNULL(? ,DEFAULT(mailing)) ,?, ?) ';

    try{
        const results = await database.query(sql, [entity.name, entity.company, entity.other_organization, entity.account_number,
                entity.purchase_order_required, entity.purchase_order, entity.notes, entity.county_or_parish, entity.entities_types_id,
                 entity.class, entity.prepayment_required, entity.phone, entity.fax, entity.website, entity.shipping, entity.billing,
                  entity.mailing, entity.city, entity.state]);
                  
        logger.info("Added Entity");
        res.json(results);

    }
    catch(error){
        logger.error("Entities addEntity " + error);
        res.sendStatus(400);
    }
});

router.post('/deleteEntity', async (req,res) => {
    var ent_id;

    if(req.body){
        ent_id = req.body.ent_id;
    }
    if(!ent_id){
        logger.error("Bad ent_id param in deleteEntity");
        res.sendStatus(400);
    }

    const sql = ' DELETE FROM entities_address WHERE record_id = ? LIMIT 1 ';

    try{
        const results = await database.query(sql, [ent_id]);

        logger.info("Deleted Entities " + ent_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities deleteEntity " + error);
        res.sendStatus(400);
    }
});



router.post('/getEntityTypes', async (req,res) => {

    const sql = ' SELECT * from entities_types ';

    try{
        const results = await database.query(sql, []);
        logger.info("Got Entitie Types");
        res.json(results);

    }
    catch(error){
        logger.error("Entities getEntityTypes " + error);
        res.sendStatus(400);
    }
});

router.post('/getEntAddresses', async (req,res) => {
    var ent_id;

    if(req.body){
        ent_id = req.body.ent_id;
    }

    const sql = ' SELECT * from entities_addresses WHERE entities_id = ? ';

    try{
        const results = await database.query(sql, [ent_id]);
        logger.info("Got Entities Addresses for id" + ent_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities getEntAddresses " + error);
        res.sendStatus(400);
    }
});


router.post('/updateEntityAddress', async (req,res) => {
    var ent_add;

    if(req.body){
        ent_add = req.body.ent_add;
    }
    if(!ent_add){
        logger.error("Bad ent_add param in updateEntity");
        res.sendStatus(400);
    }

    const sql_resetmain = ' UPDATE entities_addresses SET main = 0 WHERE entities_id = ? ';

    const sql = ' UPDATE entities_addresses SET main =  IFNULL(? ,DEFAULT(main)), shipping =  IFNULL(? ,DEFAULT(shipping)), billing =  IFNULL(? ,DEFAULT(billing)), ' + 
    ' mailing =  IFNULL(? ,DEFAULT(mailing)), entities_id = ?, name = ?, to_name = ?, address = ?, address2 = ?, city = ?, ' + 
    ' state = ?, zip = ?, residence = ?, lat =  IFNULL(? ,0), lng =  IFNULL(? ,0), geocoded =  IFNULL(? ,0), task =  IFNULL(? ,DEFAULT(task)) ' +
    ' WHERE record_id = ? ';

    try{
        if(ent_add.main == 1){
            //we need to set all other address' main to 0 if were setting this one to main
            const results_main = await database.query(sql_resetmain, [ent_add.entities_id])
        }
        const results = await database.query(sql, [ent_add.main, ent_add.shipping, ent_add.billing, ent_add.mailing, ent_add.entities_id,
             ent_add.name, ent_add.to_name, ent_add.address, ent_add.address2, ent_add.city, ent_add.state, ent_add.zip,
              ent_add.residence, ent_add.lat, ent_add.lng, ent_add.geocoded, ent_add.task, ent_add.record_id]);

        logger.info("Updated Entities Address " + ent_add.record_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities updateEntityAddress " + error);
        res.sendStatus(400);
    }
});

router.post('/addEntityAddress', async (req,res) => {
    var ent_add;

    if(req.body){
        ent_add = req.body.ent_add;
    }
    if(!ent_add){
        logger.error("Bad ent_add param in addEntity");
        res.sendStatus(400);
    }
    const sql_resetmain = ' UPDATE entities_addresses SET main = 0 WHERE entities_id = ? ';
    const sql = ' INSERT INTO entities_addresses (main, shipping, billing, mailing, entities_id, name, to_name, address, address2, city, ' + 
    ' state, zip, residence, lat, lng, geocoded, task ) ' + 
    ' VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,IFNULL(? ,0),IFNULL(? ,0),IFNULL(? ,0),?) ';

    try{
        if(ent_add.main == 1){
            //we need to set all other address' main to 0 if were setting this one to main
            const results_main = await database.query(sql_resetmain, [ent_add.entities_id])
        }
        const results = await database.query(sql, [ent_add.main, ent_add.shipping, ent_add.billing, ent_add.mailing, ent_add.entities_id,
            ent_add.name, ent_add.to_name, ent_add.address, ent_add.address2, ent_add.city, ent_add.state, ent_add.zip,
             ent_add.residence, ent_add.lat, ent_add.lng, ent_add.geocoded, ent_add.task]);
                  
        logger.info("Added Entity Address");
        res.json(results);

    }
    catch(error){
        logger.error("Entities addEntityAddress " + error);
        res.sendStatus(400);
    }
});

router.post('/deleteEntityAddress', async (req,res) => {
    var ent_add_id;

    if(req.body){
        ent_add_id = req.body.ent_add_id;
    }
    if(!ent_add_id){
        logger.error("Bad ent_add_id param in deleteEntityAddress");
        res.sendStatus(400);
    }

    const sql = ' DELETE FROM entities_address WHERE record_id = ? LIMIT 1 ';

    try{
        const results = await database.query(sql, [ent_add_id]);

        logger.info("Deleted Entities Address " + ent_add_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities deleteEntityAddress " + error);
        res.sendStatus(400);
    }
});



module.exports = router;