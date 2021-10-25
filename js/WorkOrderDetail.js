
import 'isomorphic-unfetch';

async function getPackingSlipsById(wo_id){
    const route = '/scheduling/workOrderDetail/getPackingSlipsById';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id: wo_id})
        });

        if(!data.ok){
            throw new Error("getPackingSlipsById returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function updatePackingSlip(psObject, user){
    const route = '/scheduling/workOrderDetail/updatePackingSlip';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({psObject, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function addPackingSlip(id, user){
    const route = '/scheduling/workOrderDetail/addPackingSlip';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({wo_id: id, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function deletePackingSlip(id, user){
    const route = '/scheduling/workOrderDetail/deletePackingSlip';
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

async function removePackingSlipFromWOI(slip_id, woi_id, user){
    const route = '/scheduling/workOrderDetail/removePackingSlipFromWOI';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({slip_id, woi_id, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}


async function addWOIToPackingSlip(slip_id, woi_id, user){
    const route = '/scheduling/workOrderDetail/addWOIToPackingSlip';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({slip_id, woi_id, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}


async function getVendorTypes(wo_id){
    const route = '/scheduling/workOrderDetail/getVendorTypes';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(!data.ok){
            throw new Error("getVendorTypes returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}


async function getShipToWOIOptions(wo_id){
    const route = '/scheduling/workOrderDetail/getShipToWOIOptions';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({wo_id})
        });

        if(!data.ok){
            throw new Error("getShipToWOIOptions returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function getShipToAddressWOIOptions(wo_id){
    const route = '/scheduling/workOrderDetail/getShipToAddressWOIOptions';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({wo_id})
        });

        if(!data.ok){
            throw new Error("getShipToAddressWOIOptions returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function getPastWorkOrders(c_id){
    if(!c_id){
        throw new Error("Bad id for getPastWorkOrders");
    }
    const route = '/scheduling/workOrderDetail/getPastWorkOrders';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({c_id})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function getFPOrders(wo_id){
    if(!wo_id){
        throw new Error("Bad id for getFPOrders");
    }
    const route = '/scheduling/workOrderDetail/getFPOrders';
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

async function getFPOrderById(fp_id){
    if(!fp_id){
        throw new Error("Bad id for getFPOrderById");
    }
    const route = '/scheduling/workOrderDetail/getFPOrderById';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({fp_id})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}


async function addNewFPOrder(fp_data, user){
    if(!fp_data){
        throw new Error("Bad id for addNewFPOrder");
    }

    const route = '/scheduling/workOrderDetail/addNewFPOrder';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({fp_data, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function updateFPOrder(fp_data, user){
    if(!fp_data){
        throw new Error("Bad id for updateFPOrder");
    }

    const route = '/scheduling/workOrderDetail/updateFPOrder';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({fp_data, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function deleteFPOrder(fpo_id, user){
    if(!fpo_id){
        throw new Error("Bad id for deleteFPOrder");
    }
    const route = '/scheduling/workOrderDetail/deleteFPOrder';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({fpo_id, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function getFPOrderItems(fpo_id){
    if(!fpo_id){
        throw new Error("Bad id for getFPOrderItems");
    }
    const route = '/scheduling/workOrderDetail/getFPOrderItems';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({fpo_id})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}


async function getAllFPOrderItems(){

    const route = '/scheduling/workOrderDetail/getAllFPOrderItems';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}


async function searchAllFPOrderItems(table, query){
    const route = '/scheduling/workOrderDetail/searchAllFPOrderItems';
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

async function addNewFPOrderItem(fpi_data, user){
    if(!fpi_data){
        throw new Error("Bad id for addNewFPOrderItem");
    }
    const route = '/scheduling/workOrderDetail/addNewFPOrderItem';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({fpi_data, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}


async function addMultipleFPOrderItems(fpi_array, user){
    if(!fpi_array){
        throw new Error("Bad array for addMultipleFPOrderItems");
    }
    const route = '/scheduling/workOrderDetail/addMultipleFPOrderItems';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({fpi_array, user})
            });

        return(data);
    }catch(error){
        throw error;
    }
}

async function updateFPOrderItem(fpi_data, user){
    if(!fpi_data){
        throw new Error("Bad id for updateFPOrderItem");
    }
    const route = '/scheduling/workOrderDetail/updateFPOrderItem';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({fpi_data, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function deleteFPOrderItem(fpi_id, user){
    if(!fpi_id){
        throw new Error("Bad id for deleteFPOrderItem");
    }
    const route = '/scheduling/workOrderDetail/deleteFPOrderItem';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({fpi_id, user})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}



module.exports = {
    getPackingSlipsById,
    updatePackingSlip,
    addPackingSlip,
    deletePackingSlip,
    removePackingSlipFromWOI,
    addWOIToPackingSlip,
    getVendorTypes,
    getShipToWOIOptions,
    getShipToAddressWOIOptions,
    getPastWorkOrders,
    getFPOrders,
    getFPOrderById,
    addNewFPOrder,
    updateFPOrder,
    deleteFPOrder,
    getFPOrderItems,
    getAllFPOrderItems,
    searchAllFPOrderItems,
    addNewFPOrderItem,
    addMultipleFPOrderItems,
    updateFPOrderItem,
    deleteFPOrderItem,

};