
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

async function reorderWOI(woi_array, work_order_id, user){
    const route = '/scheduling/workOrders/reorderWOI';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({woi_array,  work_order_id, user})
            });
        return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }

}

async function updateWorkOrderItemArrivalDate(woi_id, date, user){
    const route = '/scheduling/workOrders/updateWorkOrderItemArrivalDate';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({woi_id, date, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function updateWONotes(wo_id, notes, user){
    const route = '/scheduling/workOrders/updateWONotes';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({wo_id, notes, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}



async function updateWorkOrderItemVendor(woi_id, vendor, user){
    const route = '/scheduling/workOrders/updateWorkOrderItemVendor';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({woi_id, vendor, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function updateWorkOrder(workOrder, user){
    const route = '/scheduling/workOrders/updateWorkOrder';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({workOrder, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


async function deleteWorkOrder(wo_id, user){
    const route = '/scheduling/workOrders/deleteWorkOrder';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({wo_id, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function addWorkOrder(workOrder, user){
    const route = '/scheduling/workOrders/addWorkOrder';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({workOrder, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function updateWorkOrderItem(woi, user){
    const route = '/scheduling/workOrders/updateWorkOrderItem';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({woi, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


async function updateMultipleWorkOrderItemDates(wo_ids, user){
    const route = '/scheduling/workOrders/updateMultipleWorkOrderItemDates';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({wo_ids, user})
            });
        var list = response.ok;
        return(list);
    }catch(error){
        throw error;
    }
}


async function addWorkOrderItem(woi, sign){
    const route = '/scheduling/workOrders/addWorkOrderItem';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({woi, sign})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function addMultipleWorkOrderItems(wo_id, woi_array, user){
    const route = '/scheduling/workOrders/addMultipleWorkOrderItems';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({wo_id, woi_array, user})
            });
        var list = response.ok;
        return(list);
    }catch(error){
        throw error;
    }
}

async function deleteWorkOrderItem(woi_id, user){
    const route = '/scheduling/workOrders/deleteWorkOrderItem';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({woi_id, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function setMultipleWOIArrivalDates(woi_ids, date, user){
    const route = '/scheduling/workOrders/setMultipleWOIArrivalDates';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({woi_ids, date, user})
            });
        return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }
}

async function setMultipleWOIArrivalDatesArrived(woi_ids, date, arrived, user){
    const route = '/scheduling/workOrders/setMultipleWOIArrivalDatesArrived';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({woi_ids, date, arrived, user})
            });
        return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }
}

async function clearMultipleArrivalDates(woi_ids,user){
    const route = '/scheduling/workOrders/clearMultipleArrivalDates';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({woi_ids, user})
            });
        return response.ok;
    }catch(error){
        console.log(error);
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
    updateWONotes,
    updateWorkOrderItemVendor,
    updateWorkOrder,
    deleteWorkOrder,
    addWorkOrder,
    updateWorkOrderItem,
    updateMultipleWorkOrderItemDates,
    addWorkOrderItem,
    addMultipleWorkOrderItems,
    deleteWorkOrderItem,
    setMultipleWOIArrivalDates,
    setMultipleWOIArrivalDatesArrived,
    clearMultipleArrivalDates
};