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

async function superSearchAllParts(tables, query){
    const route = '/scheduling/inventory/superSearchAllParts';
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

async function getManufactures(){
    const route = '/scheduling/inventory/getManufactures';
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

async function updatePartInv(part){
    const route = '/scheduling/inventory/updatePartInv';
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
// async function updateMultipleParts(parts_array){
//     const route = '/scheduling/inventory/updateMultipleParts';
//     try{
//         var data = await fetch(route,
//             {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({parts_array})
//             });
//         var list = await data.json();
//         return(list);
//     }catch(error){
//         throw error;
//     }

// }


async function deletePart(rainey_id){
    const route = '/scheduling/inventory/deletePart';
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

async function getPartManItems(rainey_id){
    if(!rainey_id){
        throw new Error("No/bad id for getPartManItems");
    }
    const route = '/scheduling/inventory/getPartManItems';
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


async function updatePartManItem(item){
    const route = '/scheduling/inventory/updatePartManItem';
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

async function deletePartManItem(id){
    const route = '/scheduling/inventory/deletePartManItem';
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

async function addNewPartManItem(part_item){
    const route = '/scheduling/inventory/addNewPartManItem';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({part_item})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function addNewManufacturer(manf){
    const route = '/scheduling/inventory/addNewManufacturer';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({manf})
            });
        var list = await response.ok;
        return(list);
    }catch(error){
        throw error;
    }

}

async function updateManufacturer(manf){
    const route = '/scheduling/inventory/updateManufacturer';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({manf})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function deleteManufacturer(id){
    const route = '/scheduling/inventory/deleteManufacturer';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id})
            });
        var list = await response.ok
        return(list);
    }catch(error){
        throw error;
    }

}

async function addNewPartType(part_type){
    const route = '/scheduling/inventory/addNewPartType';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({part_type})
            });
        var list = await response.ok;
        return(list);
    }catch(error){
        throw error;
    }

}

async function updatePartType(part_type){
    const route = '/scheduling/inventory/updatePartType';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({part_type})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function deletePartType(id){
    const route = '/scheduling/inventory/deletePartType';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id})
            });
        var list = await response.ok
        return(list);
    }catch(error){
        throw error;
    }

}

module.exports = {
    getAllParts,
    searchAllParts,
    superSearchAllParts,
    getPartById,
    getPartTypes,
    getManufactures,
    addNewPart,
    updatePart,
    updatePartInv,
    //updateMultipleParts,
    deletePart,
    getPartManItems,
    updatePartManItem,
    deletePartManItem,
    addNewPartManItem,
    addNewManufacturer,
    updateManufacturer,
    deleteManufacturer,
    addNewPartType,
    updatePartType,
    deletePartType

};