import 'isomorphic-unfetch';

async function getAllOrdersOut(){
    const route = '/scheduling/inventoryOrdersOut/getAllOrdersOut';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(!data.ok){
            throw new Error("getAllOrdersOut returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function searchAllOrdersOut(table, query){
    const route = '/scheduling/inventoryOrdersOut/searchAllOrdersOut';
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

async function superSearchAllOrdersOut(tables, query){
    const route = '/scheduling/inventoryOrdersOut/superSearchAllOrdersOut';
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

async function getOrderOutById(id){
    if(!id){
        throw new Error("No/bad id for getOrderOutById");
    }
    const route = '/scheduling/inventoryOrdersOut/getOrderOutById';
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




async function addNewOrderOut(orderOut){
    const route = '/scheduling/inventoryOrdersOut/addNewOrderOut';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({orderOut})
            });
        var list = await response.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function updateOrderOut(orderOut){
    const route = '/scheduling/inventoryOrdersOut/updateOrderOut';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({orderOut})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}



async function deleteOrderOut(id, user){
    const route = '/scheduling/inventoryOrdersOut/deleteOrderOut';
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

async function getOrderOutItems(order_id){
    const route = '/scheduling/inventoryOrdersOut/getOrderOutItems';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({order_id: order_id})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


async function updateOrderOutItem(item){
    const route = '/scheduling/inventoryOrdersOut/updateOrderOutItem';
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

async function updateMultipleOrderOutItems(item){
    const route = '/scheduling/inventoryOrdersOut/updateMultipleOrderOutItems';
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


async function deleteOrderOutItem(id){
    const route = '/scheduling/inventoryOrdersOut/deleteOrderOutItem';
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

async function addNewOrderOutItem(orderOut_item){
    const route = '/scheduling/inventoryOrdersOut/addNewOrderOutItem';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({orderOut_item})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


async function addNewMultpleOrderOutItem(item){
    const route = '/scheduling/inventoryOrdersOut/addNewMultpleOrderOutItem';
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

async function getOrderOutApprovers(order_id){
    const route = '/scheduling/inventoryOrdersOut/getOrderOutApprovers';
    console.log("order", order_id)
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({order_id: order_id})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


async function updateOrderOutApprover(item, nav_item){
    const route = '/scheduling/inventoryOrdersOut/updateOrderOutApprover';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({item, nav_item})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function deleteOrderOutApprover(id, user){
    const route = '/scheduling/inventoryOrdersOut/deleteOrderOutApprover';
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

async function addNewOrderOutApprover(orderOut_item, nav_item){
    const route = '/scheduling/inventoryOrdersOut/addNewOrderOutApprover';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({orderOut_item,nav_item})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

module.exports = {
    getAllOrdersOut,
    searchAllOrdersOut,
    superSearchAllOrdersOut,
    getOrderOutById,
    addNewOrderOut,
    updateOrderOut,
    deleteOrderOut,
    getOrderOutItems,
    updateOrderOutItem,
    updateMultipleOrderOutItems,
    deleteOrderOutItem,
    addNewOrderOutItem,
    addNewMultpleOrderOutItem,
    getOrderOutApprovers,
    updateOrderOutApprover,
    deleteOrderOutApprover,
    addNewOrderOutApprover,

};