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
        if(list?.user_error || list?.error){
            throw list;
        }
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
        if(list?.user_error || list?.error){
            throw list;
        }
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
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }

}

async function superSearchAllPartsAndKits(tables, query){
    const route = '/scheduling/inventory/superSearchAllPartsAndKits';
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
        if(list?.user_error || list?.error){
            throw list;
        }
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
        if(list?.user_error || list?.error){
            throw list;
        }
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
        if(list?.user_error || list?.error){
            throw list;
        }
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
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }

}

async function addNewPart(part, user){
    const route = '/scheduling/inventory/addNewPart';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({part, user})
            });
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }

}

async function updatePart(part, user){
    const route = '/scheduling/inventory/updatePart';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({part, user})
            });
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }

}

async function updatePartInv(part, user){
    const route = '/scheduling/inventory/updatePartInv';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({part, user})
            });
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
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


async function deletePart(rainey_id, user){
    const route = '/scheduling/inventory/deletePart';
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
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }

}

async function getPartManItemById(id){
    if(!id){
        throw new Error("No/bad id for getPartManItemById");
    }
    const route = '/scheduling/inventory/getPartManItemById';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: id})
            });
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }

}


async function getPartManItemsForMultiple(rainey_id){
    if(!rainey_id){
        throw new Error("No/bad id for getPartManItemsForMultiple");
    }
    const route = '/scheduling/inventory/getPartManItemsForMultiple';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({rainey_ids: rainey_ids})
            });
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }

}


async function updatePartManItem(item, user){
    const route = '/scheduling/inventory/updatePartManItem';
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
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }

}

async function deletePartManItem(id, user){
    const route = '/scheduling/inventory/deletePartManItem';
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
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }

}

async function addNewPartManItem(part_item, user){
    const route = '/scheduling/inventory/addNewPartManItem';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({part_item, user})
            });
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }

}

async function addNewManufacturer(manf, user){
    const route = '/scheduling/inventory/addNewManufacturer';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({manf, user})
            });
        var list = await response.ok;
        return(list);
    }catch(error){
        throw error;
    }

}

async function updateManufacturer(manf, user){
    const route = '/scheduling/inventory/updateManufacturer';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({manf, user})
            });
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }

}

async function deleteManufacturer(id, user){
    const route = '/scheduling/inventory/deleteManufacturer';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id, user})
            });
        var list = await response.ok
        return(list);
    }catch(error){
        throw error;
    }

}

async function addNewPartType(part_type, user){
    const route = '/scheduling/inventory/addNewPartType';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({part_type, user})
            });
        var list = await response.ok;
        return(list);
    }catch(error){
        throw error;
    }

}

async function updatePartType(part_type, user){
    const route = '/scheduling/inventory/updatePartType';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({part_type, user})
            });
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }

}

async function deletePartType(id, user){
    const route = '/scheduling/inventory/deletePartType';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id, user})
            });
        var list = await response.ok
        return(list);
    }catch(error){
        throw error;
    }

}

async function checkPartExists(part_id){
    const route = '/scheduling/inventory/checkPartExists';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({part_id})
            });
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }

}

module.exports = {
    getAllParts,
    searchAllParts,
    superSearchAllParts,
    superSearchAllPartsAndKits,
    getPartById,
    getPartTypes,
    getManufactures,
    addNewPart,
    updatePart,
    updatePartInv,
    //updateMultipleParts,
    deletePart,
    getPartManItems,
    getPartManItemById,
    updatePartManItem,
    deletePartManItem,
    addNewPartManItem,
    addNewManufacturer,
    updateManufacturer,
    deleteManufacturer,
    addNewPartType,
    updatePartType,
    deletePartType,
    checkPartExists,

};