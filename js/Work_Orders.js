
import 'isomorphic-unfetch';

async function getAllWorkOrders(dateRange){
    if(!dateRange){
        throw new Error("Undefined Date Range for getAllWorkOrders");
    }
    const route = '/scheduling/workOrders/getAllWorkOrders';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({dateRange: dateRange})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function searchAllWorkOrders(table, query){
    const route = '/scheduling/workOrders/searchAllWorkOrders';
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

async function getAllWorkOrderItems(table, query){
    const route = '/scheduling/workOrders/getAllWorkOrderItems';
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

async function getAllWorkOrderSignArtItems(id){
    const route = '/scheduling/workOrders/getAllWorkOrderSignArtItems';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({wo_id: id})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function updateWorkOrderItemArrivalDate(woi_id, date){
    const route = '/scheduling/workOrders/updateWorkOrderItemArrivalDate';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({woi_id, date})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function updateWorkOrderItemVendor(woi_id, vendor){
    const route = '/scheduling/workOrders/updateWorkOrderItemVendor';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({woi_id, vendor})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}



module.exports = {
    getAllWorkOrders: getAllWorkOrders,
    searchAllWorkOrders,
    getAllWorkOrderItems: getAllWorkOrderItems,
    getAllWorkOrderSignArtItems: getAllWorkOrderSignArtItems,
    updateWorkOrderItemArrivalDate: updateWorkOrderItemArrivalDate,
    updateWorkOrderItemVendor,
};