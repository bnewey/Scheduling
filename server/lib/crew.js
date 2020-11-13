const express = require('express');
var async = require("async");

const router = express.Router();

const logger = require('../../logs');
//Handle Database
const database = require('./db');


router.post('/addCrewMember', async (req,res) => {
    var name;
    if(req.body){
        name = req.body.name;
    }

    const sql = ' INSERT INTO crew_members_available (member_name) VALUES (?)';

    try{
        const response = await database.query(sql, name);
        logger.info("Added Crew member: " + name );
        res.sendStatus(200);
    }
    catch(error){
        logger.error("Crew (addCrewMember): " + error);
        res.sendStatus(400);
    }
});

router.post('/deleteCrewMember', async (req,res) => {
    const sql = 'DELETE FROM crew_members_available WHERE id = ? LIMIT 1';
    var id;
    if(req.body){
        id = req.body.id;
    }
    
    try{
        const results = await database.query(sql, id);
        logger.info("Deleted crew member " + id);
        res.sendStatus(200);
    }
    catch(error){
        logger.error("Crew (deleteCrewMember): " + error);
        res.sendStatus(400);
    }
});

router.post('/updateCrewMember', async (req,res) => {
    var name, id;
    if(req.body){
        name = req.body.name;
        id = req.body.id;
    }

    const sql = 'UPDATE crew_members_available SET member_name = ? ' +
    ' WHERE id = ? ';
    
    try{
        const response = await database.query(sql, [name, id]);
        logger.info("Updated crew member to" + name);
        res.sendStatus(200);
    }
    catch(error){
        logger.error("Crews (updateCrewMember): " + error);
        res.sendStatus(400);
    }
});


router.post('/getCrewMembersByTask', async (req,res) => {
    var id;
    if(req.body){
        id = req.body.id;
    }

    const sql = ' SELECT j.id, j.task_id, j.date_assigned, cm.id as m_id, ma.member_name, j.job_type, cm.is_leader, cm.crew_id, ' + 
        ' t.name, date_format(t.drill_date, \'%Y-%m-%d %H:%i:%S\') as drill_date, date_format(t.install_date, \'%Y-%m-%d %H:%i:%S\') as install_date ' + 
        ' FROM crew_jobs j ' + 
        ' LEFT JOIN crew_members_available ma ON cm.member_id = ma.id ' + 
        ' LEFT JOIN crew_members cm ON j.crew_id = m.crew_id ' +
        ' LEFT JOIN tasks t ON j.task_id = t.id ' + 
        ' WHERE task_id = ? ';

    try{
        const results = await database.query(sql, [id]);
        logger.info("Got crew members by task", id);
        res.json(results);
    }
    catch(error){
        logger.error("Crews (getCrewMembersByTask): " + error);
        res.sendStatus(400);
    }
});

router.post('/getCrewMembersByCrew', async (req,res) => {
    var crew_id;
    if(req.body){
        crew_id = req.body.crew_id;
    }

    const sql = ' SELECT  cm.id as id, ma.member_name, cm.is_leader, cm.crew_id, cc.id as crew_id ' + 
        ' FROM crew_members cm ' + 
        ' LEFT JOIN crew_members_available ma ON cm.member_id = ma.id ' + 
        ' LEFT JOIN crew_crews cc ON cc.id = cm.crew_id ' + 
        ' WHERE cm.crew_id = ? ';

    try{
        const results = await database.query(sql, [crew_id]);
        logger.info("Got crew members by Crew", crew_id);
        res.json(results);
    }
    catch(error){
        logger.error("Crews (getCrewMembersByCrew): " + error);
        res.sendStatus(400);
    }
});

router.post('/getCrewJobsByMember', async (req,res) => {
    var id;
    if(req.body){
        id = req.body.id;
    }
    if(!id){
        logger.error("Id is not valid in getCrewJobsByMember");
        res.sendStatus(400);
    }

    const sql = ' SELECT j.id, j.task_id, j.date_assigned, j.job_type, j.crew_id, ' + 
            ' cm.is_leader, cm.id as cm_id, ma.member_name, ma.id as ma_id,  ' +
            ' t.name as t_name, date_format(t.drill_date, \'%Y-%m-%d %H:%i:%S\') as drill_date, date_format(t.install_date, \'%Y-%m-%d %H:%i:%S\') as install_date ' +
            ' FROM crew_jobs j ' +
            ' LEFT JOIN tasks t ON j.task_id = t.id ' +
            ' LEFT JOIN crew_members cm ON cm.crew_id = j.crew_id ' +
            ' LEFT JOIN crew_members_available ma ON ma.id = cm.member_id ' + 
            ' WHERE cm.member_id = ? ' ;
    
    try{
        const results = await database.query(sql, [id]);
        logger.info("Got crew jobs by member" + id);
        res.json(results);
    }
    catch(error){
        logger.error("Crews (getCrewJobsByMember): "+ id+ "  , " + error);
        res.sendStatus(400);
    }
});

router.post('/getCrewJobsByTask', async (req,res) => {
    var id;
    if(req.body){
        id = req.body.id;
    }
    if(!id){
        logger.error("Id is not valid in getCrewJobsByTask");
        res.sendStatus(400);
    }

    const sql = ' SELECT j.id, j.task_id, j.date_assigned, j.job_type, j.crew_id, ma.member_name, ' + 
            ' cm.id as crew_leader_id,  ' +
            ' t.name as t_name, date_format(t.drill_date, \'%Y-%m-%d %H:%i:%S\') as drill_date, date_format(t.install_date, \'%Y-%m-%d %H:%i:%S\') as install_date ' +
            ' FROM crew_jobs j ' +
            ' LEFT JOIN tasks t ON j.task_id = t.id ' +
            ' LEFT JOIN crew_crews cc ON cc.id = j.crew_id  ' + 
            ' LEFT JOIN crew_members cm ON cm.is_leader = 1 AND cm.crew_id = cc.id ' +
            ' LEFT JOIN crew_members_available ma ON cm.member_id = ma.id ' +
            ' WHERE t.id = ? ' ;
    
    try{
        const results = await database.query(sql, [id]);
        logger.info("Got crew jobs by member" + id);
        res.json(results);
    }
    catch(error){
        logger.error("Crews (getCrewJobsByTask): "+ id+ "  , " + error);
        res.sendStatus(400);
    }
});

router.post('/getCrewJobsByTaskIds', async (req,res) => {
    var ids, job_type;
    if(req.body){
        ids = req.body.ids;
        job_type = req.body.job_type;
    }
    if(!ids || !job_type){
        logger.error("Id is not valid in getCrewJobsByTaskIds");
        res.sendStatus(400);
    }

    const sql = ' SELECT j.id, j.task_id, j.date_assigned, j.job_type, j.crew_members_id, m.member_name, m.id as m_id, ' + 
            ' t.name as t_name, date_format(t.drill_date, \'%Y-%m-%d %H:%i:%S\') as drill_date, date_format(t.install_date, \'%Y-%m-%d %H:%i:%S\') as install_date ' +
            ' FROM crew_jobs j ' +
            ' LEFT JOIN tasks t ON j.task_id = t.id' + 
            ' LEFT JOIN crew_members m ON j.crew_members_id = m.id ' +
            ' WHERE j.task_id = ? AND j.job_type = ? ' ;
    
    var all_results = [];

    async.forEachOf(ids, async (id, i, callback) => {
        //will automatically call callback after successful execution
        try{
            const results = await database.query(sql, [id, job_type]);
            all_results = [...all_results, ...results];
            return;
        }
        catch(error){
            throw error;  
        }
    }, err=> {
        if(err){
            logger.error("Crews (getCrewJobsByTaskIds): "+ ids+ " "+ job_type +"  , " + error);
            res.sendStatus(400);
        }else{
            logger.info("Got crew jobs by task ids" + ids + job_type);
            res.json(all_results);
        }
    })
});

router.post('/getCrewMembers', async (req,res) => {
    const sql = ' SELECT * FROM crew_members_available ' ;
    
    try{
        const results = await database.query(sql, []);
        logger.info("Got crew members");
        res.json(results);
    }
    catch(error){
        logger.error("Crews (getCrewMembers): " + error);
        res.sendStatus(400);
    }
});

router.post('/getAllCrewJobMembers', async (req,res) => {
    const sql = ' SELECT ' + 
    ' cm.id, cm.is_leader, ma.id as ma_id, ma.member_name, cm.crew_id ' +
    ' FROM crew_members cm ' +
    ' LEFT JOIN crew_members_available ma ON ma.id = cm.member_id ';
    
    try{
        const results = await database.query(sql, []);
        logger.info("Got all crew jobs");
        res.json(results);
    }
    catch(error){
        logger.error("Crews (getAllCrewJobs): " + error);
        res.sendStatus(400);
    }
});

router.post('/addNewCrewJobMember', async (req,res) => {
    var member_id, crew_id,is_leader;
    if(req.body){
        member_id = req.body.member_id || null;
        crew_id = req.body.crew_id || null;
        is_leader = req.body.is_leader || 0; 
    }

    if(member_id == null || crew_id == null){
        logger.error("Bad params for  addNewCrewJobMember");
        res.sendStatus(400);
    }

    var sql = ' INSERT INTO crew_members (member_id, crew_id, is_leader) VALUES (?, ? ,?)';
    

    try{
        const response = await database.query(sql, [member_id, crew_id, is_leader]);
        logger.info("Added Crew Job Member: " + member_id +"| into crew: " + crew_id + "| IsLeader: " + is_leader);
        res.json(response.insertId);        
    }
    catch(error){
        logger.error("Crew (addNewCrewJobMember): " + error);
        res.sendStatus(400);
    }
});


router.post('/deleteCrewJobMember', async (req,res) => {
    const sql = 'DELETE FROM crew_members WHERE id = ? AND crew_id = ? LIMIT 1';
    var m_id, crew_id;
    if(req.body){
        m_id = req.body.m_id;
        crew_id = req.body.crew_id;
    }
    
    try{
        const results = await database.query(sql, [m_id, crew_id]);
        logger.info("Deleted crew job member " + m_id);
        res.sendStatus(200);
    }
    catch(error){
        logger.error("Crew (deleteCrewJobMember): " + error);
        res.sendStatus(400);
    }
});

router.post('/getAllCrewJobs', async (req,res) => {
    const sql = ' SELECT j.id, j.task_id, j.date_assigned, j.job_type, j.crew_id , j.ordernum, ' + 
    ' t.name as t_name, date_format(t.drill_date, \'%Y-%m-%d %H:%i:%S\') as drill_date, date_format(t.install_date, \'%Y-%m-%d %H:%i:%S\') as install_date ' +
    ' FROM crew_jobs j ' +
    ' LEFT JOIN tasks t ON j.task_id = t.id ' ;
    
    try{
        const results = await database.query(sql, []);
        logger.info("Got all crew jobs");
        res.json(results);
    }
    catch(error){
        logger.error("Crews (getAllCrewJobs): " + error);
        res.sendStatus(400);
    }
});

router.post('/addCrewJobs', async (req,res) => {
    var ids, job_type, crew_id;
    if(req.body){
        ids = req.body.ids;
        job_type = req.body.job_type;
        crew_id = req.body.crew_id;
    }
    if(!ids || !job_type || !crew_id){
        logger.error("Id, jobtype, or crew is not valid in addCrewJobs");
        res.sendStatus(400);
    }

    const getMax = " SELECT MAX(ordernum)+1 as max_num  FROM crew_jobs cj WHERE crew_id = ?; "

    const sql = ' INSERT INTO crew_jobs (task_id, job_type, crew_id, ordernum) VALUES (? , ? , ?, ?)  ' + 
            ' ON DUPLICATE KEY UPDATE crew_id = VALUES(crew_id) '  ;
    
    var all_results = [];

    const data = await database.query(getMax, [ crew_id ])
    var max = data[0].max_num || 0;

    async.forEachOf(ids, async (id, i, callback) => {
        //will automatically call callback after successful execution
        try{
            all_results.push(await database.query(sql, [id, job_type, crew_id, max+i+1]));
            return;
        }
        catch(error){
            throw error;  
        }
    }, err=> {
        if(err){
            logger.error("Crews (addCrewJobs): "+ ids+ " "+ job_type +"  , " + err);
            res.sendStatus(400);
        }else{
            logger.info("Added by task ids: " + ids + " , job_type: " + job_type + " , crew_id:" + crew_id );
            res.json(all_results);
        }
    })
});

router.post('/deleteCrewJob', async (req,res) => {
    const sql = 'DELETE FROM crew_jobs WHERE id = ? LIMIT 1';
    var id;
    if(req.body){
        id = req.body.id;
    }
    
    try{
        const results = await database.query(sql, id);
        logger.info("Deleted crew job " + id);
        res.sendStatus(200);
    }
    catch(error){
        logger.error("Crew (deleteCrewJob): " + error);
        res.sendStatus(400);
    }
});

router.post('/updateCrewJob', async (req,res) => {
    var crew_id, job_id;
    if(req.body){
        crew_id = req.body.crew_id;
        job_id = req.body.job_id;
    }

    const sql = 'UPDATE crew_jobs SET crew_id = ?, date_assigned = now() ' +
    ' WHERE id = ? ';
    
    try{
        const response = await database.query(sql, [crew_id, job_id]);
        logger.info("Updated crew job " + job_id + " to crew: " + crew_id);
        res.sendStatus(200);
    }
    catch(error){
        logger.error("Crews (updateCrewJob): " + error);
        res.sendStatus(400);
    }
});

router.post('/updateCrewJobMember', async (req,res) => {
    var crew_id, member_id, is_leader, job_id;
    if(req.body){
        crew_id = req.body.crew_id;
        member_id = req.body.member_id;
        is_leader = req.body.is_leader;
        job_id = req.body.job_id;
    }

    const sql = 'UPDATE crew_members SET crew_id = ?, member_id = ?, is_leader = ? ' +
    ' WHERE id = ? ';
    
    try{
        const response = await database.query(sql, [crew_id, member_id, is_leader, job_id]);
        logger.info("Updated crew job Member " + crew_id + " " + member_id + " " + is_leader +" "+job_id);
        res.sendStatus(200);
    }
    catch(error){
        logger.error("Crews (updateCrewJobMember): " + error);
        res.sendStatus(400);
    }
});

router.post('/addNewCrew', async (req,res) => {

    var sql = ' INSERT INTO crew_crews () VALUES ()';

    try{
        const response = await database.query(sql);
        logger.info("Added Crew " );
        res.json(response.insertId);
    }
    catch(error){
        logger.error("Crew (addNewCrew): " + error);
        res.sendStatus(400);
    }
});

router.post('/deleteCrew', async (req,res) => {
    const sql = 'DELETE FROM crew_crews WHERE id = ? LIMIT 1';
    var crew_id;
    if(req.body){
        crew_id = req.body.crew_id;
    }
    
    try{
        const results = await database.query(sql, crew_id);
        logger.info("Deleted crew " + crew_id);
        res.sendStatus(200);
    }
    catch(error){
        logger.error("Crew (deleteCrew): " + error);
        res.sendStatus(400);
    }
});


router.post('/getAllCrews', async (req,res) => {
    const sql = ' SELECT cc.id , ma.member_name AS crew_leader_name  ' + 
            ' FROM crew_crews cc ' +
            ' LEFT JOIN crew_members cm ON cm.is_leader = 1 AND cm.crew_id = cc.id ' + 
            ' LEFT JOIN crew_members_available ma ON ma.id = cm.member_id ' ;
    
    try{
        const results = await database.query(sql, []);
        logger.info("Got all crew jobs");
        res.json(results);
    }
    catch(error){
        logger.error("Crews (getAllCrews): " + error);
        res.sendStatus(400);
    }
});

router.post('/getCrewJobsByCrew', async (req,res) => {
    var crew_id;
    if(req.body){
        crew_id = req.body.crew_id;
    }

    const sql = ' SELECT j.id, j.task_id, j.date_assigned, j.job_type, j.crew_id, j.ordernum, ' + 
    ' cm.id as crew_leader_id,  ' +
    ' t.name as t_name, date_format(t.drill_date, \'%Y-%m-%d %H:%i:%S\') as drill_date, date_format(t.install_date, \'%Y-%m-%d %H:%i:%S\') as install_date ' +
    ' FROM crew_jobs j ' +
    ' LEFT JOIN tasks t ON j.task_id = t.id ' +
    ' LEFT JOIN crew_crews cc ON cc.id = j.crew_id  ' + 
    ' LEFT JOIN crew_members cm ON cm.is_leader = 1 AND cm.crew_id = cc.id ' +
    ' WHERE cc.id = ? ORDER BY j.ordernum  ';
    
    try{
        const results = await database.query(sql, [crew_id]);
        logger.info("Got crew jobs " + crew_id );
        res.json(results);
    }
    catch(error){
        logger.error("Crews (getCrewJobsByCrew): " + error);
        res.sendStatus(400);
    }
});

router.post('/reorderCrewJobs', async (req,res) => {
    var crew_id, cj_array;
    if(req.body){
        crew_id = req.body.crew_id;
        cj_array = req.body.cj_array;
    }
    
    const sql = ' UPDATE crew_jobs SET ordernum = ? ' +
    ' WHERE id = ? AND crew_id = ? ';


    async.forEachOf(cj_array, async (id, i, callback) => {
        //will automatically call callback after successful execution
        try{
            const results = await database.query(sql, [i+1, id, crew_id]);
            return;
        }
        catch(error){     
            //callback(error);         
            throw error;                 
        }
    }, err=> {
        if(err){
            logger.error("Crew (reorderCrewJobs): " + err);
            res.sendStatus(400);
        }else{
            logger.info("reorderCrewJobs: " + crew_id);
            res.sendStatus(200);
        }
    })
});


module.exports = router;