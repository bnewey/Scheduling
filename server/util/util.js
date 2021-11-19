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

const checkPermission = (perm_string, page) =>{
	//console.log("perm_string", perm_string);
	//console.log("page", page);
    if(perm_string == null || perm_string == undefined){
        return false;
    }
    if(page == null || page == undefined){
        console.log("Bad page supplied to checkPermission")
        return false;
    }

    var perm_array = perm_string.split(",");
    //some == at least 1
    return perm_array.some((item)=> {
		return Array.isArray(page) ? page.some((v)=> item === v ) : item === page
	});

}



module.exports = { 
    getParam: getParam,
	checkPermission,
}