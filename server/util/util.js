function getParam(req, name, optional) {
	var ret = null;
	
	if(req && req.body) {
		ret = req.body[name];
		if(ret != null) {
			return ret;
		}
	}

	if(req.query != null) {
		ret = req.query[name];
		if(ret != null) {
			return ret;
		}
	}
	
	if(optional) {
		return null;
	}
	
	throw ("Missing Param: " + name + " for Request: " + JSON.stringify(req.url) + ":" + JSON.stringify(req.body));
}



module.exports = { 
    getParam: getParam,
}