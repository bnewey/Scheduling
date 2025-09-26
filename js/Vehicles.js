
import 'isomorphic-unfetch';

async function generateLinxupToken(){
    
    var route = 'https://www.linxup.com/ibis/rest/api/v2/token/generate';
    var return_value;
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "username":"brainey@raineyelectronics.com",
                    "password":"score1"})
            });
            console.log("TOKEN REPONSE", response);
            if(response){
                await response.json()
                .then((result)=> {                    
                    if(result){
                        return_value = result;
                    }
                    else{
                        throw new Error("generate linxup token results not OK");
                    }
                })
                .catch((error)=>{
                    throw error;
                })
            }
            return return_value;
            //return response;
    }catch(error){
        throw error;
    }

}

async function getLinxupLocations(){
    
    var route = 'https://www.linxup.com/ibis/rest/api/v2/locations';
    var return_value;
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJjb21wYW55SWQiOiIzMjIyNzQiLCJpc3MiOiJhZ2lsaXMiLCJwZXJzb25JZCI6Ijg5MjA1MCIsImV4cCI6MTc1NDQxMzAyNCwiaWF0IjoxNTk2NjQ2NjI0LCJ1c2VybmFtZSI6ImJyYWluZXlAcmFpbmV5ZWxlY3Ryb25pY3MuY29tIn0.k_J9mOSXg2LaURjfSSpKl5E1VxCp1hB-S4hdPEH6pEs'
                }
            });
            if(response){
                await response.json()
                .then((result)=> {                    
                    if(result){
                        return_value = result;
                    }
                    else{
                        throw new Error("generate linxup token results not OK");
                    }
                })
                .catch((error)=>{
                    throw error;
                })
            }
            return return_value;
            //return response;
    }catch(error){
        throw error;
    }
}
//Linxup key
//eyJhbGciOiJIUzI1NiJ9.eyJjb21wYW55SWQiOiIzMjIyNzQiLCJpc3MiOiJhZ2lsaXMiLCJwZXJzb25JZCI6Ijg5MjA1MCIsImV4cCI6MTc1NDQxMzAyNCwiaWF0IjoxNTk2NjQ2NjI0LCJ1c2VybmFtZSI6ImJyYWluZXlAcmFpbmV5ZWxlY3Ryb25pY3MuY29tIn0.k_J9mOSXg2LaURjfSSpKl5E1VxCp1hB-S4hdPEH6pEs

//BOUNCIE STUFF
export async function getBouncieLocations(){
  const r = await fetch('/scheduling/vehicles/getBouncieLocations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin'
  });
  const t = await r.text();
  let p = null; try { p = JSON.parse(t); } catch {}

  if (r.status === 401 && p && p.error === 'reauthorize_required') {
    window.location.href = p.authorize || '/bouncieAuth';
    return [];
  }
  if (!r.ok) throw new Error('Bouncie ' + r.status + ': ' + (t || ''));
  return p || [];
}
    


module.exports = {
    generateLinxupToken,
    getLinxupLocations,
    getBouncieLocations,
};