const express = require('express');
var async = require("async");
const fetch = require('node-fetch');

var session = require('express-session');
const router = express.Router();

const logger = require('../../logs');
const User = require('../lib/user');

//Handle Database
const database = require('./db');

const {exhangeCodeForToken} = require('../lib/bouncie');

function checkBouncieToken(token, expires, bouncieAuthCode) {
    //Handle expired
    if(expires){
        if(new Date() > new Date(expires)){
            //refetch token
            logger.info("Token expired");
            return false;
        }
    }
    //Refetch token    
    if(!token && bouncieAuthCode){
        logger.info("No token");
        return false;
    }   
    //Dont refetch token
    return true;
}

router.post('/getBouncieLocations', async (req,res) => {
    // i should be getting user from database not from client/nextjs
    //pulling from database means that I can update token,

    var user = await User.getUserById(database, req.session.passport.user);
        
    if(!user.bouncieAuthCode || !user.id){
        console.error("Bad user info sent to getBouncieLocations");
        res.send({error:"bouncieAuthCode"});
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
            
            const dsa = await response.json();
            return dsa;
        }
        catch(error){
            logger.error("Vehicles (getBouncieLocations): " + error);
            return error;
        }
    }

    if(!checkBouncieToken(user.bouncieToken, user.bouncieExpiresAt, user.bouncieAuthCode)){
        //Refetch token and get locations using new token
        exhangeCodeForToken( ROOT_URL, user.bouncieAuthCode )
        .then((data)=>{
            console.log("auth code", user.bouncieAuthCode);
            console.log("data from exchange", data);
            //Update database
            User.updateUserBouncie(database,user.bouncieAuthCode, data.access_token, data.expires_in, user.id)
            .then((updateResponse)=>{
                //Get locations
                getLocations(data.access_token)
                .then((locations)=>{
                    //console.log("Locations", locations);
                    console.log("Got new token and got locations")
                    res.send(locations);
                })
                .catch((error)=>{
                    logger.error(error);
                    console.log("get locations error");
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
        getLocations(user.bouncieToken)
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