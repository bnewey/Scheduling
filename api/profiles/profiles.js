const express = require('express')
const router = express.Router()
const pool = require('../../lib/db.js')

router.get('/', function(req, res, next) {
	pool.query('SELECT * from profiles', function (error, results, fields) {
	  	if(error){
	  		res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
	  		//If there is error, we send the error in the error section with 500 status
	  	} else {
			  //res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
			  res.send(results);
			  //If there is no error, all is good and response is 200OK.
		  }
		  
	  });
	  
});
module.exports = router;