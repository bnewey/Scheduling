
import 'isomorphic-unfetch';

async function getRaineyUsers(){
    const route = '/scheduling/settings/getRaineyUsers';
    try{
        var data = await fetch(route);
        if(!data.ok){
            throw new Error("GetRaineyUsers returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}


async function getEntities(){
    const route = '/scheduling/settings/getEntities';
    try{
        var data = await fetch(route);
        if(!data.ok){
            throw new Error("getEntities returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}


async function getEntitiesSearch(query){
    const route = '/scheduling/settings/getEntitiesSearch';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({query})
        });

        if(!data.ok){
            throw new Error("getEntitiesSearch returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function getEntityNameById(id){
    const route = '/scheduling/settings/getEntityNameById';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id})
        });

        if(!data.ok){
            throw new Error("getEntityNameById returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}




async function getPastScoreboardParams(column){
    const route = '/scheduling/settings/getPastScoreboardParams';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({column})
        });

        if(!data.ok){
            throw new Error("getPastScoreboardParams returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}



module.exports = {
    getRaineyUsers,
    getEntities,
    getEntityNameById,
    getEntitiesSearch,
    getPastScoreboardParams
};