const express = require('express');
const multer = require('multer');
const router = express.Router();
const logger = require('../../logs');
const {checkPermission} = require('../util/util');
//Handle Database
const database = require('./db');

const storage = multer.diskStorage({
    destination: function(req,file, cb){
        cb(null, './uploads/')
    },
    filename: function(req,file,cb){
        cb(null, Date.now() + file.originalname);
    }
});

const fileFilter = (req,file,cb)=>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === "image/png"){
        cb(null, true);
    } else {
        //reject
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
})

router.route("/uploadImage")
    .post(upload.single('imageData'), async (req, res, next) => {
        console.log("req.body" , req.body);
        let imageData, fileData, user_id;
        if(req.body){
            imageData = req.body.imageData;
            fileData = req.body.fileData;
            user_id = req.body.user_id;
        }

        if(user && !checkPermission(user.perm_string, 'work_orders') && !user.isAdmin){
            logger.error("Bad permission", [user]);
            res.status(400).json({user_error: 'Failed permission check'});
            return;
        }

        const sql = ' INSERT INTO wo ( url, title, description, type ) ' + 
          ' VALUES ( ? , ? , ? , ? ) ';
    
    
        try{
    
            const results = await database.query(sql, [fileData.base64, imageData.title, imageData.description, "image"]);
            logger.info("uploadMediaItem " + imageData );
            res.json(results);
        }
        catch(error){
            res.status(400).json({user_error: 'Failed media upload ' + error});
            return
        }
    })

module.exports = {
    
    imageRouter: router,
}