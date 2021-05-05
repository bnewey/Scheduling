const express = require('express');
const router = express.Router();
const pdf = require('html-pdf');
const fs = require('fs');
const woTemplate = require(`../documents/work_order_template`);
const taskListTemplate = require(`../documents/task_list_template`);
const crewJobsTemplate = require(`../documents/crew_jobs_template`);
const signScheduleTemplate = require(`../documents/sign_schedule_template`);


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

// router.post('/createTLPdf', async (req,res) => {
//     if(!req.body.data){
//         res.sendStatus(400);
//     }
//     var data = req.body.data;

//     const options = {
//         orientation: 'landscape'
//     };

    

//     pdf.create(taskListTemplate(data), options).toFile(`${process.env.PWD}/public/static/task_list.pdf`, (err)=> {
//         logger.info(process.env.PWD);
//         if(err){
//             res.sendStatus(400);
//             return Promise.reject();
//         }
//         res.sendStatus(200);
//         return Promise.resolve();
//     })

// });

router.post('/createTLPdf', async (req,res) => {
    if( !req.body.data){
        res.sendStatus(400);
    }
    
    var data = req.body.data;
    var columns = req.body.columns;
    const options = {
        orientation: 'landscape'
    };

    pdf.create(taskListTemplate( data, columns), options).toStream(function(err, stream){
        if(err){
            res.sendStatus(400);
        }
       
        res.set('Content-type', 'application/pdf');
        stream.pipe(res)

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

        doc.font(`${process.env.PWD}/public/static/fonts/ARIALBD.ttf`);
        doc.image(`${process.env.PWD}/public/static/PDFS/packing_slip-1.png`, 0, 0, {width: 600, height: 800})
        
        // add your content to the document here, as usual
        doc.fontSize(10).text(psObject.address_to_name, 31, 154);
        doc.text(psObject.contact_name, 61, 169);
        doc.text(psObject.address, 31,184);
        doc.text(psObject.city + ', ' + psObject.state + ' ' + psObject.zip, 31, 198);

        doc.text(psObject.job_reference, 30, 255);

        doc.fontSize(13).text(psObject.work_order, 45, 323);
        doc.fontSize(10).text(psObject.po_number, 147, 325);
        doc.text( psObject.date_ordered ? moment(psObject.date_ordered).format('MM/DD/YY') : "", 230, 325);
        doc.text( psObject.ship_date ? moment(psObject.ship_date).format('MM/DD/YY') : "", 300, 325);

        doc.font(`${process.env.PWD}/public/static/fonts/Arialnb.ttf`);

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

        doc.font(`${process.env.PWD}/public/static/fonts/ARIALBD.ttf`);

        doc.image(`${process.env.PWD}/public/static/PDFS/work_order_pdf.png`, 0, 0, {width: 610, height: 790})
        
        // add your content to the document here, as usual
        doc.fontSize(10).text(woObject.date ? moment(woObject.date).format('MM/DD/YYYY') : "", 340, 25 , {lineBreak: false});
        doc.text(woObject.requested_arrival_date ? moment(woObject.requested_arrival_date).format('MM/DD/YYYY') : "", 475,25)

        doc.fontSize(16).text(woObject.wo_record_id, 110, 40 , {lineBreak: false});
        doc.fontSize(8).text(woObject.requestor_init, 167, 38 , {lineBreak: false});
        doc.text(woObject.maker_init, 167, 49 , {lineBreak: false});
        doc.fontSize(11).text(woObject.po_number, 188, 44 , {lineBreak: false});
        doc.fontSize(11).text(woObject.purchase_order_required ? "X" : "", 257, 44 , {lineBreak: false});
        doc.text(woObject.type, 340, 43 , {lineBreak: false});

        doc.font(`${process.env.PWD}/public/static/fonts/Arialnb.ttf`);

        //Ship To 
        doc.text(woObject.c_address_to_name, 43, 71 , {lineBreak: false});
        doc.text(woObject.c_address, 43, 91 , {lineBreak: false});
        doc.text(woObject.c_residence ? 'X' : "", 293, 91 , {lineBreak: false});
        doc.text(woObject.c_city, 43, 111 , {lineBreak: false});
        doc.text(woObject.c_state, 205, 111 , {lineBreak: false});
        doc.text(woObject.c_zip, 241, 111 , {lineBreak: false});
        doc.text(woObject.c_contact_name, 43, 130 , {lineBreak: false});
        doc.text(woObject.c_contact_title ? woObject.c_contact_title : "", 205, 130 , {lineBreak: false});
        doc.text(woObject.c_work_phone, 43, 148 , {lineBreak: false});
        doc.text(woObject.c_cell_phone, 135, 148 , {lineBreak: false});
        doc.text(woObject.c_other_phone ? woObject.c_other_phone : '', 220, 148 , {lineBreak: false});

        //Bill To
        doc.text(woObject.a_address_to_name, 328, 71 , {lineBreak: false});
        doc.text(woObject.a_account_number, 510, 71 , {lineBreak: false});
        doc.text(woObject.a_address, 328, 91 , {lineBreak: false});
        doc.text(woObject.a_city, 328, 111 , {lineBreak: false});
        doc.text(woObject.a_state, 470, 111 , {lineBreak: false});
        doc.text(woObject.a_zip, 528, 111 , {lineBreak: false});
        doc.text(woObject.a_contact_name, 328, 130 , {lineBreak: false});
        doc.text(woObject.a_contact_title ? woObject.a_contact_title : "", 470, 130 , {lineBreak: false});
        doc.text(woObject.a_work_phone, 328, 148 , {lineBreak: false});
        doc.text(woObject.a_fax ? woObject.a_fax : "", 470, 148 , {lineBreak: false});
        
        doc.text(woObject.job_reference, 43, 167 , {lineBreak: false});

        doc.fontSize(10).text(woObject.notes, 43, 627, {width: 227})

        //Work Order Items Sections
        var loaners=woiArray.filter((w)=>w.item_type == 2);
        var repairs=woiArray.filter((w)=>w.item_type == 1);

        var billing_items=woiArray.filter((w)=>w.item_type == 3);

        if(loaners && loaners.length > 0){
            
            loaners.forEach((item,i)=>{
                if(i >= 8){
                    //new page?
                }
                doc.fontSize(10).text("X", 45 , (228 + i*13.7) , {lineBreak: false});
                doc.fontSize(8);
                doc.text(item.receive_date ? moment(item.receive_date).format('MM   DD   YYYY') : "" , 93, (230 + i*13.5), {lineBreak: false})
                doc.fontSize(7);
                doc.text( (item.quantity != 0 ? item.quantity : "") +" - " + item.description, 180, (230 + i*13.5), {lineBreak: false})
                
            })
        }

        if(repairs && repairs.length > 0){
            
            
            repairs.forEach((item,i)=>{
                if(i >= 8){
                    //new page?
                }
                doc.fontSize(10).text("X", 66 , (228 + i*13.7), {lineBreak: false});
                doc.fontSize(8);
                doc.text(item.receive_date ? moment(item.receive_date).format('MM   DD   YYYY') : "" , 93, (230 + i*13.5), {lineBreak: false})
                doc.fontSize(7);
                doc.text((item.quantity != 0 ? item.quantity : "")+ " - " + item.description, 180, (230 + i*13.5), {lineBreak: false})
                
            })
        }
            
        if(billing_items && billing_items.length > 0){
                //WOI Billing Items
                doc.fontSize(7);
                var index = 0;
                billing_items.forEach((item,i)=>{
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
                    doc.text(item.quantity != 0 ? item.quantity : "", 50 , (355 + index*13.5), {lineBreak: false})
                    doc.text(item.part_number ? item.part_number : "", 67, (355 + index*13.5), {lineBreak: false})
                    doc.text(item.description, 167, (355 + index*13.5), {lineBreak: false})
                    if(item.quantity != 0){
                        doc.text(item.price ? (item.price).toFixed(2) : "", 500, (355 + index*13.5), {lineBreak: false})
                        doc.text(item.price && item.quantity ? (item.price*item.quantity).toFixed(2) : "", 542, (355 + index*13.5), {lineBreak: false})
                    }
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


router.post('/createFairPlayOrderPdf', async (req,res) => {
    if(!req.body.fpOrder || !req.body.orderItems){
        res.sendStatus(400);
        return;
    }
    var fpOrder = req.body.fpOrder;
    var orderItems = req.body.orderItems;

    const makePdf = async() =>{
        const doc = new PDFDocument();

        doc.image(`${process.env.PWD}/public/static/PDFS/FairPlayOrderPDF.png`, 0, 0, {width: 600, height: 800})
        doc.font(`${process.env.PWD}/public/static/fonts/Arialnb.ttf`);

        // add your content to the document here, as usual
        doc.fontSize(10).text( fpOrder.order_date ? moment(fpOrder.order_date).format('MM/DD/YYYY') : "", 137, 155);
        doc.text(fpOrder.user_entered_name, 405, 155);
        doc.text(fpOrder.ship_to, 137, 192, {width: 123});
        doc.text(fpOrder.bill_to, 405, 192, {width: 110});
        doc.text(fpOrder.c_name, 137, 273, {width: 300});
        doc.text(fpOrder.discount+'%', 405,296);

        // doc.text(fpOrder.job_reference, 30, 250);

        doc.fontSize(8);
        if(orderItems && Array.isArray(orderItems)){
            orderItems.forEach((item,i)=>{
                doc.text(item.model, 130 , (332.3 + i*74.7))
                doc.text(item.model_quantity, 243, (332.3 + i*74.7))
                doc.text(item.color, 320, (332.3 + i*74.7))
                doc.text(item.trim, 444, (332.3 + i*74.7))
                doc.text(item.controller, 130, (344.2 + i*74.7))
                doc.text(item.controller_quantity, 243, (344.2 + i*74.7))
                doc.text(item.ctrl_case, 320, (344.2 + i*74.7))
                doc.text(item.horn, 444, (344.2 + i*74.7))
            })
        }

        doc.fontSize(10).text(fpOrder.special_instructions, 103, 643, {width: 400});
        

        doc.end();
        return await getStream.buffer(doc)
    }

    const pdfBuffer = await makePdf();

    res.setHeader('Content-disposition', 'inline;');
    res.setHeader('Content-type', 'application/pdf');
    res.send(pdfBuffer);
    
});


router.post('/createCrewJobPdf', async (req,res) => {
    if(!req.body.crew || !req.body.jobs){
        res.sendStatus(400);
    }
    var crew = req.body.crew;
    var jobs = req.body.jobs;

    const options = {
        orientation: 'landscape'
    };

    pdf.create(crewJobsTemplate(crew, jobs), options).toStream(function(err, stream){
        if(err){
            res.sendStatus(400);
        }
        //if(Buffer.isBuffer(stream) ){
            //res.send(stream);
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'test123.pdf');
        res.set('Content-type', 'application/pdf');
        stream.pipe(res)
        //}else{
        //    res.sendStatus(400);
        //}

    })

});

router.post('/createSignSchedulePdf', async (req,res) => {
    if( !req.body.signs){
        res.sendStatus(400);
    }
    var signs = req.body.signs;
    var columns = req.body.columns;
    
    const options = {
        orientation: 'landscape'
    };

    pdf.create(signScheduleTemplate( signs, columns), options).toStream(function(err, stream){
        if(err){
            res.sendStatus(400);
        }
       
        res.set('Content-type', 'application/pdf');
        stream.pipe(res)

    })

});



module.exports = router;