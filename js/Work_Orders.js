
import 'isomorphic-unfetch';

async function getAllWorkOrders(){
    const route = '/workOrders/getAllWorkOrders';
    try{
        var data = await fetch(route);
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function getAllWorkOrderItems(table, query){
    const route = '/workOrders/getAllWorkOrderItems';
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