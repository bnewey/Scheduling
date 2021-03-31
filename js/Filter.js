import 'isomorphic-unfetch';


//FILTER CODE
const doFilter = (item, filter, outOrIn) => {
    let { value, property, compare_type = "equal" } = filter;
    let tmpValue = value;
  
    if (!(tmpValue instanceof RegExp)) {
      tmpValue = new RegExp(tmpValue.toString().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '_'), 'i');
    }
    var tmpp;
    if(compare_type === "equal"){
      if(item[ property ] == null ){
        tmpp = tmpValue.test( "nonassignedValue" )
      }else{
        tmpp = tmpValue.test( ( (item[ property ]).toString().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '_') ))
        &&  (item[property])?.toString()?.length === value?.toString()?.length;
      }
    }

    if(compare_type === "lessthan"){
      tmpp = value < item[ property ] 

      if(item[ property ] == null || item[ property ]  == undefined){
        tmpp = false;
      }
    }
    if(compare_type === "greaterthan"){
      tmpp = value > item[ property ] 

      if(item[ property ] == null || item[ property ]  == undefined){
        tmpp = false;
      }
    }
    if(compare_type === "lessthanequalto"){
      tmpp = value <= item[ property ] 

      if(item[ property ] == null || item[ property ]  == undefined){
        tmpp = false;
      }
    }
    if(compare_type === "greaterthanequalto"){
      tmpp = value >= item[ property ] 

      if(item[ property ] == null || item[ property ]  == undefined){
        tmpp = false;
      }
    }



    if(outOrIn == "in"){
      return(!!tmpp);
    }
    if(outOrIn == "out"){
      return(!tmpp);
    }
    
    console.error("outOrIn variable not set correctly", outOrIn);
    return false;
  }
  
  const createFilter = ([...filters], outOrIn, andOr) => {
    if (!outOrIn || !andOr){
      console.error("Needs inOrOutBool or andOr")
      return ()=> {};
    }
    if (typeof filters[0] === 'string') {
      filters = [
        {
          property: filters[0],
          value: filters[1],
          compare_type: filters[2] || "equal",
        }
      ];
    }
    return (item) => {
      if( andOr == "and" ){
        //compare to every filter with same type
        //item must match every filter
        return (filters.every(filter => doFilter(item, filter, outOrIn)));
      }
      if( andOr == "or" ){
        var flag = false;
        //compare to get all items ie: A union B
        //item must match one or more filters
        filters.forEach((filter)=> {
            if(doFilter(item, filter, outOrIn)){
              flag = true;
            }
            //filter to using and not working
        })
        return ( flag);
      }
    };
  };
  
// END OF FILTER CODE


  module.exports =  { createFilter };