
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

async function updatePackingSlip(psObject){
    const route = '/scheduling/workOrderDetail/updatePackingSlip';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({psObject})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function addPackingSlip(id){
    const route = '/scheduling/workOrderDetail/addPackingSlip';
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

async function deletePackingSlip(id){
    const route = '/scheduling/workOrderDetail/deletePackingSlip';
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

async function removePackingSlipFromWOI(slip_id, woi_id){
    const route = '/scheduling/workOrderDetail/removePackingSlipFromWOI';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({slip_id, woi_id})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}


async function addWOIToPackingSlip(slip_id, woi_id){
    const route = '/scheduling/workOrderDetail/addWOIToPackingSlip';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({slip_id, woi_id})
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

async function addNewFPOrder(fp_data){
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
                body: JSON.stringify({fp_data})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function updateFPOrder(fp_data){
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
                body: JSON.stringify({fp_data})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function deleteFPOrder(fpo_id){
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
                body: JSON.stringify({fpo_id})
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

async function addNewFPOrderItem(fpi_data){
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
                body: JSON.stringify({fpi_data})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function updateFPOrderItem(fpi_data){
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
                body: JSON.stringify({fpi_data})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function deleteFPOrderItem(fpi_id){
    if(!fpi_id){
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
                body: JSON.stringify({fpi_id})
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
    getPastWorkOrders,
    getFPOrders,
    addNewFPOrder,
    updateFPOrder,
    deleteFPOrder,
    getFPOrderItems,
    addNewFPOrderItem,
    updateFPOrderItem,
    deleteFPOrderItem,

};