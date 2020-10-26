const express = require('express');
const router = express.Router();
var async = require("async");

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
    ' organization AS account, wo.city AS wo_city, wo.state AS wo_state, description, customer, account_id, advertising_notes, ' +
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

router.post('/getWorkOrderByIdForPDF', async (req,res) => {
    var wo_id ;
    if(req.body){
        wo_id = req.body.wo_id;
    }

    const sql = 'SELECT  wo.record_id AS wo_record_id, date_format(wo.date, \'%Y-%m-%d\') as date, wo.type AS type, wo.completed AS completed, wo.invoiced AS invoiced, ' +
    ' organization AS account, wo.city AS wo_city, wo.state AS wo_state, description, customer, account_id,wo.customer_id AS customer_id, ' +
    ' wo.requestor, wo.maker, wo.job_reference, wo.notes, wo.po_number, date_format(wo.requested_arrival_date, \'%Y-%m-%d\') as requested_arrival_date,   ' +
    //Shipping Info
    ' enc.name AS c_entity_name,  eac.address AS c_address, eac.state AS c_state, eac.city AS c_city,eac.zip AS c_zip,   ' +
    ' eac.name AS c_address_name, eac.to_name AS c_address_to_name, ' +
    ' eac.residence AS c_residence, ecc.name AS c_contact_name, ecc.work_phone AS c_work_phone, ecc.cell AS c_cell_phone, ecc.home_phone AS c_other_phone, ' +
    ' ecc.title AS c_contact_title, ' +
    //Billing Info
    ' ena.name AS a_entity_name, ena.account_number AS a_account_number, eaa.address AS a_address, eaa.state AS a_state, eaa.city AS a_city,eaa.zip AS a_zip, ' +
    ' eaa.name AS a_address_name, eaa.to_name AS a_address_to_name, ' +
    ' eca.name AS a_contact_name, eca.work_phone AS a_work_phone,  eca.fax AS a_fax, ' +
    ' eca.title AS a_contact_title ' + 

    ' FROM work_orders wo ' +
    ' LEFT JOIN entities enc ON wo.customer_id = enc.record_id ' +
    ' LEFT JOIN entities ena ON wo.account_id = ena.record_id ' +  
    ' LEFT JOIN entities_contacts ecc ON enc.shipping = ecc.record_id ' + 
    ' LEFT JOIN entities_contacts eca ON ena.billing = eca.record_id ' + 
    ' LEFT JOIN entities_addresses eac ON (ecc.shipping = eac.record_id ) ' +
    ' LEFT JOIN entities_addresses eaa ON (eca.billing = eaa.record_id ) ' +
    ' WHERE wo.record_id = ? ' + 
    ' limit 1 ';
    try{
        const results = await database.query(sql, [wo_id]);
        logger.info("Got Work Order id:"+wo_id);
        res.json(results);
    }
    catch(error){
        logger.error("Work Order for PDF id: " + wo_id + " , " + error);
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
    

    const sql = 'SELECT *  '  + 
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

router.post('/reorderWOI', async (req,res) => {
    var work_order_id, woi_array;
    if(req.body){
        work_order_id = req.body.work_order_id;
        woi_array = req.body.woi_array;
    }
    
    const sql = ' UPDATE work_orders_items SET ordernum = ? ' +
    ' WHERE record_id = ? AND work_order = ? ';


    async.forEachOf(woi_array, async (woi, i, callback) => {
        //will automatically call callback after successful execution
        try{
            const results = await database.query(sql, [woi.ordernum, woi.record_id, work_order_id]);
            return;
        }
        catch(error){     
            //callback(error);         
            throw error;                 
        }
    }, err=> {
        if(err){
            logger.error("WorkOrder (reorderWOI): " + err);
            res.sendStatus(400);
        }else{
            logger.info("Reorder WorkOrderItems: " + work_order_id);
            res.sendStatus(200);
        }
    })
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
    '  job_reference = ? , description = ?, notes = ?, po_number = ?, requested_arrival_date = ?, completed = ?, invoiced = ?, advertising_notes=? ' +
    '  WHERE record_id = ? ';

    try{
        const results = await database.query(sql, [wo.customer_id, wo.account_id, Util.convertISODateToMySqlDate(wo.date), wo.requestor, wo.maker, wo.type,
                    wo.job_reference, wo.description, wo.notes, wo.po_number, Util.convertISODateToMySqlDate(wo.requested_arrival_date), wo.completed, wo.invoiced ,
                    wo.advertising_notes, wo.record_id]);
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



router.post('/updateWorkOrderItem', async (req,res) => {

    var woi ;
    if(req.body){
        if(req.body.woi != null){
            woi = req.body.woi;
        }  
    }

    console.log("woi", woi)

    const sql = ' UPDATE work_orders_items SET item_type = IFNULL(? ,DEFAULT(item_type)), quantity = IFNULL(? ,DEFAULT(quantity)), ' + 
    ' part_number = ?, size = ?, description = ?, price = IFNULL(? ,DEFAULT(price)), receive_date =?, ' +
    ' receive_by =?, contact = IFNULL(? ,DEFAULT(contact)), scoreboard_or_sign= IFNULL(? ,DEFAULT(scoreboard_or_sign)), model=?,color=? ,' +
    ' trim=?,scoreboard_arrival_date=?,scoreboard_arrival_status=?, mount=?, ' + 
    ' trim_size=?, trim_corners=?, date_offset= IFNULL(? ,DEFAULT(date_offset)), sign_due_date=?, vendor=? ' +
    '  WHERE record_id = ? ';

    try{ //Util.convertISODateToMySqlDate(wo.date)
        const results = await database.query(sql, [ woi.item_type || null, woi.quantity || null, woi.part_number || null, woi.size || null,
                woi.description || null,woi.price || (0).toFixed(2), Util.convertISODateToMySqlDate( woi.receive_date) , woi.receive_by || null,
                woi.contact || null, woi.scoreboard_or_sign || null,
                woi.model || null, woi.color || null, woi.trim  || null,
                Util.convertISODateToMySqlDate(woi.scoreboard_arrival_date), woi.scoreboard_arrival_status || null,
                 woi.mount || null, woi.trim_size || null, woi.trim_corners || null,
                woi.date_offset || 0, Util.convertISODateToMySqlDate(woi.sign_due_date), woi.vendor || null, woi.record_id]);
        logger.info("Work Order Item  updated", woi.record_id);
        res.json(results);

    }
    catch(error){
        logger.error("Failed to updateWorkOrderItem: " + error);
        res.sendStatus(400);
    }
});

router.post('/addWorkOrderItem', async (req,res) => {

    var woi ;
    if(req.body){
        if(req.body.woi != null){
            woi = req.body.woi;
        }  
    }



    const getMax = " SELECT MAX(ordernum)+1 as max_num  FROM work_orders_items woi WHERE work_order = ?; "

    const sql = '  INSERT INTO work_orders_items ( work_order, item_type, user_entered, date_entered, quantity, part_number, size, ' +
            ' description, price, receive_date, receive_by, packing_slip, contact, scoreboard_or_sign, model, color, trim, ' + 
            ' scoreboard_arrival_date, scoreboard_arrival_status, mount, roy, trim_size, trim_corners, date_offset, sign_due_date, ordernum,vendor ) ' +
            ' VALUES ( IFNULL(? ,DEFAULT(contact)), IFNULL(? ,DEFAULT(item_type)), IFNULL(? ,DEFAULT(user_entered)), IFNULL(? ,DEFAULT(date_entered)), ' +
            ' IFNULL(? ,DEFAULT(quantity)), ?, ?, ?, IFNULL(? ,DEFAULT(price)), ?, ?, DEFAULT(packing_slip), IFNULL(? ,DEFAULT(contact)), ' + 
            ' IFNULL(? ,DEFAULT(scoreboard_or_sign)), ?,?,?,?,?,?,IFNULL(? ,DEFAULT(roy)), ?,?, IFNULL(? ,DEFAULT(date_offset)), ?, ' +
            ' IFNULL(?, 0) , ?) ';

    try{
        const data = await database.query(getMax, [ woi.work_order ])
        const results = await database.query(sql, [ woi.work_order, woi.item_type, woi.user_entered || 0, Util.convertISODateToMySqlDate(new Date()),
            woi.quantity, woi.part_number, woi.size, woi.description, woi.price, Util.convertISODateToMySqlDate(woi.receive_date), woi.receive_by,// woi.packing_slip || 0,
            woi.contact, woi.scoreboard_or_sign, woi.model, woi.color, woi.trim, woi.scoreboard_arrival_date, woi.scoreboard_arrival_status,
            woi.mount, 0, woi.trim_size, woi.trim_corners, woi.date_offset, Util.convertISODateToMySqlDate(woi.sign_due_date), data[0].max_num || 0, woi.vendor ]);
        logger.info("Work Order Item added ");    
        res.json(results);    
 
    }
    catch(error){
        logger.error("Failed to updateWorkOrderItem: " + error);
        res.sendStatus(400);
    }
});



router.post('/deleteWorkOrderItem', async (req,res) => {

    var woi_id ;
    if(req.body){
        if(req.body.woi_id != null){
            woi_id = req.body.woi_id;
        }  
    }

    const sql = ' DELETE FROM work_orders_items WHERE record_id = ? LIMIT 1 ';

    try{ 
        const results = await database.query(sql, [ woi_id]);
        logger.info("Work Order Item  deleted", woi_id);
        res.json(results);

    }
    catch(error){
        logger.error("Failed to deleteWorkOrderItem: " + error);
        res.sendStatus(400);
    }
});



module.exports = router;