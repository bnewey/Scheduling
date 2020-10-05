const express = require('express');
const router = express.Router();

const logger = require('../../logs');

const Util = require('../../js/Util');
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
    ' ORDER BY wo.record_id DESC ' +
    ' limit 2000 ';
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

router.post('/getWorkOrderById', async (req,res) => {
    var wo_id ;
    if(req.body){
        wo_id = req.body.wo_id;
    }

    const sql = 'SELECT DISTINCT wo.record_id AS wo_record_id, date_format(wo.date, \'%Y-%m-%d\') as date, wo.type AS type, wo.completed AS completed, wo.invoiced AS invoiced, ' +
    ' organization AS account, wo.city AS wo_city, wo.state AS wo_state, description, customer, account_id, ' +
    ' wo.customer_id AS customer_id, a.name AS a_name, c.name AS c_name, sa.city AS sa_city, sa.state AS sa_state,  ' + 
    ' wo.requestor, wo.maker, wo.job_reference, wo.notes, wo.po_number, wo.requested_arrival_date   ' +
    ' FROM work_orders wo ' +
    ' LEFT JOIN entities a ON wo.account_id = a.record_id ' +
    ' LEFT JOIN entities_addresses sa ON a.record_id = sa.entities_id AND sa.main = 1 ' +
    ' LEFT JOIN entities c ON wo.customer_id = c.record_id ' +
    ' WHERE wo.record_id = ? ' + 
    ' limit 1 ';
    try{
        const results = await database.query(sql, [wo_id]);
        logger.info("Got Work Order id:"+wo_id);
        res.json(results);
    }
    catch(error){
        logger.error("Work Order id: " + id + " , " + error);
        res.sendStatus(400);
    }
});


router.post('/getEmployeeNameFromId', async (req,res) => {
    var id ;
    if(req.body){
        id = req.body.id;
    }

    const sql = ' SELECT * FROM users where user_id = ? ';
    try{
        const results = await database.query(sql, [id]);
        logger.info("Got Employee id:"+id);
        res.json(results);
    }
    catch(error){
        logger.error("Got Employee id: " + id + " , " + error);
        res.sendStatus(400);
    }
});



router.post('/searchAllWorkOrders', async (req,res) => {

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

    const sql = 'SELECT wo.record_id AS wo_record_id, date_format(wo.date, \'%Y-%m-%d\') as date, wo.type AS wo_type, wo.completed AS completed, wo.invoiced AS invoiced, ' +
        ' organization AS account, wo.city AS wo_city, wo.state AS wo_state, description, customer, account_id, ' +
        ' wo.customer_id AS wo_customer_id, a.name AS a_name, c.name AS c_name, sa.city AS sa_city, sa.state AS sa_state ' +
        ' FROM work_orders wo ' +
        ' LEFT JOIN entities a ON wo.account_id = a.record_id ' +
        ' LEFT JOIN entities_addresses sa ON a.record_id = sa.entities_id AND sa.main = 1 ' +
        ' LEFT JOIN entities c ON wo.customer_id = c.record_id ' + 
        ' WHERE ?? like ? ' +
        ' ORDER BY wo.record_id DESC '
        ' LIMIT 500';

    try{
        const results = await database.query(sql, [table, search_query]);
        logger.info("Got Work Orders by search", [table, search_query]);
        res.json(results);

    }
    catch(error){
        logger.error("Search work orders: " + error);
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
        ' WHERE woi.work_order =  ? ' +
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

router.post('/updateWorkOrderItemArrivalDate', async (req,res) => {

    var woi_id, date;
    if(req.body){
        if(req.body.woi_id != null){
            woi_id = req.body.woi_id;
            date =req.body.date;
        }  
    }
    

    const sql = ' UPDATE work_orders_items set scoreboard_arrival_date = ? WHERE record_id = ? ';

    try{
        const results = await database.query(sql, [date, woi_id]);
        logger.info("Work Order Item updated", woi_id);
        res.json(results);

    }
    catch(error){
        logger.error("Failed to updateWorkOrderItemArrivalDate: " + error);
        res.sendStatus(400);
    }
});

router.post('/updateWorkOrderItemVendor', async (req,res) => {

    var woi_id, vendor;
    if(req.body){
        if(req.body.woi_id != null){
            woi_id = req.body.woi_id;
            vendor =req.body.vendor;
        }  
    }
    

    const sql = ` UPDATE work_orders_items set vendor = ${vendor == 0 ? 'null' : '?'} WHERE record_id = ? `;
    var results;
    try{

        if(vendor == 0){
            results = await database.query(sql, [ woi_id]);
        }else{
            results = await database.query(sql, [vendor, woi_id]);
        }
        
        logger.info("Work Order Item updated", woi_id);
        res.json(results);

    }
    catch(error){
        logger.error("Failed to updateWorkOrderItemVendor: " + error);
        res.sendStatus(400);
    }
});

router.post('/updateWorkOrder', async (req,res) => {

    var wo ;
    if(req.body){
        if(req.body.workOrder != null){
            wo = req.body.workOrder;
        }  
    }
    const sql = ' UPDATE work_orders set customer_id = ?, account_id = ?, date = ?, requestor = ? , maker = ?, type = ?, ' +
    '  job_reference = ? , description = ?, notes = ?, po_number = ?, requested_arrival_date = ?, completed = ?, invoiced = ? ' +
    '  WHERE record_id = ? ';

    try{
        const results = await database.query(sql, [wo.customer_id, wo.account_id, Util.convertISODateToMySqlDate(wo.date), wo.requestor, wo.maker, wo.type,
                    wo.job_reference, wo.description, wo.notes, wo.po_number, Util.convertISODateToMySqlDate(wo.requested_arrival_date), wo.completed, wo.invoiced , wo.record_id]);
        logger.info("Work Order  updated", wo.record_id);
        res.json(results);

    }
    catch(error){
        logger.error("Failed to updateWorkOrder: " + error);
        res.sendStatus(400);
    }
});

router.post('/addWorkOrder', async (req,res) => {

    var wo ;
    if(req.body){
        if(req.body.workOrder != null){
            wo = req.body.workOrder;
        }  
    }

    const sql = ' INSERT INTO work_orders (company, id_work_orders_types, customer_id, account_id, date, requestor , maker, type, ' +
    '  job_reference , description, notes, po_number, requested_arrival_date, date_entered, completed, invoiced) values (2, 0, IFNULL(? ,DEFAULT(customer_id)), ' +
     ' IFNULL(? ,DEFAULT(account_id)),IFNULL(? ,DEFAULT(date)), IFNULL(? ,DEFAULT(requestor)),IFNULL(? ,DEFAULT(maker)),IFNULL(? ,DEFAULT(type)), ' +
     ' IFNULL(? ,DEFAULT(job_reference)),IFNULL(? ,DEFAULT(description)),IFNULL(? ,DEFAULT(notes)),IFNULL(? ,DEFAULT(po_number)), ' +
     ' IFNULL(? ,DEFAULT(requested_arrival_date)),IFNULL(? ,DEFAULT(date_entered)),IFNULL(? ,DEFAULT(completed)),IFNULL(? ,DEFAULT(invoiced))) ';

    try{
        const results = await database.query(sql, [wo.customer_id, wo.account_id, wo.date, wo.requestor, wo.maker, wo.type,
                    wo.job_reference, wo.description, wo.notes, wo.po_number, wo.requested_arrival_date, wo.date, wo.completed, wo.invoiced]);
        logger.info("Work Order added ");
        res.json(results);

    }
    catch(error){
        logger.error("Failed to updateWorkOrder: " + error);
        res.sendStatus(400);
    }
});



module.exports = router;