const express = require('express');
const router = express.Router();

const logger = require('../../logs');
//Handle Database
const database = require('./db');

router.post('/getAllWorkOrders', async (req,res) => {
    var dateRange = {};
    if(req.body){
        dateRange = req.body.dateRange;
    }

    const sql = 'SELECT DISTINCT wo.record_id AS wo_record_id, date_format(wo.date, \'%Y-%m-%d\') as date, wo.type AS wo_type, wo.completed AS completed, wo.invoiced AS invoiced, ' +
    ' organization AS account, wo.city AS wo_city, wo.state AS wo_state, description, customer, account_id, ' +
    ' wo.customer_id AS wo_customer_id, a.name AS a_name, c.name AS c_name, sa.city AS sa_city, sa.state AS sa_state ' +
    ' FROM work_orders wo ' +
    ' LEFT JOIN entities a ON wo.account_id = a.record_id ' +
    ' LEFT JOIN entities_addresses sa ON a.record_id = sa.entities_id AND sa.main = 1 ' +
    ' LEFT JOIN entities c ON wo.customer_id = c.record_id ' +
    ' WHERE date >= ? AND date <= ? ' + 
    ' ORDER BY date DESC ' +
    ' limit 5000 ';
    try{
        const results = await database.query(sql, [dateRange["from"], dateRange["to"]]);
        logger.info("Got Work Orders");

        results.forEach((row, i)=> {
            if(row['completed'] === 0){
                row['completed'] = 'Not Completed';
            } else if(row['completed'] === 1){
                row['completed'] = 'Completed';
            }
            if(row['invoiced'] === 0){
                row['invoiced'] = 'Not Invoiced';
            } else if(row['invoiced'] === 1){
                row['invoiced'] = 'Invoiced';
            }
        })

        res.json(results);
    }
    catch(error){
        logger.error("Work Orders: " + error);
        res.sendStatus(400);
    }
});

router.post('/getAllWorkOrderItems', async (req,res) => {

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

    const sql = 'SELECT woi.*, wo.job_reference, e.name as e_name, date_format(wo.date, \'%m-%d-%Y %H:%i:%S\') as date '  + 
        ' FROM work_orders_items woi ' +
        ' LEFT JOIN work_orders wo ON woi.work_order=wo.record_id ' + 
        ' LEFT JOIN entities e ON wo.account_id=e.record_id ' + 
        ' WHERE ?? like ? ' +
        ' ORDER BY woi.work_order DESC ' + 
        ' LIMIT 100';

    try{
        const results = await database.query(sql, [table, search_query]);
        logger.info("Got Work Order Items");
        res.json(results);

    }
    catch(error){
        logger.error("Work Order Items: " + error);
        res.sendStatus(400);
    }
});

router.post('/getAllWorkOrderSignArtItems', async (req,res) => {

    var wo_id;
    if(req.body){
        if(req.body.wo_id != null){
            wo_id = req.body.wo_id;
        }  
    }
    logger.verbose(wo_id);
    

    const sql = 'SELECT * '  + 
        ' FROM work_orders_items woi ' +
        ' WHERE woi.work_order =  ? AND woi.scoreboard_or_sign > 0' +
        ' ORDER BY woi.ordernum ASC ' + 
        ' LIMIT 100';

    try{
        const results = await database.query(sql, [wo_id]);
        logger.info("Got Work Order Sign Art Items");
        res.json(results);

    }
    catch(error){
        logger.error("Work Order Sign Art  Items: " + error);
        res.sendStatus(400);
    }
});


module.exports = router;