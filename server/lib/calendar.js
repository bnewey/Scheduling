const express = require('express');
var async = require("async");
const router = express.Router();

const fetch = require('node-fetch');
const User = require('../lib/user');

const logger = require('../../logs');
//Handle Database
const database = require('./db');
var async = require("async");

router.get('/getCalendar', async (req,res) => {

    var user = await User.getUserById(database, req.session.passport.user);
    var event_array = [];
    console.log("Here");
    const getCalendar = async (token) =>{
        var url = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';
        try{
            var response = await fetch(url, {
                method: 'GET',
                headers: {
                'Authorization': 'Bearer ' + token,
                "Content-Type": "application/json",
                }
            })
            
            const dsa = await response.json();
            return dsa;
        }
        catch(error){
            logger.error("Calendar (getCalendar): " + error);
            return error;
        }
    }

    const getCalendarEvents = async (id,token) =>{
        var url = `https://www.googleapis.com/calendar/v3/calendars/${id}/events`;
        try{
            var response = await fetch(url, {
                method: 'GET',
                headers: {
                'Authorization': 'Bearer ' + token,
                "Content-Type": "application/json",
                }
            })
            
            const dsa = await response.json();
            return dsa;
        }
        catch(error){
            logger.error("Calendar (getCalendar): " + error);
            return error;
        }
    }


    getCalendar(user.accessToken)
    .then((data)=>{
        //console.log('data', data);
        var calendars = data.items;
        if(calendars.length > 0){
            
            async.forEachOf(calendars, async (item, i, callback) => {
                //will automatically call callback after successful execution
                try{
                    const cal_id = item.id;
                    const results = await getCalendarEvents(cal_id, user.accessToken);
                    event_array.push(results);
                    return;
                }
                catch(error){           
                    throw error;                 
                }
            }, err=> {
                if(err){
                    logger.error("Calendars (getCalendarEvents): " + err);
                    res.sendStatus(400);
                }else{
                    logger.info("Got calendar events: ");
                    res.json(event_array);
                }
            })
        }else{
            res.sendStatus(400);
        }

        //res.json(event_array);

        
    })
    .catch((error)=>{
        logger.error("Calendar (getCalendar): " + error);
        res.sendStatus(400);
    })

 });




module.exports = router;