
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

module.exports = {
    getAllWorkOrders: getAllWorkOrders,
    getAllWorkOrderItems: getAllWorkOrderItems,
};