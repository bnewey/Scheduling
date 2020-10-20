const express = require('express');
const router = express.Router();
const pdf = require('html-pdf');
const fs = require('fs');
const woTemplate = require(`../documents/work_order_template`);
const taskListTemplate = require(`../documents/task_list_template`);
const packingSlipTemplate = require(`../documents/packing_slip_template`);

const moment = require('moment');

const PDFDocument = require('pdfkit');
//const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const blobStream = require('blob-stream');
const getStream = require('get-stream');
 
const logger = require('../../logs');
//Handle Database
const database = require('./db');

router.post('/createWOPdf', async (req,res) => {
    if(!req.body.data){
        res.sendStatus(400);
    }
    var data = req.body.data;

    const options = {
        orientation: 'landscape'
    };

    

    pdf.create(woTemplate(data), options).toFile(`${process.env.PWD}/public/static/work_orders.pdf`, (err)=> {
        logger.info(process.env.PWD);
        if(err){
            res.sendStatus(400);
            return Promise.reject();
        }
        res.sendStatus(200);
        return Promise.resolve();
    })

});

router.post('/createTLPdf', async (req,res) => {
    if(!req.body.data){
        res.sendStatus(400);
    }
    var data = req.body.data;

    const options = {
        orientation: 'landscape'
    };

    

    pdf.create(taskListTemplate(data), options).toFile(`${process.env.PWD}/public/static/task_list.pdf`, (err)=> {
        logger.info(process.env.PWD);
        if(err){
            res.sendStatus(400);
            return Promise.reject();
        }
        res.sendStatus(200);
        return Promise.resolve();
    })

});

router.post('/fetchWOPdf', async (req,res) => {
    res.sendFile(`${__dirname}/pdfs/work_orders.pdf`);
});


router.post('/createPackingSlipPdf', async (req,res) => {
    if(!req.body.psObject || !req.body.woiArray){
        res.sendStatus(400);
    }
    var psObject = req.body.psObject;
    var woiArray = req.body.woiArray;

    const makePdf = async() =>{
        const doc = new PDFDocument();

        doc.image(`${process.env.PWD}/public/static/PDFS/packing_slip-1.png`, 0, 0, {width: 600, height: 800})
        
        // add your content to the document here, as usual
        doc.fontSize(10).text(psObject.entity_name, 30, 160);
        doc.text(psObject.contact_name, 60);
        doc.text(psObject.address, 30);
        doc.text(psObject.city + ', ' + psObject.state + ' ' + psObject.zip, 30);

        doc.text(psObject.job_reference, 30, 250);


        doc.fontSize(12).text(psObject.work_order, 45, 325);
        doc.fontSize(10).text(psObject.po_number, 155, 325);
        doc.text( psObject.date_ordered ? moment(psObject.date_ordered).format('MM/DD/YY') : "", 230, 325);
        doc.text( psObject.ship_date ? moment(psObject.ship_date).format('MM/DD/YY') : "", 300, 325);

        doc.fontSize(8);
        woiArray.forEach((item,i)=>{
            doc.text(item.quantity, 45 , (367 + i*14))
            doc.text(item.part_number, 95, (367 + i*14))
            doc.text(item.description, 150, (367 + i*14))
            
        })

        doc.end();
        return await getStream.buffer(doc)
    }

    const pdfBuffer = await makePdf();

    res.setHeader('Content-disposition', 'inline;');
    res.setHeader('Content-type', 'application/pdf');
    res.send(pdfBuffer);
    
});

router.post('/createWorkOrderPdf', async (req,res) => {
    if(!req.body.woObject || !req.body.woiArray){
        res.sendStatus(400);
    }
    var woObject = req.body.woObject;
    var woiArray = req.body.woiArray;

    const makePdf = async() =>{
        const doc = new PDFDocument();

        doc.image(`${process.env.PWD}/public/static/PDFS/work_order_pdf.png`, 0, 0, {width: 610, height: 790})
        
        // add your content to the document here, as usual
        doc.fontSize(10).text(woObject.date ? moment(woObject.date).format('MM/DD/YYYY') : "", 340, 27 , {lineBreak: false});
        doc.text(woObject.requested_arrival_date ? moment(woObject.requested_arrival_date).format('MM/DD/YYYY') : "", 475,27)

        doc.fontSize(12).text(woObject.wo_record_id, 115, 42 , {lineBreak: false});
        doc.fontSize(7).text(woObject.requestor_init, 167, 39 , {lineBreak: false});
        doc.text(woObject.maker_init, 167, 50 , {lineBreak: false});
        doc.fontSize(10).text(woObject.po_number, 190, 45 , {lineBreak: false});
        doc.text(woObject.type, 340, 45 , {lineBreak: false});

        //Ship To 
        doc.text(woObject.c_entity_name, 43, 73 , {lineBreak: false});
        doc.text(woObject.c_address, 43, 93 , {lineBreak: false});
        doc.text(woObject.c_residence ? 'X' : "", 293, 93 , {lineBreak: false});
        doc.text(woObject.c_city, 43, 113 , {lineBreak: false});
        doc.text(woObject.c_state, 205, 113 , {lineBreak: false});
        doc.text(woObject.c_zip, 241, 113 , {lineBreak: false});
        doc.text(woObject.c_contact_name, 43, 133 , {lineBreak: false});
        doc.text(woObject.c_contact_title ? woObject.c_contact_title : "", 205, 133 , {lineBreak: false});
        doc.text(woObject.c_work_phone, 43, 151 , {lineBreak: false});
        doc.text(woObject.c_cell_phone, 135, 151 , {lineBreak: false});
        doc.text(woObject.c_other_phone ? woObject.c_other_phone : '', 220, 151 , {lineBreak: false});

        //Bill To
        doc.text(woObject.a_entity_name, 328, 73 , {lineBreak: false});
        doc.text(woObject.a_account_number, 510, 73 , {lineBreak: false});
        doc.text(woObject.a_address, 328, 93 , {lineBreak: false});
        doc.text(woObject.a_city, 328, 113 , {lineBreak: false});
        doc.text(woObject.a_state, 470, 113 , {lineBreak: false});
        doc.text(woObject.a_zip, 528, 113 , {lineBreak: false});
        doc.text(woObject.a_contact_name, 328, 133 , {lineBreak: false});
        doc.text(woObject.a_contact_title ? woObject.a_contact_title : "", 470, 133 , {lineBreak: false});
        doc.text(woObject.a_work_phone, 328, 151 , {lineBreak: false});
        doc.text(woObject.a_fax ? woObject.a_fax : "", 470, 151 , {lineBreak: false});
        
        doc.text(woObject.job_reference, 43, 170 , {lineBreak: false});

        doc.text(woObject.notes, 43, 630, {width: 230})

        //Work Order Items Sections
        var loaners=woiArray.filter((w)=>w.item_type == 2);
        var repairs=woiArray.filter((w)=>w.item_type == 1);
        repairs =[...repairs, ...repairs, ...repairs, ...repairs];

        var billing_items=woiArray.filter((w)=>w.item_type == 3);

        if(loaners && loaners.length > 0){
            doc.text("X", 45 , 230, {lineBreak: false});
            loaners.forEach((item,i)=>{
                if(i >= 8){
                    //new page?
                }
                doc.fontSize(8);
                doc.text(item.receive_date ? moment(item.receive_date).format('MM   DD   YYYY') : "" , 93, (232 + i*13.5), {lineBreak: false})
                doc.fontSize(7);
                doc.text(item.description, 220, (232 + i*13.5), {lineBreak: false})
                
            })
        }

        if(repairs && repairs.length > 0){
            doc.text("X", 66 , 230, {lineBreak: false});
            
            repairs.forEach((item,i)=>{
                if(i >= 8){
                    //new page?
                }
                doc.fontSize(8);
                doc.text(item.receive_date ? moment(item.receive_date).format('MM   DD   YYYY') : "" , 93, (232 + i*13.5), {lineBreak: false})
                doc.fontSize(7);
                doc.text(item.description, 220, (232 + i*13.5), {lineBreak: false})
                
            })
        }
            
        if(billing_items && billing_items.length > 0){
                //WOI Billing Items
                doc.fontSize(7);
                var index = 0;
                woiArray.forEach((item,i)=>{
                    if(index >= 20){
                        //new page
                        index=0;
                        doc.addPage()
                        doc.image(`${process.env.PWD}/public/static/PDFS/work_order_pdf.png`, 0, 0, {width: 610, height: 790})
                        doc.fontSize(10);
                        doc.text(woObject.c_entity_name, 43, 73 , {lineBreak: false});
                        doc.text(woObject.a_entity_name, 328, 73 , {lineBreak: false});
                        doc.fontSize(7);
                    }
                    doc.text(item.quantity, 50 , (355 + index*13.5), {lineBreak: false})
                    doc.text(item.part_number ? item.part_number : "", 67, (355 + index*13.5), {lineBreak: false})
                    doc.text(item.description, 167, (355 + index*13.5), {lineBreak: false})
                    doc.text(item.price ? (item.price).toFixed(2) : "", 500, (355 + index*13.5), {lineBreak: false})
                    doc.text(item.price && item.quantity ? (item.price*item.quantity).toFixed(2) : "", 542, (355 + index*13.5), {lineBreak: false})
                    index++;
                })
        }

        //End of WOI section


        

        doc.end();
        return await getStream.buffer(doc)
    }

    const pdfBuffer = await makePdf();

    logger.info("Created WorkOrderPDF");

    res.setHeader('Content-disposition', 'inline;');
    res.setHeader('Content-type', 'application/pdf');
    res.send(pdfBuffer);
    
});



module.exports = router;