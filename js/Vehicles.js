
import 'isomorphic-unfetch';

async function generateLinxupToken(){
    
    const url = 'https://app03.linxup.com/ibis/rest/api/v2/token/generate';
    const token  = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb21wYW55SWQiOiIzMjIyNzQiLCJpc3MiOiJhZ2lsaXMiLCJwZXJzb25JZCI6Ijg5MjA1MCIsImV4cCI6MTg3MTgyMzUwNCwiaWF0IjoxNzE0MDU3MTA0LCJ1c2VybmFtZSI6ImJyYWluZXlAcmFpbmV5ZWxlY3Ryb25pY3MuY29tIn0.h0Dh2QXl2oFvJxjGna-GngQJK6heEeC9SEiKR9lCaAw'
    
    try{
        const response = await fetch(url,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/html',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    "username":"brainey@raineyelectronics.com",
                    "password":"score1"})
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Linxup Token status: ${response.status}`);
            }
    
            const result = await response.text();
            console.log('Linxup Token:', result);
            return result;
    }catch(error){
        console.log("Linxup Error");
        throw error;
    }

}

async function getLinxupLocations(){
    
    const url = 'https://app03.linxup.com/ibis/rest/api/v2/locations';
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb21wYW55SWQiOiIzMjIyNzQiLCJpc3MiOiJhZ2lsaXMiLCJwZXJzb25JZCI6Ijg5MjA1MCIsImV4cCI6MTg3MTgyMzUwNCwiaWF0IjoxNzE0MDU3MTA0LCJ1c2VybmFtZSI6ImJyYWluZXlAcmFpbmV5ZWxlY3Ryb25pY3MuY29tIn0.h0Dh2QXl2oFvJxjGna-GngQJK6heEeC9SEiKR9lCaAw';

    try{
        var response = await fetch(url,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb21wYW55SWQiOiIzMjIyNzQiLCJpc3MiOiJhZ2lsaXMiLCJwZXJzb25JZCI6Ijg5MjA1MCIsImV4cCI6MTg3MTgyMzUwNCwiaWF0IjoxNzE0MDU3MTA0LCJ1c2VybmFtZSI6ImJyYWluZXlAcmFpbmV5ZWxlY3Ryb25pY3MuY29tIn0.h0Dh2QXl2oFvJxjGna-GngQJK6heEeC9SEiKR9lCaAw`,
                }
            });
            if(response){
                const data = await response.json()
                console.log('Linxup Locations:', data);
            }
            else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return data;
            //return response;
    }catch(error){
        console.log("Linxup Error");
        throw error;
    }
}
//Linxup key
//eyJhbGciOiJIUzI1NiJ9.eyJjb21wYW55SWQiOiIzMjIyNzQiLCJpc3MiOiJhZ2lsaXMiLCJwZXJzb25JZCI6Ijg5MjA1MCIsImV4cCI6MTc1NDQxMzAyNCwiaWF0IjoxNTk2NjQ2NjI0LCJ1c2VybmFtZSI6ImJyYWluZXlAcmFpbmV5ZWxlY3Ryb25pY3MuY29tIn0.k_J9mOSXg2LaURjfSSpKl5E1VxCp1hB-S4hdPEH6pEs

//BOUNCIE STUFF
async function getBouncieLocations(){
    const route = '/scheduling/vehicles/getBouncieLocations';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        if(!data.ok){
            throw new Error("getBouncieLocations returned empty list or bad query")
        }
        //console.log("data from getBouncieLocations", await data.json());
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }

}
    


module.exports = {
    generateLinxupToken,
    getLinxupLocations,
    getBouncieLocations,
};