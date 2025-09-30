
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

export async function getLinxupLocations() {
  const route = '/scheduling/vehicles/getLinxupLocations';
  const r = await fetch(route, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  const t = await r.text();
  let p = null; try { p = JSON.parse(t); } catch {}

  if (!r.ok) {
    console.warn('[linxup] server returned', r.status, t);
    // fail-soft so Bouncie can still render
    return { data: { locations: [] } };
  }
  return p || { data: { locations: [] } };
}

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