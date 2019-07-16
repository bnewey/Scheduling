const express = require('express')
const router = express.Router()
const pool = require('../../lib/db.js')
const util = require('../../util/util')

//NOT BEING USED CURRENTLY !!!!!!!!!!!!!

router.get('/', function(req, res, next) {
	pool.query('SELECT * from machines', function (error, results) {
	  	if(error){
	  		res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
	  	} else {
			//res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
			var objs = util.machine_results_to_array(results);
			res.send(objs);
		  }
		  
	  });
	  
});
module.exports = router;