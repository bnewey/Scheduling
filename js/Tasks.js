
import 'isomorphic-unfetch';

async function getAllTasks(){
    const route = '/scheduling/tasks/getAllTasks';
    try{
        var data = await fetch(route);
        if(!data.ok){
            throw new Error("GetTaskList returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function getTask(t_id){
    const route = '/scheduling/tasks/getTask';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id: t_id})
        });

        if(!data.ok){
            throw new Error("GetTaskList returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function removeTask(t_id){
    const route = '/scheduling/tasks/removeTask';
    try{
        var response = await fetch(route, 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: t_id})   
            });
        return response.ok;
    }catch(error){
        throw error;
        
    }

}

async function updateTask(task){
    const route = '/scheduling/tasks/updateTask';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({task: task})
            });
            return response.ok;
    }catch(error){
        throw error;
    }

}

async function updateMultipleTaskDates(ids, date, date_type){
    const route = '/scheduling/tasks/updateMultipleTaskDates';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ids,date, date_type})
            });
            return response.ok;
    }catch(error){
        throw error;
    }
}


async function getCoordinates(address, city, state, zip){
    var s_address =  ((address ? address : "" )+ "+" + (city ? city : "" )+ "+" + (state ? state : "" )+ "+" + (zip ? zip : "")).replace(/\s/g, "+")
    var return_value;
    console.log("address", s_address)
    const route = `https://maps.googleapis.com/maps/api/geocode/json?address=` + 
        `${s_address}&key=AIzaSyBd9JvLz52kD4ouQvqlHePUAqlBWzACJ-c`;
    try{
        var response = await fetch(route,
            {
                method: 'POST',
            });

            if(response.ok){
                await response.json()
                .then((result)=> {
                    if(result.status === "OK"){
                        return_value = result.results[0].geometry.location;
                    }
                    else{
                        throw new Error("Geocoing results not OK");
                    }
                })
                .catch((error)=>{
                    throw error;
                })
            }
            return return_value;
            //return response;
    }catch(error){
        throw error;
    }

}

async function saveCoordinates(record_id, coordinates){
    const route = '/scheduling/tasks/saveCoordinates';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({record_id: record_id, coordinates: coordinates})
            });
            return response.ok;
    }catch(error){
        throw error;
    }
}

async function addAndSaveAddress(addressObj, entities_id){
    const route = '/scheduling/tasks/addAndSaveAddress';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({addressObj, entities_id})
        });

        if(!data.ok){
            throw new Error("addAndSaveAddress returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

module.exports = {
    getAllTasks: getAllTasks,
    getTask: getTask,
    removeTask: removeTask,
    updateTask: updateTask,
    updateMultipleTaskDates: updateMultipleTaskDates,
    getCoordinates: getCoordinates,
    saveCoordinates: saveCoordinates,
    addAndSaveAddress,
};