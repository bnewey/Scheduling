const mysql = require('mysql');

const pool=mysql.createPool({
    host: process.env.host,
    database: process.env.database,
    user: process.env.user,
    password: process.env.password
});


var db  = {pool: pool, machine_array: []};

//Not a function, but called when db.js is required
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
        return;
    }
    if (connection) { 
        console.log("Connected to MySql");
        connection.release();
    }
    return;
});

db.query = function(sql, params) {
    return new Promise( (resolve,reject) => {
        pool.query(sql, params, function (error,results) {
            if(error){
                console.log(error);
                console.log(sql, params);
                reject(error);
                return;
            }     

            var parsed = JSON.parse(JSON.stringify(results));
            if(parsed){
                resolve(parsed);
                return;
            }
            
        });
    })
}



//Log some of our reads into database for record keeping
//TODO: make async?
db.sendReadToSQL = function(data) {
    if(!data){
        return;
    }

    try {
        var json = JSON.parse(data);
    } catch (e){
        console.log(e);
        return;
    }
    /*
    //Check if array is undefined or empty
    if( !(Array.isArray(db.machine_array) && db.machine_array.length)){
        console.log("Call to mysql failed or problem with list of machines from mysql");
        return;
    }

    let machines = json;
    machines.forEach((item, index) =>{
        let post = {
            temp: item.temp,
            pressure: item.pressure,
            machine_id: item.id, 
            read_date: new Date() // NOW(), but on the server-side
        };

        //Send data to the correct mysql db table for logging purposes
        pool.query('INSERT INTO ' + db.machine_array[index] + ' SET ?',post, function (error) {
            if(error){
                console.log(error);
            }             
        });
    });*/
    
};
module.exports = db;