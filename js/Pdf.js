
import 'isomorphic-unfetch';


async function createPdf(pdf_data){
    const route = '/pdf/createPdf';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({data: pdf_data})
            });
        if(!response.ok){
            throw new Error("CreatePdf error. Server returned bad response")
        }
        return(response.ok);
    }catch(error){
        throw error;
    }

}


async function fetchPdf(){
    const route = '/pdf/fetchPdf';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: 'id'})
            });
        if(!data.ok){
            throw new Error("FetchPdf returned bad response from server")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


module.exports = {
    createPdf: createPdf,
    fetchPdf: fetchPdf,
    
};