import 'isomorphic-unfetch';


async function getAllPartsAndKits(){
    const route = '/scheduling/inventoryKits/getAllPartsAndKits';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(!data.ok){
            throw new Error("getAllPartsAndKits returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}


async function getAllKits(){
    const route = '/scheduling/inventoryKits/getAllKits';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(!data.ok){
            throw new Error("getAllKits returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}


async function searchAllKits(table, query){
    const route = '/scheduling/inventoryKits/searchAllKits';
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


async function superSearchAllKits(tables, query){
    const route = '/scheduling/inventoryKits/superSearchAllKits';
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


async function getKitById(rainey_id){
    if(!rainey_id){
        throw new Error("No/bad id for getKitById");
    }
    const route = '/scheduling/inventoryKits/getKitById';
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


async function addNewKit(kit, user){
    const route = '/scheduling/inventoryKits/addNewKit';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({kit, user})
            });
        var list = await response.json();
        return(list);
    }catch(error){
        throw error;
    }

}


async function updateKit(kit, user){
    const route = '/scheduling/inventoryKits/updateKit';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({kit, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


async function updateKitInv(kit, user){
    const route = '/scheduling/inventoryKits/updateKitInv';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({kit, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


async function deleteKit(rainey_id, user){
    const route = '/scheduling/inventoryKits/deleteKit';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({rainey_id, user})
            });
        var list = await response.ok
        return(list);
    }catch(error){
        throw error;
    }

}


async function getKitItems(rainey_id){
    if(!rainey_id){
        console.error("rainey_id", rainey_id);
        console.error("No/bad id for getKitItems");
        return [];
    }
    const route = '/scheduling/inventoryKits/getKitItems';
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


async function getKitItemsCostData(rainey_id){
    if(!rainey_id){
        throw new Error("No/bad id for getKitItemsCostData");
    }
    const route = '/scheduling/inventoryKits/getKitItemsCostData';
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


async function getKitItemsWithManf(rainey_id){
    if(!rainey_id){
        throw new Error("No/bad id for getKitItemsWithManf");
    }
    const route = '/scheduling/inventoryKits/getKitItemsWithManf';
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


async function updateKitPart(item, user){
    const route = '/scheduling/inventoryKits/updateKitPart';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({item, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


async function deleteKitPart(id, user){
    const route = '/scheduling/inventoryKits/deleteKitPart';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


async function addNewKitPart(kit_item, user){
    const route = '/scheduling/inventoryKits/addNewKitPart';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({kit_item, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


async function updateKitKit(item, user){
    const route = '/scheduling/inventoryKits/updateKitKit';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({item, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


async function deleteKitKit(id, user){
    const route = '/scheduling/inventoryKits/deleteKitKit';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


async function addNewKitKit(kit_item, user){
    const route = '/scheduling/inventoryKits/addNewKitKit';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({kit_item, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


module.exports = {
    getAllKits,
    getAllPartsAndKits,
    searchAllKits,
    superSearchAllKits,
    getKitById,
    addNewKit,
    updateKit,
    updateKitInv,
    deleteKit,
    getKitItems,
    getKitItemsCostData,
    getKitItemsWithManf,
    updateKitPart,
    deleteKitPart,
    addNewKitPart,
    updateKitKit,
    deleteKitKit,
    addNewKitKit,
};