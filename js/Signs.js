
import 'isomorphic-unfetch';

async function getAllSignsForScheduler(){
    const route = '/scheduling/signs/getAllSignsForScheduler';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(!data.ok){
            throw new Error("getAllSignsForScheduler returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function searchAllSignItems(table, query){
    const route = '/scheduling/signs/searchAllSignItems';
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
    getAllSignsForScheduler,
    searchAllSignItems

};