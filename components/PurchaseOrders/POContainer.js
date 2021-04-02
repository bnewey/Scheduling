import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress, Grid} from '@material-ui/core';


import cogoToast from 'cogo-toast';

import Util from '../../js/Util';
import Settings from '../../js/Settings';
import WorkOrderDetail from  '../../js/WorkOrderDetail';

import POToolbar from './Toolbar/POToolbar';
//Sidebars
import POSidebarList from './Sidebars/POSidebarList';

//Main Panels
import POList from './MainPanels/POList';
import AddEditFPOrder from '../WorkOrders/AddEditFPOrder/AddEditFPOrder';

//Extras



var today =  new Date();

export const ListContext = createContext(null);

//This is the highest component for the Task Page
//Contains all important props that all tabs use
const POContainer = function(props) {
  const {user} = props;

  const [purchaseOrders, setPurchaseOrders] = useState(null);
  // const [rowDateRange, setDateRowRange] = useState({
  //         to: Util.convertISODateToMySqlDate(today),
  //         from: Util.convertISODateToMySqlDate(new Date(new Date().setDate(today.getDate()-270)))
  // });
  const [arrivedState, setArrivedState] = useState(null);

  //views used through whole app, 
  //child views with parent run parent's onClose() function
  const views = [ { value: "allPurchaseOrders", displayName: "Purchase Orders",  },
                  {value: 'search', displayName: 'Search', closeToView: 'allPurchaseOrders',
                      onClose: ()=> {setPurchaseOrders(null)}} ];

  const [currentView,setCurrentView] = useState(null);
  const [previousView, setPreviousView] = useState(null);
  // const [detailWOid,setDetailWOid] = useState(null);

  // const [editPOModalOpen, setEditPOModalOpen] = React.useState(false);
  // const [editModalMode, setEditModalMode] = React.useState(null);
  
  //Extras
  const [raineyUsers, setRaineyUsers] = useState(null);


  //Detail - FairPlay Order
  // const [fpOrders, setFPOrders] = React.useState(null);
  const [resetFPForm, setResetFPForm] = React.useState(null);
  const [fpOrders, setFPOrders] = React.useState(null);
  const [activeFPOrder, setActiveFPOrder] =React.useState(null);
  const [fpOrderModalMode,setFPOrderModalMode] = React.useState("add");
  const [fpOrderModalOpen, setFPOrderModalOpen] = React.useState(false);
  const [vendorTypes, setVendorTypes] = React.useState(null);
  
  const classes = useStyles();

  //Get View from local storage if possible || set default
  useEffect(() => {
    if(currentView == null){
      var tmp = window.localStorage.getItem('currentPOView');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(tmpParsed){
        var view = views.filter((v)=> v.value == tmpParsed)[0]
        handleSetView(view || views[0]);
      }else{
        handleSetView(views[0]);
      }
    }
    if(currentView){
      window.localStorage.setItem('currentPOView', JSON.stringify(currentView.value));
    }
    
  }, [currentView]);

  
  //OrderRows
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is set to null
    if(purchaseOrders == null) {
      
      WorkOrderDetail.getAllFPOrderItems()
      .then( data => { 
        if(arrivedState){

          var arrived = arrivedState.arrived;
          if( arrived){
              var tmpOrders = [...data];
              if(arrived == "yes"){
                  tmpOrders = tmpOrders.filter((v,i)=> v.arrival_date )
              }
              if(arrived == "no"){
                tmpOrders = tmpOrders.filter((v,i)=> !v.arrival_date)
              }
              if(arrived == "all"){
                //no need to filter
              }
              
              setPurchaseOrders(tmpOrders)
          }
        }else{
          //setPurchaseOrders(data);
        }
      })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting purchase orders`, {hideAfter: 4});
      })
    }

  },[purchaseOrders, arrivedState]);

  // //Work Order for detail views
  // useEffect(()=>{
  //   if(detailWOid && activeWorkOrder == null){
  //     Work_Orders.getWorkOrderById(detailWOid)
  //     .then((data)=>{
  //       if(data){
  //         setActiveWorkOrder(data[0]);
  //       }
  //     })
  //     .catch((error)=>{
  //       console.error("Failed to get work order", error);
  //       cogoToast.error("Failed to get work order");
  //     })
  //   }
  // },[detailWOid, activeWorkOrder])

  

  //Save and/or Fetch detailWOid to local storage
  // useEffect(() => {
  //   if(detailWOid == null && currentView && (currentView.value == "woDetail" || currentView.parent == "woDetail")){
  //     var tmp = window.localStorage.getItem('detailWOid');
  //     var tmpParsed;
  //     if(tmp){
  //       tmpParsed = JSON.parse(tmp);
  //     }
  //     if(tmpParsed){
  //       setDetailWOid(tmpParsed);
  //     }else{
  //       setDetailWOid(null);
  //     }
  //   }
    
  //   //set even if null
  //   if(currentView){
  //     window.localStorage.setItem('detailWOid', JSON.stringify(detailWOid || null));
  //   }
    
  // }, [detailWOid, currentView]);

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

  

  useEffect(()=>{
    if(vendorTypes == null){
      WorkOrderDetail.getVendorTypes()
      .then((data)=>{
        if(data){
          setVendorTypes(data);
        }
      })
      .catch((error)=>{
        cogoToast.error("Failed to get vendor types");
        console.error("Failed to get vendor types", error);
      })
    }
  },[vendorTypes])

  const handleSetView = (view)=>{
    setCurrentView(view);
    setPreviousView(currentView ? currentView : null);
  }
   

  const getMainComponent = () =>{
    switch(currentView.value){
      case "allPurchaseOrders":
        return <POList />
        break;
      case "search":
        return <POList/>
        break;
      default: 
        cogoToast.error("Bad view");
        return <POList />;
        break;
    }
  }

  const getSidebarComponent = () =>{
    switch(currentView.value){
      case "allPurchaseOrders":
        return <POSidebarList />
        break
      case "search":
        return <POSidebarList />
        break;
      default: 
        cogoToast.error("Bad view");
        return <POSidebarList />;
        break;
    }
  }
  

  return (
    <div className={classes.root}>
      <ListContext.Provider value={{purchaseOrders, setPurchaseOrders, fpOrders, setFPOrders, activeFPOrder, setActiveFPOrder,
          currentView, previousView, handleSetView, views, vendorTypes, setVendorTypes,
          fpOrderModalOpen, setFPOrderModalOpen, raineyUsers, setRaineyUsers, fpOrderModalMode, setFPOrderModalMode, arrivedState, setArrivedState,
          resetFPForm, setResetFPForm} } >
      
        <div className={classes.containerDiv}>
        
        <Grid container>

          <Grid item xs={12}>
            {currentView && <POToolbar />}
          </Grid>

        </Grid>
        
            <Grid container>

              <Grid item xs={2}>
                
                {currentView && getSidebarComponent()}
              </Grid>

              <Grid item xs={10} className={classes.mainPanel}>
                {currentView && getMainComponent()}
                
              </Grid>

            </Grid>
        

        </div>
      </ListContext.Provider>
    </div>
  );
}

export default POContainer

const useStyles = makeStyles(theme => ({
  root:{
    margin: '0 0 0 0',
  },
  containerDiv:{
    backgroundColor: '#fff',
    padding: "0%",
    
  },
  mainPanel:{
    boxShadow: 'inset 0px 2px 4px 0px #a7a7a7',
  }
}));