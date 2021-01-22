const express = require('express');
const router = express.Router();
var async = require("async");

const logger = require('../../logs');

const Util = require('../../js/Util');
//Handle Database
const database = require('./db');


router.post('/getAllParts', async (req,res) => {

    const sql = ' SELECT p.*, pt.type FROM inv__parts p ' +
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

    const sql = ' SELECT p.*, pt.type FROM inv__parts p ' + 
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

router.post('/getPartById', async (req,res) => {
    var rainey_id ;
    if(req.body){
        rainey_id = req.body.rainey_id;
    }

    const sql = ' SELECT p.*, pt.type FROM inv__parts p ' +
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

router.post('/addNewPart', async (req,res) => {

    var part ;
    if(req.body){
        if(req.body.part != null){
            part = req.body.part;
        }  
    }
    const sql = ' INSERT INTO inv__parts (description, inv_qty, cost_each, storage_location, notes, part_type, reel_width, date_updated, obsolete ) ' +
                ' VALUES (?,IFNULL(?, default(inv_qty)),IFNULL(?,default(cost_each)),?,?,?,?,?,IFNULL(?, default(obsolete))) ';

    try{
        const results = await database.query(sql, [part.description, part.inv_qty, part.cost_each, part.storage_location, part.notes,
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
    const sql = ' UPDATE inv__parts set description=?, inv_qty=?, cost_each=?, storage_location=IFNULL(?, DEFAULT(storage_location)), notes=?, part_type=?, reel_width=?, ' +
        ' date_updated=?, obsolete=? ' +
        ' WHERE rainey_id = ? ';

    try{
        const results = await database.query(sql, [part.description, part.inv_qty, part.cost_each, part.storage_location, part.notes,
            part.part_type, part.reel_width, part.date_updated, part.obsolete, part.rainey_id_id ]);
        logger.info("Inventory Part updated", part.record_id);
        res.json(results);
    }
    catch(error){
        logger.error("Failed to updatePart: " + error);
        res.sendStatus(400);
    }
});


module.exports = router;