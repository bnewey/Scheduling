const express = require('express');
const router = express.Router();
var async = require("async");

const logger = require('../../logs');

const Util = require('../../js/Util');
//Handle Database
const database = require('./db');


router.post('/getAllSignsForScheduler', async (req,res) => {

    const sql = ' SELECT woi.*, date_format(woi.sign_built, \'%Y-%m-%d %H:%i:%S\') AS sign_built, ' + 
    'date_format(woi.sign_popped_and_boxed, \'%Y-%m-%d %H:%i:%S\') AS sign_popped_and_boxed,  ' + 
    ' IFNULL( date_format(t.sch_install_date, \'%Y-%m-%d\') , NULL) AS install_date, wo.type, eac.state, enc.name AS product_to, ' +
    ' tl.list_name ' +  
    ' FROM work_orders_items woi ' +
    ' LEFT JOIN work_orders wo ON wo.record_id = woi.work_order ' + 
    ' LEFT JOIN tasks t ON wo.record_id = t.table_id ' +
    ' LEFT JOIN task_list_items tli ON t.id = tli.task_id ' +
    ' LEFT JOIN task_list tl ON tli.task_list_id = tl.id ' +
    ' LEFT JOIN entities enc ON wo.customer_id = enc.record_id ' +
    ' LEFT JOIN entities_contacts ecc ON enc.shipping = ecc.record_id ' + 
    ' LEFT JOIN entities_addresses eac ON (ecc.shipping = eac.record_id ) ' +
    ' WHERE woi.scoreboard_or_sign = 2 AND wo.completed = 0 ORDER BY  t.sch_install_date ASC, wo.record_id DESC';

    try{
        const results = await database.query(sql, []);
        logger.info("Got Signs for Scheduler");
        res.json(results);

    }
    catch(error){
        logger.error("Signs getAllSignsForScheduler " + error);
        res.sendStatus(400);
    }
});

router.post('/searchAllSignItems', async (req,res) => {

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

    const sql = 'SELECT woi.*, date_format(woi.sign_built, \'%Y-%m-%d %H:%i:%S\') AS sign_built, ' + 
    ' date_format(woi.sign_popped_and_boxed, \'%Y-%m-%d %H:%i:%S\') AS sign_popped_and_boxed,  ' + 
    ' IFNULL( date_format(t.sch_install_date, \'%Y-%m-%d\') , NULL) AS install_date, wo.type, eac.state, enc.name AS product_to, ' +
    ' tl.list_name ' +  
    ' FROM work_orders_items woi ' +
    ' LEFT JOIN work_orders wo ON wo.record_id = woi.work_order ' + 
    ' LEFT JOIN tasks t ON wo.record_id = t.table_id ' +
    ' LEFT JOIN task_list_items tli ON t.id = tli.task_id ' +
    ' LEFT JOIN task_list tl ON tli.task_list_id = tl.id  ' +
    ' LEFT JOIN entities enc ON wo.customer_id = enc.record_id ' +
    ' LEFT JOIN entities_contacts ecc ON enc.shipping = ecc.record_id ' + 
    ' LEFT JOIN entities_addresses eac ON (ecc.shipping = eac.record_id ) ' +
    ' WHERE ?? like ? AND woi.scoreboard_or_sign = 2 AND wo.completed = 0 ORDER BY t.sch_install_date ASC, wo.record_id DESC ';

    try{
        const results = await database.query(sql, [table, search_query]);
        logger.info("Got Sign Items by search", [table, search_query]);
        res.json(results);

    }
    catch(error){
        logger.error("Search Sign Items: " + error);
        res.sendStatus(400);
    }
});


module.exports = router;