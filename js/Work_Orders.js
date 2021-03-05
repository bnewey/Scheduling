
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

async function getWorkOrderById(wo_id){
    if(!wo_id){
        throw new Error("No/bad id for getWorkOrderById");
    }
    const route = '/scheduling/workOrders/getWorkOrderById';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({wo_id: wo_id})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function getWorkOrderByIdForPDF(wo_id){
    if(!wo_id){
        throw new Error("No/bad id for getWorkOrderByIdForPDF");
    }
    const route = '/scheduling/workOrders/getWorkOrderByIdForPDF';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({wo_id: wo_id})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function getEmployeeNameFromId(id){
    if(!id){
        throw new Error("No/bad id for getEmployeeNameFromId");
    }
    const route = '/scheduling/workOrders/getEmployeeNameFromId';
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

async function superSearchAllWorkOrders(tables, query){
    const route = '/scheduling/workOrders/superSearchAllWorkOrders';
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

async function reorderWOI(woi_array, work_order_id){
    const route = '/scheduling/workOrders/reorderWOI';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({woi_array,  work_order_id})
            });
        return response.ok;
    }catch(error){
        console.log(error);
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

async function updateWorkOrder(workOrder){
    const route = '/scheduling/workOrders/updateWorkOrder';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({workOrder})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


async function deleteWorkOrder(wo_id){
    const route = '/scheduling/workOrders/deleteWorkOrder';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({wo_id})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function addWorkOrder(workOrder){
    const route = '/scheduling/workOrders/addWorkOrder';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({workOrder})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function updateWorkOrderItem(woi){
    const route = '/scheduling/workOrders/updateWorkOrderItem';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({woi})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function addWorkOrderItem(woi){
    const route = '/scheduling/workOrders/addWorkOrderItem';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({woi})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function addMultipleWorkOrderItems(wo_id, woi_array){
    const route = '/scheduling/workOrders/addMultipleWorkOrderItems';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({wo_id, woi_array})
            });
        var list = response.ok;
        return(list);
    }catch(error){
        throw error;
    }
}

async function deleteWorkOrderItem(woi_id){
    const route = '/scheduling/workOrders/deleteWorkOrderItem';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({woi_id})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function setMultipleWOIArrivalDates(woi_ids, date){
    const route = '/scheduling/workOrders/setMultipleWOIArrivalDates';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({woi_ids, date})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


module.exports = {
    getAllWorkOrders: getAllWorkOrders,
    getWorkOrderById,
    getWorkOrderByIdForPDF,
    getEmployeeNameFromId,
    searchAllWorkOrders,
    superSearchAllWorkOrders,
    getAllWorkOrderItems: getAllWorkOrderItems,
    getAllWorkOrderSignArtItems: getAllWorkOrderSignArtItems,
    reorderWOI,
    updateWorkOrderItemArrivalDate: updateWorkOrderItemArrivalDate,
    updateWorkOrderItemVendor,
    updateWorkOrder,
    deleteWorkOrder,
    addWorkOrder,
    updateWorkOrderItem,
    addWorkOrderItem,
    addMultipleWorkOrderItems,
    deleteWorkOrderItem,
    setMultipleWOIArrivalDates
};