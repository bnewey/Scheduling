import 'isomorphic-unfetch';

async function getAllSets(){
    const route = '/scheduling/inventorySets/getAllSets';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(!data.ok){
            throw new Error("getAllSets returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function searchAllSets(table, query){
    const route = '/scheduling/inventorySets/searchAllSets';
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

async function superSearchAllSets(tables, query){
    const route = '/scheduling/inventorySets/superSearchAllSets';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({tables: tables, search_query: query})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function getSetById(rainey_id){
    if(!rainey_id){
        throw new Error("No/bad id for getSetById");
    }
    const route = '/scheduling/inventorySets/getSetById';
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




async function addNewSet(set){
    const route = '/scheduling/inventorySets/addNewSet';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({set})
            });
        var list = await response.ok;
        return(list);
    }catch(error){
        throw error;
    }

}

async function updateSet(set){
    const route = '/scheduling/inventorySets/updateSet';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({set})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function updateSetInv(set){
    const route = '/scheduling/inventorySets/updateSetInv';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({set})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


async function deleteSet(rainey_id){
    const route = '/scheduling/inventorySets/deleteSet';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({rainey_id})
            });
        var list = await response.ok
        return(list);
    }catch(error){
        throw error;
    }

}

async function getSetItems(rainey_id){
    if(!rainey_id){
        throw new Error("No/bad id for getSetItems");
    }
    const route = '/scheduling/inventorySets/getSetItems';
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

async function getSetItemsWithManf(rainey_id){
    if(!rainey_id){
        throw new Error("No/bad id for getSetItemsWithManf");
    }
    const route = '/scheduling/inventorySets/getSetItemsWithManf';
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


async function updateSetItem(item){
    const route = '/scheduling/inventorySets/updateSetItem';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({item})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function deleteSetItem(id){
    const route = '/scheduling/inventorySets/deleteSetItem';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function addNewSetItem(set_item){
    const route = '/scheduling/inventorySets/addNewSetItem';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({set_item})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

module.exports = {
    getAllSets,
    searchAllSets,
    superSearchAllSets,
    getSetById,
    addNewSet,
    updateSet,
    updateSetInv,
    deleteSet,
    getSetItems,
    getSetItemsWithManf,
    updateSetItem,
    deleteSetItem,
    addNewSetItem,

};