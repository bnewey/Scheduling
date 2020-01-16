//const db = require("./lib/db");
const util = require("util/util.js");

async function doGetAll(nextApp,db, req, res){
    const sql = 'Select id,machine_table_name from machines';
	try{
		const results = await db.query(sql, []);
		nextApp.render(req, res, '/', {settings: {results}}); 
	}
	catch(error){
		nextApp.render(req, res, '/', {settings: {results: ["nothing"]}});
	}

}

function handleRequest(nextApp, db, req, res) {
	var action = util.getParam(req, "action");
		
	if(action == "get_all") {
		doGetAll(nextApp, db, req, res);
	}
	else {
		//sendInvalidAction(action, req, res);
		console.log("invalid action");
	}
}

module.exports = {
		handleRequest : handleRequest,
		doGetAll: doGetAll
};