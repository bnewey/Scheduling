
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

module.exports = {
    getPackingSlipsById,
};