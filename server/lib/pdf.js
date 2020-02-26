const express = require('express');
const router = express.Router();
const pdf = require('html-pdf');
const pdfTemplate = require(`../documents/work_order_template`);

const logger = require('../../logs');
//Handle Database
const database = require('./db');

router.post('/createPdf', async (req,res) => {
    if(!req.body.data){
        res.sendStatus(400);
    }
    var data = req.body.data;

    const options = {
        orientation: 'landscape'
    };

    

    pdf.create(pdfTemplate(data), options).toFile(`${process.env.PWD}/public/static/work_orders.pdf`, (err)=> {
        logger.info(process.env.PWD);
        if(err){
            res.sendStatus(400);
            return Promise.reject();
        }
        res.sendStatus(200);
        return Promise.resolve();
    })

});

router.post('/fetchPdf', async (req,res) => {
    res.sendFile(`${__dirname}/pdfs/work_orders.pdf`);
});


module.exports = router;