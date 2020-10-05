const express = require('express');
const router = express.Router();

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
        ' ea.name AS address_name, ea.address, ea.city, ea.state, ea.record_id AS address_id, ' + 
        ' ea.zip, ea.lat, ea.lng, ea.geocoded, ea.entities_id ' + 
        ' FROM packing_slip ps ' + 
        ' LEFT JOIN work_orders wo ON wo.record_id = ps.work_order ' + 
        ' LEFT JOIN entities_addresses ea ON (wo.customer_id = ea.entities_id AND ea.shipping = 1 )' + 
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




module.exports = router;