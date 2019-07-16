

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

module.exports = { 
    machine_results_to_array: machine_results_to_array
}