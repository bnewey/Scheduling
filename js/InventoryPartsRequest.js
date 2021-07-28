import 'isomorphic-unfetch';

async function getAllPartsRequestItems(){
    const route = '/scheduling/inventoryPartsRequest/getAllPartsRequestItems';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(!data.ok){
            throw new Error("getAllPartsRequestItems returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}



async function superSearchAllRequestedItems(tables, query){
    const route = '/scheduling/inventoryPartsRequest/superSearchAllRequestedItems';
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



async function updatePartsRequestItemStatus(item){
    const route = '/scheduling/inventoryPartsRequest/updatePartsRequestItemStatus';
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

async function updatePartsRequestItem(item){
    const route = '/scheduling/inventoryPartsRequest/updatePartsRequestItem';
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



async function deletePartsRequestItem(id){
    const route = '/scheduling/inventoryPartsRequest/deletePartsRequestItem';
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

async function addNewPartsRequestItem(pr_item, user){
    const route = '/scheduling/inventoryPartsRequest/addNewPartsRequestItem';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({pr_item, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


async function addNewMultplePartsRequestItem(item){
    const route = '/scheduling/inventoryPartsRequest/addNewMultplePartsRequestItem';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({item})
            });
            return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }

}



module.exports = {
    getAllPartsRequestItems,
    superSearchAllRequestedItems,
    updatePartsRequestItem,
    updatePartsRequestItemStatus,
    deletePartsRequestItem,
    addNewPartsRequestItem,
    addNewMultplePartsRequestItem,

};