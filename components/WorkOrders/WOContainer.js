import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress, Grid} from '@material-ui/core';


import cogoToast from 'cogo-toast';

import Util from  '../../js/Util';
import Work_Orders from  '../../js/Work_Orders';

import WOToolbar from './WOToolbar';
import WOSidebar from './WOSidebar';
import WOList from './WOList';


var today =  new Date();

export const WOContext = createContext(null);

//This is the highest component for the Task Page
//Contains all important props that all tabs use
const WOContainer = function(props) {
  const {user} = props;

  const [workOrders, setWorkOrders] = useState(null);
  const [rowDateRange, setDateRowRange] = useState({
          to: Util.convertISODateToMySqlDate(today),
          from: Util.convertISODateToMySqlDate(new Date(new Date().setDate(today.getDate()-270)))
  });

  
  const classes = useStyles();
  
  //OrderRows
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is set to null
    if(workOrders == null && rowDateRange) {
      Work_Orders.getAllWorkOrders(rowDateRange)
      .then( data => { console.log(data);setWorkOrders(data); })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting tasks`, {hideAfter: 4});
      })
    }

  },[workOrders, rowDateRange]);

  

  
  

  return (
    <div className={classes.root}>
      <WOContext.Provider value={{workOrders, setWorkOrders, rowDateRange, setDateRowRange} } >
        <div className={classes.containerDiv}>
        
        <Grid container>

          <Grid item xs={12}>
            <WOToolbar />
          </Grid>

        </Grid>

        <Grid container>

          <Grid item xs={2}>
            <WOSidebar />
          </Grid>

          <Grid item xs={10}>
            <WOList />
          </Grid>

        </Grid>

        </div>
      </WOContext.Provider>
    </div>
  );
}

export default WOContainer

const useStyles = makeStyles(theme => ({
  root:{
    margin: '.5% 0 0 0',
  },
  containerDiv:{
    backgroundColor: '#fff',
    padding: "0%",
    
  }
}));