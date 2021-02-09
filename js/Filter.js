import 'isomorphic-unfetch';

//FILTER CODE
const doFilter = (item, filter, outOrIn) => {
    let { value } = filter;
    let tmpValue = value;
  
    if (!(tmpValue instanceof RegExp)) {
      tmpValue = new RegExp(tmpValue.toString().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '_'), 'i');
    }

    var tmpp = tmpValue.test( (item[ filter.property ] != null ? (item[ filter.property ]).toString().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '_') :  "nonassignedValue"))
              && (item[filter.property]).toString().length === value.toString().length;

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
          value: filters[1]
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