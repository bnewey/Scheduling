const dirMap = {
    // greater-than
    gt: { asc: 1, desc: -1 },
    // less-than
    lt: { asc: -1, desc: 1 }
};

const doSort = (A, B, property, direction = 'ASC') => {
    var a;
    var b;
    if(property){ // its an object, were sorting an array of objects
        a = A[ property ];
        b = B[ property ];
    }else{ // not an object, were sorting an array of single items
        a = A;
        b = B;
    }
    

    //Fix for if value is null
    if(a == null){
        return dirMap.gt[ direction.toLowerCase() ];
        //a = "";
    }
    if(b == null){
        return dirMap.lt[ direction.toLowerCase() ];
        //b = "";
    }

    //Compare a to b
    if ( (isNaN(a) ? a.toLowerCase() : a ) <  (isNaN(b) ? b.toLowerCase() : b )) {
        return dirMap.lt[ direction.toLowerCase() ];
    }
    if ( (isNaN(a) ? a.toLowerCase() : a ) >  (isNaN(b) ? b.toLowerCase() : b )) {
        return dirMap.gt[ direction.toLowerCase() ];
    }
    return 0;
}

const createSorter = (...args) => {
    if (typeof args[0] === 'string') {
        args = [
        {
            direction: args[1],
            property: args[0]
        }
        ];
    }

    return (A, B) => {
        let ret = 0;

        args.some(sorter => {
        const { property, direction = 'ASC' } = sorter;
        const value = doSort(A, B, property, direction);

        if (value === 0) {
            // they are equal, continue to next sorter if any
            return false;
        } else {
            // they are different, stop at current sorter
            ret = value;

            return true;
        }
        })

        return ret;
    }
}

export { createSorter };