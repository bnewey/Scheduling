import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress, Grid} from '@material-ui/core';


import cogoToast from 'cogo-toast';

import Util from '../../js/Util';
import Settings from '../../js/Settings';
import Work_Orders from  '../../js/Work_Orders';

import WOToolbar from './Toolbar/WOToolbar';
//Sidebars
import WOSidebarList from './Sidebars/WOSidebarList';
import WOSidebarDetail from './Sidebars/WOSidebarDetail';

//Main Panels
import WOList from './MainPanels/WOList';
import WODetail from './MainPanels/WODetail';

//Extras
import AddEditModal from './AddEditWorkOrder/AddEditModal'
import WOPackingSlip from './MainPanels/DetailSubPanels/WOPackingSlip';


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

  const views = [ { value: "allWorkOrders", displayName: "Work Orders"},
                  {value: 'search', displayName: 'Search', closeToView: 'allWorkOrders'} ,
                  {value: "woDetail", displayName: 'W.O. Detail', closeToView: 'allWorkOrders', onClose: ()=>{setActiveWorkOrder(null); setDetailWOid(null)}}, 
                  { value: "packingSlip", displayName: 'Packing Slip', closeToView: 'allWorkOrders', onClose: ()=>{setActiveWorkOrder(null); setDetailWOid(null)}},
                  {value: "woPdf", displayName: 'W.O. PDF', closeToView: 'allWorkOrders', onClose: ()=>{setActiveWorkOrder(null); setDetailWOid(null)}},
                  { value: "pastWO", displayName: 'Past W.Os', closeToView: 'allWorkOrders', onClose: ()=>{setActiveWorkOrder(null); setDetailWOid(null)}}];
  const [currentView,setCurrentView] = useState(views[0]);
  const [detailWOid,setDetailWOid] = useState(null);
  const [activeWorkOrder, setActiveWorkOrder] = useState(null);

  const [editWOModalOpen, setEditWOModalOpen] = React.useState(false);
  const [editModalMode, setEditModalMode] = React.useState(null);
  
  const [raineyUsers, setRaineyUsers] = useState(null);
  
  const classes = useStyles();
  
  //OrderRows
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is set to null
    if(workOrders == null && rowDateRange) {
      
      Work_Orders.getAllWorkOrders(rowDateRange)
      .then( data => { console.log("getWorkOrders",data);setWorkOrders(data); })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting tasks`, {hideAfter: 4});
      })
    }

  },[workOrders, rowDateRange]);

  //Work Order for detail views
  useEffect(()=>{
    if(detailWOid && activeWorkOrder == null){
      Work_Orders.getWorkOrderById(detailWOid)
      .then((data)=>{
        if(data){
          console.log("activeWorkOrder",data)
          setActiveWorkOrder(data[0]);
        }
      })
      .catch((error)=>{
        console.error("Failed to get work order", error);
        cogoToast.error("Failed to get work order");
      })
    }
  },[detailWOid, activeWorkOrder])

  useEffect(()=>{
    if(raineyUsers == null){
      Settings.getRaineyUsers()
      .then((data)=>{
        setRaineyUsers(data);
      })
      .catch((error)=>{
        cogoToast.error("Failed to get rainey users");
        console.error("failed to get rainey users", error)
      })
    }
  },[raineyUsers])

  

  const getMainComponent = () =>{
    switch(currentView.value){
      case "allWorkOrders":
        return <WOList />
        break;
      case "search":
        return <WOList/>
        break;
      case "woDetail":
        return <WODetail />
        break;
      case "packingSlip":
        return <WOPackingSlip />
        break;
      case "woPdf":
        break;
      case "pastWO":
        break;
      default: 
        cogoToast.error("Bad view");
        return <WOList />;
        break;
    }
  }

  const getSidebarComponent = () =>{
    switch(currentView.value){
      case "allWorkOrders":
        return <WOSidebarList />
        break
      case "search":
        return <WOSidebarList />
        break;
      case "woDetail":
        return <WOSidebarDetail />
        break;
      case "packingSlip":
        return <WOSidebarDetail />
        break;
      case "woPdf":
        break;
      case "pastWO":
        break;
      default: 
        cogoToast.error("Bad view");
        return <WOSidebarList />;
        break;
    }
  }
  

  return (
    <div className={classes.root}>
      <WOContext.Provider value={{workOrders, setWorkOrders, rowDateRange, setDateRowRange,
          currentView, setCurrentView, views, detailWOid,setDetailWOid, activeWorkOrder, setActiveWorkOrder,
          editWOModalOpen, setEditWOModalOpen, raineyUsers, setRaineyUsers, setEditModalMode} } >
        <div className={classes.containerDiv}>
        
        <Grid container>

          <Grid item xs={12}>
            <WOToolbar />
          </Grid>

        </Grid>

        <Grid container>

          <Grid item xs={2}>
            {getSidebarComponent()}
          </Grid>

          <Grid item xs={10}>
            {getMainComponent()}
            
          </Grid>

        </Grid>

        </div>
        <AddEditModal editModalMode={editModalMode}/>
      </WOContext.Provider>
    </div>
  );
}

export default WOContainer

const useStyles = makeStyles(theme => ({
  root:{
    margin: '0 0 0 0',
  },
  containerDiv:{
    backgroundColor: '#fff',
    padding: "0%",
    
  }
}));