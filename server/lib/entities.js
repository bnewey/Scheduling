const express = require('express');
const router = express.Router();
var async = require("async");

const logger = require('../../logs');

const Util = require('../../js/Util');
const {checkPermission} = require('../util/util');
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

    const sql = ' SELECT e.*, et.name AS entities_types,ec_shipping.name AS shipping_name,  ' + 
    ' ec_billing.name AS billing_name, ec_mailing.name AS mailing_name FROM entities e ' +
    ' LEFT JOIN entities_types et ON e.entities_types_id = et.record_id ' + 
    ' LEFT JOIN entities_contacts ec_shipping ON e.shipping = ec_shipping.record_id ' +
    ' LEFT JOIN entities_contacts ec_billing ON e.billing = ec_billing.record_id ' +
    ' LEFT JOIN entities_contacts ec_mailing ON e.mailing = ec_mailing.record_id ' +
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
    var entity, user;

    if(req.body){
        entity = req.body.entity;
        user = req.body.user;
    }
    if(!entity){
        logger.error("Bad entity param in updateEntity");
        res.sendStatus(400);
        return;
    }
    
    if(user && !checkPermission(user.permissions, 'entities') && !user.isAdmin){
        logger.error("Bad permission", [user]);
        res.sendStatus(400);
        return;
    }

    const sql = ' UPDATE entities SET name = ?, company = IFNULL(? , 2 ), other_organization =?, account_number=?,purchase_order_required=?, purchase_order=?, ' +
    ' notes=?, county_or_parish=?, entities_types_id=?, class=?, prepayment_required=?, phone=?, fax=?, website=?, shipping=?, billing=?, mailing=?, ' +
    ' city = ?, state=?, on_hold=? ' +
    ' WHERE record_id = ? ';

    try{
        const results = await database.query(sql, [entity.name, entity.company, entity.other_organization, entity.account_number,
                entity.purchase_order_required, entity.purchase_order, entity.notes, entity.county_or_parish, entity.entities_types_id,
                 entity.class, entity.prepayment_required, entity.phone, entity.fax, entity.website, entity.shipping, entity.billing,
                  entity.mailing, entity.city, entity.state, entity.on_hold, entity.record_id]);

        logger.info("Update Entity " + entity.record_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities updateEntity " + error);
        res.sendStatus(400);
    }
});

router.post('/addEntity', async (req,res) => {
    var entity, user;

    if(req.body){
        entity = req.body.entity;
        user = req.body.user;
    }
    if(!entity){
        logger.error("Bad entity param in addEntity");
        res.sendStatus(400);
    }
    if(user && !checkPermission(user.permissions, 'entities') && !user.isAdmin){
        logger.error("Bad permission", [user]);
        res.sendStatus(400);
        return;
    }
    

    const sql = ' INSERT INTO entities (name, company, other_organization, account_number, purchase_order_required, purchase_order, ' + 
    ' notes, county_or_parish, entities_types_id, class, prepayment_required, phone, fax, website, shipping, billing, mailing, ' + 
    ' city, state, on_hold)  VALUES (?, IFNULL(? , 2 ), ?, ?,?, ?, ?, ?,?,?, ?, ?, ?,?, IFNULL(? ,DEFAULT(shipping)), IFNULL(? ,DEFAULT(billing)), IFNULL(? ,DEFAULT(mailing)) ,?, ?, ?) ';

    try{
        const results = await database.query(sql, [entity.name, entity.company, entity.other_organization, entity.account_number,
                entity.purchase_order_required, entity.purchase_order, entity.notes, entity.county_or_parish, entity.entities_types_id,
                 entity.class, entity.prepayment_required, entity.phone, entity.fax, entity.website, entity.shipping, entity.billing,
                  entity.mailing, entity.city, entity.state, entity.on_hold]);
                  
        logger.info("Added Entity");
        res.json(results);

    }
    catch(error){
        logger.error("Entities addEntity " + error);
        res.sendStatus(400);
    }
});

router.post('/deleteEntity', async (req,res) => {
    var ent_id, user;

    if(req.body){
        ent_id = req.body.ent_id;
        user = req.body.user;
    }
    
    if(user && !checkPermission(user.permissions, 'entities') && !user.isAdmin){
        logger.error("Bad permission", [user]);
        res.sendStatus(400);
        return;
    }

    const sql = ' DELETE FROM entities WHERE record_id = ? LIMIT 1 ';

    try{
        if(!ent_id){
            logger.error("Bad ent_id param in deleteEntity");
            throw "Bad ent_id param in deleteEntity"
        }

        const results = await database.query(sql, [ent_id]);

        logger.info("Deleted Entities " + ent_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities deleteEntity " + error);
        res.sendStatus(400);
    }
});

router.post('/getDefaultContacts', async (req,res) => {
    var ent_id;

    if(req.body){
        ent_id = req.body.ent_id;
    }
    
    const sql = ' SELECT ec.*, IFNULL(e.shipping, 0 ) AS default_shipping, IFNULL(e.billing, 0) AS default_billing ' + 
    ' FROM entities_contacts ec LEFT JOIN entities e ON e.record_id = ec.entities_id  WHERE ec.entities_id = ?';

    try{
        if(!ent_id){
            logger.error("Bad ent_id param in getDefaultContacts");
            throw "Bad ent_id param in getDefaultContacts";
        }
        const results = await database.query(sql, [ent_id]);

        logger.info("Got Default Contacts " + ent_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities getDefaultContacts " + error);
        res.sendStatus(400);
    }
});

router.post('/getDefaultAddresses', async (req,res) => {
    var ent_id;

    if(req.body){
        ent_id = req.body.ent_id;
    }
    if(!ent_id){
        logger.error("Bad ent_id param in getDefaultAddresses");
        res.sendStatus(400);
    }

    const sql = ' SELECT * FROM entities_addresses WHERE entities_id = ?  ';

    try{
        const results = await database.query(sql, [ent_id]);

        logger.info("Got Default Addresses for Entity " + ent_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities getDefaultAddresses " + error);
        res.sendStatus(400);
    }
});

router.post('/getDefaultAddressesForContact', async (req,res) => {
    var ent_id, contact_id;

    if(req.body){
        ent_id = req.body.ent_id;
        contact_id = req.body.contact_id;
    }
    if(!ent_id){
        logger.error("Bad ent_id param in getDefaultAddresses");
        res.sendStatus(400);
    }

    const sql = ' SELECT ea.*, IFNULL(ec.shipping, 0 ) AS default_shipping, IFNULL(ec.billing, 0) AS default_billing ' + 
    ' FROM entities_addresses ea LEFT JOIN entities_contacts ec ON ec.record_id = ?  WHERE ea.entities_id = ? ';

    try{
        const results = await database.query(sql, [contact_id, ent_id]);

        logger.info("Got Default Addresses for Entity " + ent_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities getDefaultAddresses " + error);
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
        logger.info("Got Entities Addresses for id " + ent_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities getEntAddresses " + error);
        res.sendStatus(400);
    }
});

router.post('/getEntAddressById', async (req,res) => {
    var ent_add_id;

    if(req.body){
        ent_add_id = req.body.ent_add_id;
    }

    const sql = ' SELECT * from entities_addresses WHERE record_id = ? ';

    try{
        const results = await database.query(sql, [ent_add_id]);
        logger.info("Got Entities Address By id" + ent_add_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities getEntAddressById " + error);
        res.sendStatus(400);
    }
});


router.post('/updateEntityAddress', async (req,res) => {
    var ent_add, user;

    if(req.body){
        ent_add = req.body.ent_add;
        user = req.body.user;
    }
    if(!ent_add){
        logger.error("Bad ent_add param in updateEntity");
        res.sendStatus(400);
    }
    if(user && !checkPermission(user.permissions, 'entities') && !user.isAdmin){
        logger.error("Bad permission", [user]);
        res.sendStatus(400);
        return;
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
    var ent_add, user;

    if(req.body){
        ent_add = req.body.ent_add;
        user = req.body.user;
    }
    if(!ent_add){
        logger.error("Bad ent_add param in addEntity");
        res.sendStatus(400);
    }
    if(user && !checkPermission(user.permissions, 'entities') && !user.isAdmin){
        logger.error("Bad permission", [user]);
        res.sendStatus(400);
        return;
    }

    const sql_resetmain = ' UPDATE entities_addresses SET main = 0 WHERE entities_id = ? ';
    const sql = ' INSERT INTO entities_addresses (main, shipping, billing, mailing, entities_id, name, to_name, address, address2, city, ' + 
    ' state, zip, residence, lat, lng, geocoded, task ) ' + 
    ' VALUES (IFNULL(?, DEFAULT(main)),IFNULL(?, DEFAULT(shipping)),IFNULL(?, DEFAULT(billing)),IFNULL(?, DEFAULT(mailing)) ' + 
    ',?,?,?,?,?,?,?,?,?,IFNULL(? ,0),IFNULL(? ,0),IFNULL(? ,0),IFNULL(?, DEFAULT(task))) ';

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
    var ent_add_id, user;

    if(req.body){
        ent_add_id = req.body.ent_add_id;
        user = req.body.user;
    }
    if(!ent_add_id){
        logger.error("Bad ent_add_id param in deleteEntityAddress");
        res.sendStatus(400);
    }
    if(user && !checkPermission(user.permissions, 'entities') && !user.isAdmin){
        logger.error("Bad permission", [user]);
        res.sendStatus(400);
        return;
    }

    const sql = ' DELETE FROM entities_addresses WHERE record_id = ? LIMIT 1 ';

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

router.post('/getEntContacts', async (req,res) => {
    var ent_id;

    if(req.body){
        ent_id = req.body.ent_id;
    }

    const sql = ' SELECT ec.*, ' +
        '( SELECT group_concat(ett.name) FROM entities_contacts_titles ect  ' + 
            'LEFT JOIN entities_types_titles ett ON ect.title = ett.record_id WHERE ect.contact = ec.record_id ' + 
         ' ) AS titles from entities_contacts ec ' +
        ' WHERE ec.entities_id = ? ' ;

       

    try{
        const results = await database.query(sql, [ent_id]);
        logger.info("Got Entities Contacts for id " + ent_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities getEntContacts " + error);
        res.sendStatus(400);
    }
});

router.post('/getEntContactById', async (req,res) => {
    var ent_cont_id;

    if(req.body){
        ent_cont_id = req.body.ent_cont_id;
    }

    const sql = ' SELECT * from entities_contacts WHERE record_id = ? ';

    try{
        const results = await database.query(sql, [ent_cont_id]);
        logger.info("Got Entities Contacts By id" + ent_cont_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities getEntContactById " + error);
        res.sendStatus(400);
    }
});


router.post('/updateEntityContact', async (req,res) => {
    var ent_cont, user;

    if(req.body){
        ent_cont = req.body.ent_cont;
        user = req.body.user;
    }
    if(!ent_cont){
        logger.error("Bad ent_cont param in updateEntity");
        res.sendStatus(400);
    }
    if(user && !checkPermission(user.permissions, 'entities') && !user.isAdmin){
        logger.error("Bad permission", [user]);
        res.sendStatus(400);
        return;
    }

    const sql = ' UPDATE entities_contacts SET name = ?, work_phone =?, home_phone=?, cell=?,fax=?,email=?, title=?, shipping=?, billing=?, ' +
    ' mailing=?, cc_type=?, cc_num=?, cc_exp_date=?, cc_name=?, cc_address=?, cc_city=?, cc_state=?, cc_zip=? ' +
    ' WHERE record_id = ? ';

    try{
        const results = await database.query(sql, [ent_cont.name, ent_cont.work_phone, ent_cont.home_phone, ent_cont.cell, ent_cont.fax, ent_cont.email, ent_cont.title, ent_cont.shipping, ent_cont.billing, ent_cont.mailing, ent_cont.cc_type, ent_cont.
            cc_num, ent_cont.cc_exp_date, ent_cont.cc_name, ent_cont.cc_address, ent_cont.cc_city, ent_cont.cc_state, ent_cont.cc_zip, ent_cont.record_id]);

        logger.info("Updated Entities Contact " + ent_cont.record_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities updateEntityContact " + error);
        res.sendStatus(400);
    }
});

router.post('/addEntityContact', async (req,res) => {
    var ent_cont, user;

    if(req.body){
        ent_cont = req.body.ent_cont;
        user = req.body.user;
    }
    if(!ent_cont){
        logger.error("Bad ent_cont param in addEntity");
        res.sendStatus(400);
    }
    if(user && !checkPermission(user.permissions, 'entities') && !user.isAdmin){
        logger.error("Bad permission", [user]);
        res.sendStatus(400);
        return;
    }
   
    const sql = ' INSERT INTO entities_contacts (entities_id, name, work_phone, home_phone, cell, fax, email, title, shipping, billing, mailing, cc_type, ' +
      '  cc_num, cc_exp_date, cc_name, cc_address, cc_city, cc_state, cc_zip ) ' + 
    ' VALUES (?,?,?,?,?,?,?,?,IFNULL(?, DEFAULT(shipping)),IFNULL(?, DEFAULT(billing)),IFNULL(?, DEFAULT(mailing)),?,?,?,?,?,?,?,?) ';

    try{
   
        const results = await database.query(sql, [ent_cont.entities_id,ent_cont.name, ent_cont.work_phone, ent_cont.home_phone, ent_cont.cell, ent_cont.fax, ent_cont.email, ent_cont.title, ent_cont.shipping, ent_cont.billing, ent_cont.mailing, ent_cont.cc_type, ent_cont.
            cc_num, ent_cont.cc_exp_date, ent_cont.cc_name, ent_cont.cc_address, ent_cont.cc_city, ent_cont.cc_state, ent_cont.cc_zip]);                 

        logger.info("Added Entity Contact");
        res.json(results);

    }
    catch(error){
        logger.error("Entities addEntityContact " + error);
        res.sendStatus(400);
    }
});

router.post('/deleteEntityContact', async (req,res) => {
    var ent_cont_id, user;

    if(req.body){
        ent_cont_id = req.body.ent_cont_id;
        user = req.body.user;
    }
    if(!ent_cont_id){
        logger.error("Bad ent_cont_id param in deleteEntityContact");
        res.sendStatus(400);
    }
    if(user && !checkPermission(user.permissions, 'entities') && !user.isAdmin){
        logger.error("Bad permission", [user]);
        res.sendStatus(400);
        return;
    }

    const sql = ' DELETE FROM entities_contacts WHERE record_id = ? LIMIT 1 ';

    try{
        const results = await database.query(sql, [ent_cont_id]);

        logger.info("Deleted Entities Contact " + ent_cont_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities deleteEntityContact " + error);
        res.sendStatus(400);
    }
});

router.post('/getEntContactTitles', async (req,res) => {
    var ent_id, cont_id;

    if(req.body){
        ent_id = req.body.ent_id;
        cont_id = req.body.cont_id;
    }

    const sql = ' SELECT ett.*, IFNULL(ect.record_id, 0) AS title_attached FROM entities_types_titles ett ' +
        ' LEFT JOIN entities_contacts_titles ect ON ect.title = ett.record_id AND ect.contact = ? ' +
        ' WHERE ett.entities_types_id = (SELECT e.entities_types_id FROM entities e WHERE record_id = ? ) ';

    try{
        const results = await database.query(sql, [cont_id,ent_id,cont_id,ent_id]);
        logger.info("Got Entities Contacts By id" + ent_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities getEntContactTitles " + error);
        res.sendStatus(400);
    }
});

router.post('/deleteContactTitle', async (req,res) => {
    var title_id, user;

    if(req.body){
        title_id = req.body.title_id;
        user = req.body.user;
    }

    if(user && !checkPermission(user.permissions, 'entities') && !user.isAdmin){
        logger.error("Bad permission", [user]);
        res.sendStatus(400);
        return;
    }

    const sql = ' DELETE FROM entities_contacts_titles WHERE record_id = ? LIMIT 1 ';

    try{
        const results = await database.query(sql, [title_id]);
        logger.info("Deleted Contacts Title By id" + title_id);
        res.json(results);

    }
    catch(error){
        logger.error("Entities deleteContactTitle " + error);
        res.sendStatus(400);
    }
});

router.post('/addContactTitle', async (req,res) => {
    var title_data, user;

    if(req.body){
        title_data = req.body.title_data;
        user = req.body.user;
    }

    if(user && !checkPermission(user.permissions, 'entities') && !user.isAdmin){
        logger.error("Bad permission", [user]);
        res.sendStatus(400);
        return;
    }

    const sql = ' INSERT INTO entities_contacts_titles (contact, title, old_title) VALUES (?,?, IFNULL(?, DEFAULT(old_title))) ';

    try{
        const results = await database.query(sql, [title_data.contact_id, title_data.record_id, null]);
        logger.info("Added Contacts Title " + title_data);
        res.json(results);

    }
    catch(error){
        logger.error("Entities addContactTitle " + error);
        res.sendStatus(400);
    }
});

router.post('/getEntRelatedWorkOrders', async (req,res) => {
    var ent_id = {};
    if(req.body){
        ent_id = req.body.ent_id;
    }

    const sql = 'SELECT wo.record_id AS wo_record_id, date_format(wo.date, \'%Y-%m-%d\') as date, wo.type AS wo_type, wo.completed AS completed, wo.invoiced AS invoiced, ' +
    ' organization AS account, wo.city AS wo_city, wo.state AS wo_state, description, customer, account_id, ' +
    ' wo.customer_id AS wo_customer_id, a.name AS a_name, c.name AS c_name, sa.city AS acc_city, sa.state AS acc_state ' +
    ' FROM work_orders wo ' +
    ' LEFT JOIN entities a ON wo.account_id = a.record_id ' +
    ' LEFT JOIN entities_addresses sa ON wo.account_address_id = sa.record_id ' +
    ' LEFT JOIN entities c ON wo.customer_id = c.record_id ' +
    ' WHERE wo.customer_id = ? OR wo.account_id = ?' + 
    ' ORDER BY wo.record_id DESC ' +
    ' limit 2000 ';
    try{
        const results = await database.query(sql, [ent_id, ent_id]);
        logger.info("Got Related Work Orders for Entity " + ent_id);

        res.json(results);
    }
    catch(error){
        logger.error("Entities getEntRelatedWorkOrders: " + error);
        res.sendStatus(400);
    }
});


module.exports = router;