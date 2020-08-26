const express = require('express');
var async = require("async");
const fetch = require('node-fetch');

const router = express.Router();

const logger = require('../../logs');
const User = require('../lib/user');

//Handle Database
const database = require('./db');

const {exhangeCodeForToken} = require('../lib/bouncie');

function checkBouncieToken(token, expires, authCode) {
    //Handle expired
    if(expires){
        if(new Date() > new Date(expires)){
            //refetch token
            logger.info("Token expired");
            return false;
        }
    }
    //Refetch token    
    if(!token && authCode){
        logger.info("No token");
        return false;
    }   
    //Dont refetch token
    return true;
}

router.post('/getBouncieLocations', async (req,res) => {
    var user;
    if(req.body){
        user = req.body.user;
    }
    if(!user.authCode || !user.id){
        console.error("Bad user info sent to getBouncieLocations");
        res.send({error:"authCode"});
        return;
    }

    const getLocations = async (token) =>{
        var url = 'https://api.bouncie.dev/v1/vehicles';
        try{
            var response = await fetch(url, {
                method: 'GET',
                headers: {
                'Authorization': token,
                "Content-Type": "application/json",
                }
            })
            
            //console.log("reponse", response);
            const dsa = await response.json();
            //res.send(dsa)
            //console.log("dsa",dsa)
            return dsa;
        }
        catch(error){
            logger.error("Vehicles (getBouncieLocations): " + error);
            //res.sendStatus(400);
            return error;
        }
    }

    if(!checkBouncieToken(user.token, user.expiresAt, user.authCode)){
        //Refetch token and get locations using new token
        exhangeCodeForToken( ROOT_URL, user.authCode )
        .then((data)=>{
            console.log("auth code", user.authCode);
            console.log("data from exchange", data);
            //Update database
            User.updateUserBouncie(database,user.authCode, data.access_token, data.expires_in, user.id)
            .then((updateResponse)=>{
                //Get locations
                getLocations(data.access_token)
                .then((locations)=>{
                    console.log("Locations", locations);
                    console.log("Got new token and got locations")
                    console.log("session", req.session);
                    res.send(locations);
                })
                .catch((error)=>{
                    logger.error(error);
                })
            })
            .catch((error)=>{
                console.error("Failed to update Bouncie access token in vehicles", error);
            })
        })
        .catch((error)=>{
            console.error("Failed to refetch after checkBouncieToken", error)
        })
        
    }else{
        //get locations using same old token
        getLocations(user.token)
        .then((locations)=>{
            console.log("Got locations for bouncie")
            res.send(locations);
        })
        .catch((error)=>{
            logger.error(error);
        });
    }

    
});

module.exports = router;