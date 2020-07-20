const mysql = require('mysql');

const pool=mysql.createPool({
    host: process.env.host,
    database: process.env.database,
    user: process.env.user,
    password: process.env.password,
    multipleStatements: true
});


var db  = {pool: pool};

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


module.exports = db;