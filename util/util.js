

function machine_results_to_array(results){
    if(results == undefined){
        console.log('empty results');
        return;
    }

    let objs = [];
    
    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    for(var i =0; i < Object.size(results); i++){
        objs.push( {'id': results[i].id, 
                    'name': results[i].name, 
                    'temp': results[i].temp, 
                    'pressure': results[i].pressure });
    }
    return objs;
}

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
    machine_results_to_array: machine_results_to_array,
    getParam: getParam
}