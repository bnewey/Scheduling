const express = require('express');
var async = require("async");

const router = express.Router();

const logger = require('../../logs');
//Handle Database
const database = require('./db');
const Util = require('../../js/Util');

const reorderCrewJobsFromDB = async function(crew_id){
    return new Promise(async function (resolve, reject) {
        const selector = ' SELECT * FROM crew_jobs WHERE crew_id = ? AND completed = 0 ';
        const sql = ' UPDATE crew_jobs SET ordernum = ? ' +
        ' WHERE id = ? AND crew_id = ? ';

        var crewJobs;
        try{
            crewJobs = await database.query(selector, [crew_id]);

            if(!crewJobs){    logger.error("crewJobs is null in reorderCrewJobsFromDB"); reject(-1);    }
            if(crewJobs.length == 0){ resolve(0) }

            async.forEachOf(crewJobs, async (job, i, callback) => {
                //will automatically call callback after successful execution
                try{
                    const results = await database.query(sql, [i+1, job.id, crew_id]);
                    return;
                }
                catch(error){   
                    //callback(error);         
                    throw error; 
                }
            }, err=> {
                if(err){
                    logger.error("Crew (reorderCrewJobs): " + err);
                    reject(-1);
                }else{
                    logger.info("reorderCrewJobs: " + crew_id);
                    resolve(1);
                }
            })
        }
        catch(error){
            logger.error("reorderCrewJobsFromDB failed in selector")
            reject(-1);
        }
    }) 
}


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

    const sql = ' SELECT j.id, j.task_id, j.date_assigned, cm.id as m_id, ma.member_name, j.job_type, j.num_services, cm.is_leader, cm.crew_id, ' + 
        ' t.name, date_format(j.job_date, \'%Y-%m-%d %H:%i:%S\') as drill_date, date_format(j.job_date, \'%Y-%m-%d %H:%i:%S\') as sch_install_date ' + 
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

    const sql = ' SELECT  cm.id as id, ma.member_name, cm.is_leader, cm.crew_id, cc.id as crew_id, cc.color AS crew_color' + 
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

    const sql = ' SELECT j.id, j.task_id, j.date_assigned, j.job_type, j.num_services, j.crew_id, ' + 
            ' cm.is_leader, cm.id as cm_id, ma.member_name, ma.id as ma_id, j.ready, date_format(j.located, \'%Y-%m-%d\') as located,  date_format(j.diagram, \'%Y-%m-%d\') as diagram, ' +
            ' t.name as t_name, date_format(j.job_date, \'%Y-%m-%d %H:%i:%S\') as drill_date, date_format(j.job_date, \'%Y-%m-%d %H:%i:%S\') as sch_install_date ' +
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

    const sql = ' SELECT j.id,j.ready, date_format(j.located, \'%Y-%m-%d\') as located, date_format(j.diagram, \'%Y-%m-%d\') as diagram, j.task_id, j.date_assigned, j.job_type, j.num_services, j.crew_id, ma.member_name, j.completed, date_format(j.completed_date, \'%Y-%m-%d\') as completed_date,' + 
            ' cm.id as crew_leader_id, cc.color AS crew_color,  ' +
            ' t.name as t_name, date_format(j.job_date, \'%Y-%m-%d %H:%i:%S\') as drill_date, date_format(j.job_date, \'%Y-%m-%d %H:%i:%S\') as sch_install_date ' +
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

router.post('/getCrewJobsByTaskList', async (req,res) => {
    var tl_id;
    if(req.body){
        tl_id = req.body.tl_id;
    }
    if(!tl_id){
        logger.error("Id is not valid in getCrewJobsByTaskList");
        res.sendStatus(400);
    }


    const sql = ' SELECT tl.id as tl_id, tl.list_name as tl_name, j.id, t.id AS task_id, j.date_assigned, j.ordernum, ' + 
            ' j.job_type, j.num_services,j.ready, date_format(j.located, \'%Y-%m-%d\') as located, date_format(j.diagram, \'%Y-%m-%d\') as diagram , j.crew_id, ma.member_name AS leader_name, j.completed, date_format(j.completed_date, \'%Y-%m-%d\') as completed_date,' + 
            ' cm.id as crew_leader_id, cc.color AS crew_color,  t.table_id,wo.record_id AS wo_id, wo.description, wo.notes, ' +
            ' ea.lat, ea.lng, ea.geocoded, ea.address, ea.city, ea.state, ea.zip, ' +
            '  concat(e.name, \', \', ea.city, \', \', ea.state  ) AS t_name, date_format(j.job_date, \'%Y-%m-%d %H:%i:%S\') as drill_date, date_format(j.job_date, \'%Y-%m-%d %H:%i:%S\') as sch_install_date, ' +
            ' date_format(j.job_date, \'%Y-%m-%d %H:%i:%S\') as job_date ' +
            ' FROM task_list_items tli ' +
            ' LEFT JOIN task_list tl ON tli.task_list_id = tl.id ' +
            ' LEFT JOIN tasks t ON t.id = tli.task_id ' +  
            ' LEFT JOIN crew_jobs j ON j.task_id = t.id ' +
            ' LEFT JOIN crew_crews cc ON cc.id = j.crew_id  ' + 
            ' LEFT JOIN crew_members cm ON cm.is_leader = 1 AND cm.crew_id = cc.id ' +
            ' LEFT JOIN crew_members_available ma ON cm.member_id = ma.id ' +
            ' LEFT JOIN work_orders wo ON wo.record_id = t.table_id '  + 
            ' LEFT JOIN entities e ON wo.customer_id = e.record_id '  +
            ' LEFT JOIN entities_addresses ea ON wo.customer_address_id = ea.record_id  ' +
            ' WHERE tli.task_list_id = ? ' ;
    
    try{
        const results = await database.query(sql, [tl_id]);
        logger.info("Got crew jobs by member" + tl_id);
        res.json(results);
    }
    catch(error){
        logger.error("Crews (getCrewJobsByTaskList): "+ tl_id+ "  , " + error);
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

    const sql = ' SELECT j.id,j.ready, date_format(j.located, \'%Y-%m-%d\') as located, date_format(j.diagram, \'%Y-%m-%d\') as diagram, j.num_services, j.task_id, j.date_assigned, j.job_type, j.crew_members_id, m.member_name, m.id as m_id, ' + 
            ' t.name as t_name, date_format(j.job_date, \'%Y-%m-%d %H:%i:%S\') as drill_date, date_format(j.job_date, \'%Y-%m-%d %H:%i:%S\') as sch_install_date ' +
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
    const sql = ' SELECT j.id,j.ready, date_format(j.located, \'%Y-%m-%d\') as located, date_format(j.diagram, \'%Y-%m-%d\') as diagram, j.task_id, j.date_assigned, j.num_services, j.job_type, j.crew_id , j.ordernum, j.completed, j.completed_date, ' + 
    ' t.name as t_name, date_format(j.job_date, \'%Y-%m-%d %H:%i:%S\') as drill_date, date_format(j.job_date, \'%Y-%m-%d %H:%i:%S\') as sch_install_date ' +
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
        date = req.body.date;
    }
    if(!ids || !job_type ){
        logger.error("Id, jobtype, or crew is not valid in addCrewJobs");
        res.sendStatus(400);
    }

    const getMax = " SELECT MAX(ordernum)+1 as max_num  FROM crew_jobs cj WHERE crew_id = ?; "

    const sql = ' INSERT INTO crew_jobs (task_id, job_type, crew_id, ordernum, job_date) VALUES (? , ? , ?, ?,?)  ' + 
            ' ON DUPLICATE KEY UPDATE crew_id = VALUES(crew_id) '  ;
    
    var all_results = [];

    const data = await database.query(getMax, [ crew_id ])
    var max = data[0].max_num || 0;

    async.forEachOf(ids, async (id, i, callback) => {
        //will automatically call callback after successful execution
        try{
            all_results.push(await database.query(sql, [id, job_type, crew_id, max+i, date]));
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
            logger.info("Added by task ids: " + ids + " , job_type: " + job_type + " , crew_id:" + crew_id + ', date: ' + date);
            res.json(all_results);
        }
    })
});

router.post('/deleteCrewJob', async (req,res) => {
    const sql = 'DELETE FROM crew_jobs WHERE id = ? LIMIT 1';
    var id, crew_id;
    if(req.body){
        id = req.body.id;
        crew_id = req.body.crew_id;
    }
    
    try{
        const results = await database.query(sql, id);
        logger.info("Deleted crew job " + id);

        //Reorder crew jobs to maintain correct order
        if(crew_id){
            logger.info("Attempting to reorder crew");
            var reorderStatus = await reorderCrewJobsFromDB(crew_id)
            logger.info("Reorder status " + reorderStatus)
            if(reorderStatus == 1){
                logger.info("Reordered crew" + crew_id);
            }else{
                if(reorderStatus == 0){  logger.info("Did not reorder on delete") };
                if(reorderStatus == -1){ logger.info("Error in reorderCrewJobsFromDB")}
            }
        }
        
        res.sendStatus(200);
    }
    catch(error){
        logger.error("Crew (deleteCrewJob): " + error);
        res.sendStatus(400);
    }
});

router.post('/updateCrewJob', async (req,res) => {
    var crew_id, job_id, old_crew_id;
    if(req.body){
        crew_id = req.body.crew_id;
        job_id = req.body.job_id;
        old_crew_id = req.body.old_crew_id;
    }

    const getMax = " SELECT MAX(ordernum)+1 as max_num  FROM crew_jobs cj WHERE crew_id = ? AND completed = 0; "

    const sql = 'UPDATE crew_jobs SET crew_id = ?, date_assigned = now(), ordernum = ? ' +
    ' WHERE id = ? ';
    
    try{
        var data = await database.query(getMax, [ crew_id ]);
        var max = data[0].max_num || 0;
        
        const response = await database.query(sql, [crew_id, max, job_id  ]);

        //Reorder crew jobs to maintain correct order
        if(old_crew_id){
            logger.info("Attempting to reorder crew");
            var reorderStatus = await reorderCrewJobsFromDB(old_crew_id)
            logger.info("Reorder status " + reorderStatus)
            if(reorderStatus == 1){
                logger.info("Reordered crew" + old_crew_id);
            }else{
                if(reorderStatus == 0){  logger.info("Did not reorder on delete") };
                if(reorderStatus == -1){ logger.info("Error in reorderCrewJobsFromDB")}
            }
        }

        logger.info("Updated crew job " + job_id + " to crew: " + crew_id + " from crew: " + old_crew_id);
        res.sendStatus(200);
    }
    catch(error){
        logger.error("Crews (updateCrewJob): " + error);
        res.sendStatus(400);
    }
});

router.post('/updateCrewJobDate', async (req,res) => {
    var date, job_id;
    if(req.body){
        date = req.body.date;
        job_id = req.body.job_id;
    }

    const sql = 'UPDATE crew_jobs SET job_date = ? ' +
    ' WHERE id = ? ';
    
    try{        
        const response = await database.query(sql, [date, job_id  ]);

        logger.info("Updated crew job " + job_id + " to date: " + date );
        res.sendStatus(200);
    }
    catch(error){
        logger.error("Crews (updateCrewJobDate): " + error);
        res.sendStatus(400);
    }
});

router.post('/updateCrewJobType', async (req,res) => {
    var type, job_id;
    if(req.body){
        type = req.body.type;
        job_id = req.body.job_id;
    }

    const sql = 'UPDATE crew_jobs SET job_type = ? ' +
    ' WHERE id = ? ';
    
    try{        
        const response = await database.query(sql, [type, job_id  ]);

        logger.info("update crew job " + job_id + " to type: " + type );
        res.sendStatus(200);
    }
    catch(error){
        logger.error("Crews (updateCrewJobType): " + error);
        res.sendStatus(400);
    }
});

router.post('/updateCrewJobReady', async (req,res) => {
    var ready, job_id;
    if(req.body){
        ready = req.body.ready;
        job_id = req.body.job_id;
    }

    const sql = 'UPDATE crew_jobs SET ready = ? ' +
    ' WHERE id = ? ';
    
    try{        
        const response = await database.query(sql, [ready, job_id  ]);

        logger.info("update crew job " + job_id + " to ready: " + ready );
        res.sendStatus(200);
    }
    catch(error){
        logger.error("Crews (updateCrewJobReady): " + error);
        res.sendStatus(400);
    }
});

router.post('/updateCrewJobLocated', async (req,res) => {
    var located, job_id;
    if(req.body){
        located = req.body.located;
        job_id = req.body.job_id;
    }

    const sql = 'UPDATE crew_jobs SET located = ? ' +
    ' WHERE id = ? ';
    
    try{        
        const response = await database.query(sql, [Util.convertISODateToMySqlDate(located), job_id  ]);

        logger.info("update crew job " + job_id + " to located: " + located );
        res.sendStatus(200);
    }
    catch(error){
        logger.error("Crews (updateCrewJobLocated): " + error);
        res.sendStatus(400);
    }
});

router.post('/updateCrewJobDiagram', async (req,res) => {
    var diagram, job_id;
    if(req.body){
        diagram = req.body.diagram;
        job_id = req.body.job_id;
    }

    const sql = 'UPDATE crew_jobs SET diagram = ? ' +
    ' WHERE id = ? ';
    
    try{        
        const response = await database.query(sql, [Util.convertISODateToMySqlDate(diagram), job_id  ]);

        logger.info("update crew job " + job_id + " to diagram: " + diagram );
        res.sendStatus(200);
    }
    catch(error){
        logger.error("Crews (updateCrewJobDiagram): " + error);
        res.sendStatus(400);
    }
});


router.post('/updateCrewNumServices', async (req,res) => {
    var numServices, job_id;
    if(req.body){
        numServices = req.body.numServices;
        job_id = req.body.job_id;
    }

    const sql = 'UPDATE crew_jobs SET num_services = ? ' +
    ' WHERE id = ? ';
    
    try{        
        const response = await database.query(sql, [numServices, job_id  ]);

        logger.info("Updated crew job " + job_id + " to numServices: " + numServices );
        res.sendStatus(200);
    }
    catch(error){
        logger.error("Crews (updateCrewNumServices): " + error);
        res.sendStatus(400);
    }
});

router.post('/updateCrewJobCompleted', async (req,res) => {
    //if completing job, remove its ordernum and set comp date
    //if uncompleting job, find max and set ordernum and remove comp date
    var  job_id, completed, crew_id;
    if(req.body){
        completed = req.body.completed;
        job_id = req.body.job_id;
        crew_id = req.body.crew_id;
    }
    var completed_date;
    if(completed){
        completed_date = new Date();
    }else{
        completed_date = null;
    }

    const getMax = " SELECT MAX(ordernum)+1 as max_num  FROM crew_jobs cj " + 
                " WHERE cj.crew_id = ? "

    const sql = 'UPDATE crew_jobs SET completed = ?, completed_date = ?, ordernum = ? ' +
    ' WHERE id = ? ';
    
    try{
        var data;
        var max = 0;
        if(!completed && crew_id != null){
            data = await database.query(getMax, [ crew_id ])
            max = data[0].max_num;
        }

        const response = await database.query(sql, [ completed, Util.convertISODateTimeToMySqlDateTime(completed_date),max , job_id]);

        if(completed && crew_id != null){
            //Reorder crew jobs to maintain correct order
            logger.info("Attempting to reorder crew");
            var reorderStatus = await reorderCrewJobsFromDB(crew_id)
            logger.info("Reorder status " + reorderStatus)
            if(reorderStatus == 1){
                logger.info("Reordered crew" + crew_id);
            }else{
                if(reorderStatus == 0){  logger.info("Did not reorder on delete") };
                if(reorderStatus == -1){ logger.info("Error in reorderCrewJobsFromDB")}
            }
        }
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
    const sql = ' SELECT cc.id , ma.member_name AS crew_leader_name, cc.color AS crew_color  ' + 
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

    const sql = ' SELECT j.id, j.task_id, j.date_assigned, j.job_type, j.crew_id, j.ordernum, j.num_services, j.completed, date_format(j.completed_date, \'%Y-%m-%d\') as completed_date, ' + 
    ' cm.id as crew_leader_id, cma.member_name AS leader_name, cc.color AS crew_color, cc.id AS crew_id, ' +
    ' t.name as t_name, date_format(j.job_date, \'%Y-%m-%d\') as drill_date, date_format(j.job_date, \'%Y-%m-%d\') as sch_install_date, ' +
    ' ea.lat, ea.lng, ea.geocoded, ea.address, ea.city, ea.state, ea.zip, ' +
    ' t.table_id, wo.description ' +
    ' FROM crew_jobs j ' +
    ' LEFT JOIN tasks t ON j.task_id = t.id ' +
    ' LEFT JOIN work_orders wo ON wo.record_id = t.table_id '  + 
    ' LEFT JOIN crew_crews cc ON cc.id = j.crew_id  ' + 
    ' LEFT JOIN crew_members cm ON cm.is_leader = 1 AND cm.crew_id = cc.id ' +
    ' LEFT JOIN crew_members_available cma ON cma.id = cm.member_id ' +
    ' LEFT JOIN entities_addresses ea ON wo.customer_address_id = ea.record_id  ' + 
    // ' LEFT JOIN entities_addresses ea ON (wo.customer_id = ea.entities_id AND ' + 
    // ' IF(ea.task = 1, true, ' + //selects task = 1 address if available, defaults to mail =1 
    //     ' IF(ea.main =1 AND NOT EXISTS(select address from entities_addresses where task = 1 AND entities_id = ea.entities_id), true, false ))) ' + 
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

router.post('/updateCrewColor', async (req,res) => {
    var color, id;
    if(req.body){
        color = req.body.color;
        id = req.body.id;
    }

    const sql = 'UPDATE crew_crews SET color = ? ' +
    ' WHERE id = ? ';
    
    try{
        const response = await database.query(sql, [color, id]);
        logger.info("Updated crew color to" + color);
        res.sendStatus(200);
    }
    catch(error){
        logger.error("Crews (updateCrewColor): " + error);
        res.sendStatus(400);
    }
});

module.exports = router;