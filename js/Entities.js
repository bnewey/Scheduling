
import 'isomorphic-unfetch';

async function getAllEntities(){
    const route = '/scheduling/entities/getAllEntities';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(!data.ok){
            throw new Error("getAllEntities returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function searchAllEntities(table, query){
    const route = '/scheduling/entities/searchAllEntities';
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

async function getEntityById(ent_id){
    const route = '/scheduling/entities/getEntityById';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_id})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function updateEntity(entity){
    const route = '/scheduling/entities/updateEntity';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({entity})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function addEntity(entity){
    const route = '/scheduling/entities/addEntity';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({entity})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function deleteEntity(ent_id){
    const route = '/scheduling/entities/deleteEntity';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_id})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function getDefaultAddresses(){
    const route = '/scheduling/entities/getDefaultAddresses';
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

async function getEntityTypes(){
    const route = '/scheduling/entities/getEntityTypes';
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

async function getEntAddresses(ent_id){
    const route = '/scheduling/entities/getEntAddresses';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_id})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function updateEntityAddress(ent_add){
    const route = '/scheduling/entities/updateEntityAddress';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_add})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function addEntityAddress(ent_add){
    const route = '/scheduling/entities/addEntityAddress';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_add})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function deleteEntityAddress(ent_add_id){
    const route = '/scheduling/entities/deleteEntityAddress';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_add_id})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}







module.exports = {
    getAllEntities,
    searchAllEntities,
    getEntityById,
    updateEntity,
    addEntity,
    deleteEntity,
    getDefaultAddresses,
    getEntityTypes,
    getEntAddresses,
    updateEntityAddress,
    addEntityAddress,
    deleteEntityAddress,
};