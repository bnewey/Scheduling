import React, {useRef, useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';

import CircularProgress from '@material-ui/core/CircularProgress';

import ItemizationTable from './Table/ItemizationTable';

import Work_Orders from '../../../js/Work_Orders';

//we can make this a functional component now
const ItemizationContainer = function({searchText, searchTable,shouldFetch, setShouldFetch}) {
      const [rows, setRows] = useState();
      const [filterConfig, setFilterConfig] = useState();
      
      useEffect( () =>{ //useEffect for inputText
        //Gets data only on initial component mount
        if(shouldFetch || !rows || rows == []) {
          Work_Orders.getAllWorkOrderItems(searchTable, searchText) 
          .then( (data) => {setRows(data); setShouldFetch(false);})
          .catch( error => {
            console.warn(JSON.stringify(error, null,2));
          })
          
        }
      
        return () => { //clean up
            if(rows){
                
            }
        }
      },[shouldFetch]);

      

      return (
        <div>
          
          {rows  ?  
          <div>
            <ItemizationTable 
              rows={rows} 
              filterConfig={filterConfig} setFilterConfig={setFilterConfig}/>
          </div> 
          : 
          <div>
            <CircularProgress style={{marginLeft: "47%"}}/>
          </div>
          } 

        </div>
        
      );
    
}

export default ItemizationContainer