import React, {useRef, useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';

import CircularProgress from '@material-ui/core/CircularProgress';

import EnhancedTable from './EnhancedTable';

import MapContainer from '../Map/MapContainer';

import FullWidthTabs from '../Tabs/FullWidthTabs';
import Tasks from '../../../js/Tasks';



//we can make this a functional component now
const TaskContainer = function() {
      const [rows, setRows] = useState();
      const [mapRows, setMapRows] = useState([]); //setMapRows gets called in children components
      const [selectedIds, setSelectedIds] = useState([]);
      const [filterConfig, setFilterConfig] = useState();
      
      useEffect( () =>{ //useEffect for inputText
        //Gets data only on initial component mount
        if(!rows || rows == []) {
          Tasks.getAllTasks()
          .then( (data) => setRows(data))
          .catch( error => {
            console.warn(JSON.stringify(error, null,2));
          })
          
        }
      
        return () => { //clean up
            if(rows){
                
            }
        }
      },[rows]);

      

      return (
        <div>
          <FullWidthTabs>
          {rows  ?  
          <div>
            <EnhancedTable 
              rows={rows} 
              mapRows={mapRows}  setMapRows={setMapRows} 
              selectedIds={selectedIds} setSelectedIds={setSelectedIds} 
              filterConfig={filterConfig} setFilterConfig={setFilterConfig}/>
          </div> 
          : 
          <div>
            <CircularProgress style={{marginLeft: "47%"}}/>
          </div>
          } 
        <div style={{minHeight: '600px'}}>
          <MapContainer 
              mapRows={mapRows} setMapRows={setMapRows} 
              selectedIds={selectedIds} setSelectedIds={setSelectedIds}
          /></div>
        </FullWidthTabs>
        </div>
        
        
      );
    
}

export default TaskContainer