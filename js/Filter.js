import 'isomorphic-unfetch';

//FILTER CODE
const doFilter = (item, filter, outOrIn) => {
    let { value } = filter;
    let tmpValue = value;
  
    if (!(tmpValue instanceof RegExp)) {
      tmpValue = new RegExp(tmpValue.toString().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '_'), 'i');
    }
    var tmpp = !(tmpValue.test( (item[ filter.property ] != null ? (item[ filter.property ]).toString().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '_') :  "nonassignedValue")));

    if(outOrIn == "in"){
      return(!tmpp);
    }
    if(outOrIn == "out"){
      return(tmpp);
    }
    
    console.error("outOrIn variable not set correctly", outOrIn);
    return false;
  }
  
  const createFilter = ([...filters], outOrIn) => {
    if (!outOrIn){
      console.error("Needs inOrOutBool")
      return ()=> {};
    }
    if (typeof filters[0] === 'string') {
      filters = [
        {
          property: filters[0],
          value: filters[1]
        }
      ];
    }
  
    return (item) => {
      if(outOrIn == "out"){
        //function works for filtering out but not in
        return (filters.every(filter => doFilter(item, filter, outOrIn)));
      }
      if(outOrIn == "in"){
        var flag = false;
        filters.forEach((filter)=> {
            if(doFilter(item, filter, outOrIn)){
              flag = true;
            }
        })
        return flag;
      }
    };
  };
  
// END OF FILTER CODE

//FILTER server fetching
async function updateCrewJob(member_id,job_id){
  const route = '/scheduling/crew/updateCrewJob';
  try{
      var response = await fetch(route,
          {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({member_id, job_id})
          });
      return response.ok;
  }catch(error){
      throw error;
  }
}

//END OF FILTER server fetching

  module.exports =  { createFilter };