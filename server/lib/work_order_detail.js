const express = require('express');
const router = express.Router();
var async = require("async");

const logger = require('../../logs');

const Util = require('../../js/Util');
//Handle Database
const database = require('./db');


router.post('/getPackingSlipsById', async (req,res) => {
    var id ;
    if(req.body){
        id = req.body.id;
    }

    const sql = ' SELECT ps.record_id, date_format(ps.date_entered, \'%Y-%m-%d\') as date_entered , ps.user_entered, ' + 
        ' date_format(ps.ship_date, \'%Y-%m-%d\') as ship_date, ps.shipped, ps.work_order, ' +
        ' ps.diff_ship_to, IF(ps.diff_ship_to = 1, ps.ship_to_contact, wo.customer_contact_id) AS ship_to_contact,  IF(ps.diff_ship_to = 1, ps.ship_to_address, wo.customer_address_id) AS ship_to_address, ' +
        ' ea.name AS address_name, ea.address, ea.city, ea.state, ea.record_id AS address_id, ' + 
        ' ea.zip, ea.lat, ea.lng, ea.geocoded, ea.entities_id, ' +
        ' ec.name AS contact_name, ' +
        ' wo.job_reference, wo.po_number, date_format(wo.date, \'%Y-%m-%d\') as date_ordered, ' +   
        ' en.shipping AS shipping_entity_id, en.name AS entity_name ' + 
        ' FROM packing_slip ps ' + 
        ' LEFT JOIN work_orders wo ON wo.record_id = ps.work_order ' +      
        ' LEFT JOIN entities en ON wo.customer_id = en.record_id ' + 
        ' LEFT JOIN entities_contacts ec ON IF(ps.diff_ship_to = 1,ps.ship_to_contact, wo.customer_contact_id )=ec.record_id ' + 
        ' LEFT JOIN entities_addresses ea ON IF(ps.diff_ship_to = 1,ps.ship_to_address, wo.customer_address_id )=ea.record_id ' + 
        ' WHERE ps.work_order = ? ';

    try{
        const results = await database.query(sql, [id]);
        logger.info("Got Packing Slips by work order id:"+id);
        res.json(results);
    }
    catch(error){
        logger.error("Packing Slips by wo#: " + id + " , " + error);
        res.sendStatus(400);
    }
});

router.post('/updatePackingSlip', async (req,res) => {

    var ps ;
    if(req.body){
        if(req.body.psObject != null){
            ps = req.body.psObject;
        }  
    }

    const sql = ' UPDATE packing_slip SET ship_date = ?, shipped = ?, diff_ship_to =?, ship_to_contact =?, ship_to_address =? WHERE record_id = ? ';

    try{
        const results = await database.query(sql, [Util.convertISODateToMySqlDate(ps.ship_date), ps.shipped, ps.diff_ship_to, ps.ship_to_contact,
                                                ps.ship_to_address, ps.record_id]);
        logger.info("Packing Slip updated", ps.record_id);
        res.json(results);

    }
    catch(error){
        logger.error("Failed to updatePackingSlip: " + error);
        res.sendStatus(400);
    }
});

router.post('/addPackingSlip', async (req,res) => {
    var wo_id ;
    if(req.body){
        if(req.body.wo_id != null){
            wo_id = req.body.wo_id;
        }
    }

    const sql = ' INSERT INTO packing_slip (ship_date, date_entered,shipped, work_order) values (?,?,?,?) ';

    try{
        const results = await database.query(sql, [Util.convertISODateToMySqlDate(new Date()),Util.convertISODateToMySqlDate(new Date()), 0, wo_id]);
        logger.info("Added packing slip to wo#: ", wo_id);
        res.json(results);

    }
    catch(error){
        logger.error("Failed to addPackingSlip: " + error);
        res.sendStatus(400);
    }
});

router.post('/deletePackingSlip', async (req,res) => {
    var id ;
    if(req.body){
        if(req.body.id != null){
            id = req.body.id;
        }
    }

    const sql = ' DELETE FROM packing_slip WHERE record_id = ? ';

    try{
        const results = await database.query(sql, [id]);
        logger.info("Deleted packing slip: ", id);
        res.json(results);

    }
    catch(error){
        logger.error("Failed to deletePackingSlip: " + error);
        res.sendStatus(400);
    }
});

router.post('/addWOIToPackingSlip', async (req,res) => {

    var slip_id, woi_id;
    if(req.body){
        if(req.body.woi_id != null){
            woi_id = req.body.woi_id;
            slip_id =req.body.slip_id;
        } else{
            res.sendStatus(400);
        }
    }
    

    const sql = ' UPDATE work_orders_items set packing_slip = ? WHERE record_id = ? ';

    try{
        const results = await database.query(sql, [slip_id, woi_id]);
        logger.info("Work Order Item " + woi_id + " added to packing slip" + slip_id);
        res.json(results);

    }
    catch(error){
        logger.error("Failed to addWOIToPackingSlip: " + error);
        res.sendStatus(400);
    }
});

router.post('/removePackingSlipFromWOI', async (req,res) => {
    var slip_id, woi_id ;
    if(req.body){
        slip_id = req.body.slip_id;
        woi_id = req.body.woi_id;
    }

    const sql = ' UPDATE work_orders_items woi SET packing_slip = NULL WHERE woi.record_id = ? AND woi.packing_slip = ? ';

    try{
        const results = await database.query(sql, [woi_id, slip_id]);
        logger.info("Removed packing slip: " + slip_id + " from woi#: " + woi_id);
        res.json(results);

    }
    catch(error){
        logger.error("Failed to removePackingSlipFromWOI: " + error);
        res.sendStatus(400);
    }
});

router.post('/getVendorTypes', async (req,res) => {

    const sql = ' SELECT id, name FROM vendors ';

    try{
        const results = await database.query(sql);
        logger.info("Got vendor types");
        res.json(results);
    }
    catch(error){
        logger.error("Vendor types:  " + error);
        res.sendStatus(400);
    }
});


router.post('/getShipToWOIOptions', async (req,res) => {

    var wo_id;
    if(req.body){
        if(req.body.wo_id != null){
            wo_id = req.body.wo_id;
        }  
    }
    logger.verbose(wo_id);


    const sql = 'SELECT '  + 
        ' ec.record_id AS ec_record_id, if(ec.entities_id = e1.record_id,concat(ec.name,\' (Product Goes to)\'), concat(ec.name,\' (Bill Goes to)\')) AS ec_name ' + 
        ' FROM work_orders wo ' +
        ' LEFT JOIN entities e1 ON e1.record_id = wo.account_id ' +
        ' LEFT JOIN entities e2 ON e2.record_id = wo.customer_id ' + 
        ' LEFT JOIN entities_contacts ec ON ec.entities_id = e2.record_id OR ec.entities_id = e1.record_id  ' +
        ' WHERE wo.record_id =  ? ';

    try{
        const results = await database.query(sql, [wo_id]);
        logger.info("Got getShipToWOIOptions Items");
        res.json(results);

    }
    catch(error){
        logger.error("getShipToWOIOptions  Items: " + error);
        res.sendStatus(400);
    }
});

router.post('/getShipToAddressWOIOptions', async (req,res) => {

    var wo_id;
    if(req.body){
        if(req.body.wo_id != null){
            wo_id = req.body.wo_id;
        }  
    }
    logger.verbose(wo_id);


    const sql = 'SELECT '  + 
        ' ea.record_id AS ea_record_id, if(ea.entities_id = e1.record_id,concat(ea.name,\' (Product Goes to)\'), concat(ea.name,\' (Bill Goes to)\')) AS ea_name ' + 
        ' FROM work_orders wo ' +
        ' LEFT JOIN entities e1 ON e1.record_id = wo.account_id ' +
        ' LEFT JOIN entities e2 ON e2.record_id = wo.customer_id ' + 
        ' LEFT JOIN entities_addresses ea ON ea.entities_id = e2.record_id OR ea.entities_id = e1.record_id  ' +
        ' WHERE wo.record_id =  ? ';

    try{
        const results = await database.query(sql, [wo_id]);
        logger.info("Got getShipToAddressWOIOptions Items");
        res.json(results);

    }
    catch(error){
        logger.error("getShipToAddressWOIOptions  Items: " + error);
        res.sendStatus(400);
    }
});

router.post('/getPastWorkOrders', async (req,res) => {
    var c_id = {};
    if(req.body){
        c_id = req.body.c_id;
    }

    const sql = 'SELECT wo.record_id AS wo_record_id, date_format(wo.date, \'%Y-%m-%d\') as date, wo.type AS wo_type, wo.completed AS completed, wo.invoiced AS invoiced, ' +
    ' organization AS account, wo.city AS wo_city, wo.state AS wo_state, description, customer, account_id, ' +
    ' wo.customer_id AS wo_customer_id, a.name AS a_name, c.name AS c_name, sa.city AS acc_city, sa.state AS acc_state ' +
    ' FROM work_orders wo ' +
    ' LEFT JOIN entities a ON wo.account_id = a.record_id ' +
    ' LEFT JOIN entities_addresses sa ON sa.record_id = wo.account_address_id ' +
    ' LEFT JOIN entities c ON wo.customer_id = c.record_id ' +
    ' WHERE wo.customer_id = ? ' + 
    ' ORDER BY wo.record_id DESC ' +
    ' limit 2000 ';
    try{
        const results = await database.query(sql, [c_id]);
        logger.info("Got Past Work Orders");

        res.json(results);
    }
    catch(error){
        logger.error("Past Work Orders: " + error);
        res.sendStatus(400);
    }
});

router.post('/getFPOrders', async (req,res) => {
    var wo_id = {};
    if(req.body){
        wo_id = req.body.wo_id;
    }

    const sql = ' SELECT record_id, work_order, date_format(order_date, \'%Y-%m-%d\') AS order_date, date_format(date_entered, \'%Y-%m-%d\') AS date_entered, ' +
    ' ship_to, bill_to, user_entered, discount, special_instructions, sales_order_id ' +
    ' FROM fairplay_orders WHERE work_order = ? ORDER BY date_entered DESC ';
    try{
        const results = await database.query(sql, [wo_id]);
        logger.info("Got FairPlay Orders");

        res.json(results);
    }
    catch(error){
        logger.error("Fair Play Orders: " + error);
        res.sendStatus(400);
    }
});

router.post('/getFPOrderById', async (req,res) => {
    var fp_id = {};
    if(req.body){
        fp_id = req.body.fp_id;
    }

    const sql = ' SELECT record_id, work_order, date_format(order_date, \'%Y-%m-%d\') AS order_date, date_format(date_entered, \'%Y-%m-%d\') AS date_entered, ' +
    ' ship_to, bill_to, user_entered, discount, special_instructions, sales_order_id ' +
    ' FROM fairplay_orders WHERE record_id = ?  ';
    try{
        const results = await database.query(sql, [fp_id]);
        logger.info("Got FairPlay Order by Id", fp_id);

        res.json(results);
    }
    catch(error){
        logger.error("Fair Play Order: " + error);
        res.sendStatus(400);
    }
});

router.post('/addNewFPOrder', async (req,res) => {
    var fp_data = {};
    if(req.body){
        fp_data = req.body.fp_data;
    }

    const sql = ' INSERT INTO fairplay_orders ( work_order, order_date, ship_to, bill_to, user_entered, discount, special_instructions, sales_order_id ) ' +
    ' VALUES ( ?, IFNULL(? ,DEFAULT(order_date)), ?, ?, IFNULL(? ,DEFAULT(user_entered)), IFNULL(? ,DEFAULT(discount)),  ' + 
    ' ?, ? ) ';
    try{
        const results = await database.query(sql, [fp_data.work_order, Util.convertISODateToMySqlDate(fp_data.order_date), fp_data.ship_to, fp_data.bill_to, fp_data.user_entered,
            fp_data.discount, fp_data.special_instructions, fp_data.sales_order_id]);
        logger.info("Added new fairplay order");

        res.json(results);
    }
    catch(error){
        logger.error("addNewFPOrder: " + error);
        res.sendStatus(400);
    }
});

router.post('/updateFPOrder', async (req,res) => {
    var fp_data = {};
    if(req.body){
        fp_data = req.body.fp_data;
    }

    if(!fp_data.record_id){
        logger.error("Bad/no record id for update fp order");
        res.sendStatus(400);
    }

    const sql = ' UPDATE fairplay_orders SET work_order = ?, order_date=?, ship_to=?, bill_to=?, user_entered=?, discount=?, ' + 
    ' special_instructions = ?, sales_order_id=?  ' +
    ' WHERE record_id = ? ';
    try{
        const results = await database.query(sql, [fp_data.work_order, Util.convertISODateToMySqlDate(fp_data.order_date), fp_data.ship_to, fp_data.bill_to, fp_data.user_entered,
            fp_data.discount, fp_data.special_instructions, fp_data.sales_order_id, fp_data.record_id]);
        logger.info("Added new fairplay order");

        res.json(results);
    }
    catch(error){
        logger.error("addNewFPOrder: " + error);
        res.sendStatus(400);
    }
});

router.post('/deleteFPOrder', async (req,res) => {
    var fpo_id ;
    if(req.body){
        if(req.body.fpo_id != null){
            fpo_id = req.body.fpo_id;
        }
    }

    const sql = ' DELETE FROM fairplay_orders WHERE record_id = ? ';

    try{
        const results = await database.query(sql, [fpo_id]);
        logger.info("Deleted deleteFPOrder: ", fpo_id);
        res.json(results);

    }
    catch(error){
        logger.error("Failed to deleteFPOrder: " + error);
        res.sendStatus(400);
    }
});

router.post('/getFPOrderItems', async (req,res) => {
    var fpo_id = {};
    if(req.body){
        fpo_id = req.body.fpo_id;
    }

    const sql = ' SELECT * FROM fairplay_orders_items WHERE fairplay_order = ? ORDER BY record_id ASC ';
    try{
        const results = await database.query(sql, [fpo_id]);
        logger.info("Got FairPlay Order Items");

        res.json(results);
    }
    catch(error){
        logger.error("Fair Play Order Items: " + error);
        res.sendStatus(400);
    }
});

router.post('/getAllFPOrderItems', async (req,res) => {
    
    const sql = ' SELECT fpoi.record_id, fpoi.fairplay_order, fpoi.model, fpoi.model_quantity, fpoi.color, fpoi.trim, fpoi.controller, ' + 
    ' fpoi.controller_quantity, fpoi.ctrl_case, fpoi.horn, date_format(fpoi.arrival_estimate, \'%m/%d/%Y\') AS arrival_estimate,  ' + 
    ' date_format(fpoi.arrival_date, \'%m/%d/%Y\') AS arrival_date, ' +
    ' wo.type, wo.record_id AS work_order, fpo.sales_order_id, date_format(fpo.order_date, \'%m/%d/%Y\') AS order_date ,  en.name AS job_name, en.state, en.city ' +
    '   FROM fairplay_orders_items fpoi ' +
    ' LEFT JOIN fairplay_orders fpo ON fpoi.fairplay_order = fpo.record_id ' +
    ' LEFT JOIN work_orders wo ON fpo.work_order = wo.record_id ' + 
    ' LEFT JOIN entities en ON wo.customer_id = en.record_id ' +
    ' ORDER BY record_id DESC ';
    
    try{
        const results = await database.query(sql);
        logger.info("Got All FairPlay Order Items");

        res.json(results);
    }
    catch(error){
        logger.error("All Fair Play Order Items: " + error);
        res.sendStatus(400);
    }
});

router.post('/searchAllFPOrderItems', async (req,res) => {

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

    const sql = 'SELECT fpoi.record_id, fpoi.fairplay_order, fpoi.model, fpoi.model_quantity, fpoi.color, fpoi.trim, fpoi.controller, ' + 
    ' fpoi.controller_quantity, fpoi.ctrl_case, fpoi.horn, date_format(fpoi.arrival_estimate, \'%m/%d/%Y\') AS arrival_estimate,  ' + 
    ' date_format(fpoi.arrival_date, \'%m/%d/%Y\') AS arrival_date, ' +
    ' wo.type, wo.record_id AS work_order, fpo.sales_order_id, date_format(fpo.order_date, \'%m/%d/%Y\') AS order_date ,  en.name AS job_name, en.state, en.city ' +
    '   FROM fairplay_orders_items fpoi ' +
    ' LEFT JOIN fairplay_orders fpo ON fpoi.fairplay_order = fpo.record_id ' +
    ' LEFT JOIN work_orders wo ON fpo.work_order = wo.record_id ' + 
    ' LEFT JOIN entities en ON wo.customer_id = en.record_id ' +
    ' WHERE ?? like ? ' +
    ' ORDER BY fpoi.record_id DESC ';

    try{
        const results = await database.query(sql, [table, search_query]);
        logger.info("Got FP Items by search", [table, search_query]);
        res.json(results);

    }
    catch(error){
        logger.error("Search FP Items: " + error);
        res.sendStatus(400);
    }
});



router.post('/addNewFPOrderItem', async (req,res) => {
    var fpi_data = {};
    if(req.body){
        fpi_data = req.body.fpi_data;
    }

    const sql = ' INSERT INTO fairplay_orders_items ( fairplay_order, model, model_quantity, color, trim, controller, controller_quantity, ctrl_case, horn ) ' +
    ' VALUES ( ?, ?, IFNULL(? ,DEFAULT(model_quantity)), ?, ? , ?, IFNULL(? ,DEFAULT(controller_quantity)), ?, ?) ';

    try{
        const results = await database.query(sql, [fpi_data.fairplay_order, fpi_data.model, fpi_data.model_quantity, fpi_data.color, fpi_data.trim,
            fpi_data.controller, fpi_data.controller_quantity, fpi_data.ctrl_case, fpi_data.horn ]);
        logger.info("Added new fairplay order item");

        res.json(results);
    }
    catch(error){
        logger.error("addNewFPOrderItem: " + error);
        res.sendStatus(400);
    }
});

router.post('/addMultipleFPOrderItems', async (req,res) => {
    var fpi_array;
    if(req.body){
        fpi_array = req.body.fpi_array;
    }

    const sql = ' INSERT INTO fairplay_orders_items ( fairplay_order, model, model_quantity, color, trim, controller, controller_quantity, ctrl_case, horn ) ' +
    ' VALUES ( ?, ?, IFNULL(? ,DEFAULT(model_quantity)), ?, ? , ?, IFNULL(? ,DEFAULT(controller_quantity)), ?, ?) ';

    async.forEachOf(fpi_array, async (fpi_data, i, callback) => {
        //will automatically call callback after successful execution
        try{
            const results = await database.query(sql, [fpi_data.fairplay_order, fpi_data.model, fpi_data.model_quantity, fpi_data.color, fpi_data.trim,
                fpi_data.controller, fpi_data.controller_quantity, fpi_data.ctrl_case, fpi_data.horn ]);
            
            return;
        }
        catch(error){     
            //callback(error);         
            throw error;                 
        }
    }, err=> {
        if(err){
            logger.error("addMultipleFPOrderItems: " + error);
            res.sendStatus(400);
        }else{
            logger.info("Added new fairplay order item");
            res.sendStatus(200);
        }
    })
});

router.post('/updateFPOrderItem', async (req,res) => {
    var fpi_data = {};
    if(req.body){
        fpi_data = req.body.fpi_data;
    }

    if(!fpi_data.record_id){
        logger.error("Bad/no record id for updateFPOrderItem")
        res.sendStatus(400);
    }

    const sql = ' UPDATE fairplay_orders_items  SET  fairplay_order=?, model=?, model_quantity=?, color=?, trim=?, controller=?, ' + 
    ' controller_quantity=?, ctrl_case=?, horn=?, arrival_estimate=?, arrival_date=?  ' +
    ' WHERE record_id = ? ';

    try{
        const results = await database.query(sql, [fpi_data.fairplay_order, fpi_data.model, fpi_data.model_quantity, fpi_data.color, fpi_data.trim,
            fpi_data.controller, fpi_data.controller_quantity, fpi_data.ctrl_case, fpi_data.horn,  Util.convertISODateToMySqlDate(fpi_data.arrival_estimate),
            Util.convertISODateToMySqlDate(fpi_data.arrival_date),fpi_data.record_id ]);
        logger.info("Added new fairplay order item");

        res.json(results);
    }
    catch(error){
        logger.error("updateFPOrderItem: " + error);
        res.sendStatus(400);
    }
});

router.post('/deleteFPOrderItem', async (req,res) => {
    var fpi_id ;
    if(req.body){
        if(req.body.fpi_id != null){
            fpi_id = req.body.fpi_id;
        }
    }

    const sql = ' DELETE FROM fairplay_orders_items WHERE record_id = ? ';

    try{
        const results = await database.query(sql, [fpi_id]);
        logger.info("Deleted deleteFPOrderItem: ", fpi_id);
        res.json(results);

    }
    catch(error){
        logger.error("Failed to deleteFPOrderItem: " + error);
        res.sendStatus(400);
    }
});



module.exports = router;