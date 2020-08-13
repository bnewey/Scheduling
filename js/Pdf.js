
import 'isomorphic-unfetch';


async function createWOPdf(pdf_data){
    const route = '/scheduling/pdf/createWOPdf';
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
            throw new Error("CreateWOPdf error. Server returned bad response")
        }
        return(response.ok);
    }catch(error){
        throw error;
    }

}

async function createTLPdf(pdf_data){
    const route = '/scheduling/pdf/createTLPdf';
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
            throw new Error("createTLPdf error. Server returned bad response")
        }
        return(response.ok);
    }catch(error){
        throw error;
    }

}


async function fetchWOPdf(){
    const route = '/scheduling/pdf/fetchWOPdf';
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
            throw new Error("fetchWOPdf returned bad response from server")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}


module.exports = {
    createWOPdf: createWOPdf,
    createTLPdf:createTLPdf,
    fetchWOPdf: fetchWOPdf,
    
};