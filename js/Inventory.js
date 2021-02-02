import 'isomorphic-unfetch';

async function getAllParts(){
    const route = '/scheduling/inventory/getAllParts';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(!data.ok){
            throw new Error("getAllParts returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function searchAllParts(table, query){
    const route = '/scheduling/inventory/searchAllParts';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({table: table, search_query: query})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function getPartById(rainey_id){
    if(!rainey_id){
        throw new Error("No/bad id for getPartById");
    }
    const route = '/scheduling/inventory/getPartById';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({rainey_id: rainey_id})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function getPartTypes(){
    const route = '/scheduling/inventory/getPartTypes';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function addNewPart(part){
    const route = '/scheduling/inventory/addNewPart';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({part})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function updatePart(part){
    const route = '/scheduling/inventory/updatePart';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({part})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function deletePart(rainey_id){
    const route = '/scheduling/inventory/deletePart';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({rainey_id})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


module.exports = {
    getAllParts,
    searchAllParts,
    getPartById,
    getPartTypes,
    addNewPart,
    updatePart,
    deletePart,

};