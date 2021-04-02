import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress, Grid} from '@material-ui/core';


import cogoToast from 'cogo-toast';

import Util from '../../js/Util';
import Settings from '../../js/Settings';
import Work_Orders from  '../../js/Work_Orders';
import WorkOrderDetail from  '../../js/WorkOrderDetail';

import WOToolbar from './Toolbar/WOToolbar';
//Sidebars
import WOSidebarList from './Sidebars/WOSidebarList';
import WOSidebarDetail from './Sidebars/WOSidebarDetail';

//Main Panels
import WOList from './MainPanels/WOList';
import WODetail from './MainPanels/WODetail';
import WOItemization from './MainPanels/DetailSubPanels/Itemization/WOItemization';
import WOPackingSlip from './MainPanels/DetailSubPanels/PackingSlip/WOPackingSlip';
import WorkOrderPdf from './MainPanels/DetailSubPanels/WorkOrderPdf/WorkOrderPdf';
import PastWOs from './MainPanels/DetailSubPanels/PastWOs/PastWOs';
import WOFairPlayOrders from './MainPanels/DetailSubPanels/FairPlayOrders/WOFairPlayOrders'

//Extras
import AddEditModal from './AddEditWorkOrder/AddEditModal'



var today =  new Date();

export const ListContext = createContext(null);
export const DetailContext = createContext(null);

//This is the highest component for the Task Page
//Contains all important props that all tabs use
const WOContainer = function(props) {
  const {user} = props;

  const [workOrders, setWorkOrders] = useState(null);
  const [rowDateRange, setDateRowRange] = useState({
          to: Util.convertISODateToMySqlDate(today),
          from: Util.convertISODateToMySqlDate(new Date(new Date().setDate(today.getDate()-270)))
  });
  const [compInvState, setCompInvState] = useState({completed: 'all', invoiced: 'all'});

  //views used through whole app, 
  //child views with parent run parent's onClose() function
  const views = [ { value: "allWorkOrders", displayName: "Work Orders", /*onClose: ()=> {setWorkOrders(null)}*/ },
                  {value: 'search', displayName: 'Search', closeToView: 'allWorkOrders',
                      onClose: ()=> {setWorkOrders(null)}} ,
                  {value: "woDetail", displayName: 'W.O. Detail', closeToView: 'allWorkOrders', 
                      onClose: ()=>{setWorkOrders(null);setActiveWorkOrder(null); setDetailWOid(null); setWorkOrderItems(null); setShipToContactOptionsWOI(null);
                                setActiveWOI(null); setEditWOIModalOpen(false); setActiveFPOrder(null); setFPOrderModalOpen(false);}}, 
                  { value: "woItems", displayName: 'Itemization', closeToView: 'allWorkOrders',
                        parent: 'woDetail'},
                  { value: "packingSlip", displayName: 'Packing Slip', closeToView: 'allWorkOrders',
                        parent: 'woDetail'},
                  {value: "woPdf", displayName: 'W.O. PDF', closeToView: 'allWorkOrders',
                        parent: 'woDetail'},
                  { value: "pastWO", displayName: 'Past W.Os', closeToView: 'allWorkOrders',
                        parent: 'woDetail'},
                  { value: "woFPOrder", displayName: 'FairPlay Order', closeToView: 'allWorkOrders',
                        parent: 'woDetail'}];

  const [currentView,setCurrentView] = useState(null);
  const [previousView, setPreviousView] = useState(null);
  const [detailWOid,setDetailWOid] = useState(null);
  const [activeWorkOrder, setActiveWorkOrder] = useState(null);
  const [searchValue,setSearchValue] = useState("");

  const [editWOModalOpen, setEditWOModalOpen] = React.useState(false);
  const [editModalMode, setEditModalMode] = React.useState(null);

  const [recentWO, setRecentWO] = React.useState(null);
  
  const [raineyUsers, setRaineyUsers] = useState(null);

  //Detail Context States
      //Detail - Itemization
      const [workOrderItems, setWorkOrderItems] = React.useState(null);
      const [editWOIModalMode, setEditWOIModalMode] = React.useState("add")
      const [activeWOI, setActiveWOI] = React.useState(null);
      const [resetWOIForm, setResetWOIForm] = React.useState(null);
      const [editWOIModalOpen, setEditWOIModalOpen] = React.useState(false);
      const [vendorTypes, setVendorTypes] = React.useState(null);
      const [shipToContactOptionsWOI,setShipToContactOptionsWOI] = React.useState(null);
      const [shipToAddressOptionsWOI,setShipToAddressOptionsWOI] = React.useState(null);
      //
      //Detail - FairPlay Order
      const [fpOrders, setFPOrders] = React.useState(null);
      const [fpOrderModalMode,setFPOrderModalMode] = React.useState("add");
      const [activeFPOrder, setActiveFPOrder] =React.useState(null);
      const [resetFPForm, setResetFPForm] = React.useState(null);
      const [fpOrderModalOpen, setFPOrderModalOpen] = React.useState(false);
  //
  
  const classes = useStyles();

  //Get View from local storage if possible || set default
  useEffect(() => {
    if(currentView == null){
      var tmp = window.localStorage.getItem('currentView');
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
      window.localStorage.setItem('currentView', JSON.stringify(currentView.value));
    }
    
  }, [currentView]);

  
  //OrderRows
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is set to null
    if(workOrders == null && rowDateRange) {
      
      Work_Orders.getAllWorkOrders(rowDateRange)
      .then( data => { 
        if(compInvState){

          var comp = compInvState.completed;
          var inv = compInvState.invoiced;
          if(comp && inv){
              var tmpOrders = [...data];
              if(comp == "yes" && inv == "all"){
                  tmpOrders = tmpOrders.filter((v,i)=> v.completed == "Completed")
              }
              if(comp == "no" && inv == "all"){
                  tmpOrders = tmpOrders.filter((v,i)=> v.completed != "Completed")
              }
              if(inv == "yes" && comp == "all"){
                  tmpOrders = tmpOrders.filter((v,i)=> v.invoiced == "Invoiced")
              }
              if(inv == "no" && comp == "all"){
                  tmpOrders = tmpOrders.filter((v,i)=> v.invoiced != "Invoiced")
              }

              if(comp == "yes" && inv == "yes"){
                  tmpOrders = tmpOrders.filter((v,i)=> v.completed == "Completed" && v.invoiced == "Invoiced")
              }
              if(comp == "no" && inv == "no"){
                  tmpOrders = tmpOrders.filter((v,i)=> v.completed != "Completed" && v.invoiced != "Invoiced")
              }

              if(comp == "yes" && inv == "no"){
                  tmpOrders = tmpOrders.filter((v,i)=> v.completed == "Completed" && v.invoiced != "Invoiced")
              }
              if(comp == "no" && inv == "yes"){
                  tmpOrders = tmpOrders.filter((v,i)=> v.completed != "Completed" && v.invoiced == "Invoiced")
              }
              
              setWorkOrders(tmpOrders)
          }
        }else{
          setWorkOrders(data);
        }
      })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting tasks`, {hideAfter: 4});
      })
    }

  },[workOrders, rowDateRange]);

  //Work Order for detail views
  useEffect(()=>{
    // console.log("detail ", detailWOid)
    // console.log("activeWorkOrder ", activeWorkOrder)
    if(detailWOid && activeWorkOrder == null){
      Work_Orders.getWorkOrderById(detailWOid)
      .then((data)=>{
        if(data){
          setActiveWorkOrder(data[0]);
        }
      })
      .catch((error)=>{
        console.error("Failed to get work order", error);
        cogoToast.error("Failed to get work order");
      })
    }
  },[detailWOid, activeWorkOrder])

  //Save and/or Fetch detailWOid to local storage
  useEffect(() => {
    if(detailWOid == null && currentView && (currentView.value == "woDetail" || currentView.parent == "woDetail")){
      var tmp = window.localStorage.getItem('detailWOid');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(tmpParsed){
        setDetailWOid(tmpParsed);
      }else{
        setDetailWOid(null);
      }
    }
    
    //set even if null
    if(currentView){
      window.localStorage.setItem('detailWOid', JSON.stringify(detailWOid || null));
    }
    
  }, [detailWOid, currentView]);

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

  //Save and/or Fetch recentWO to local storage
  useEffect(() => {
    if(recentWO == null){
      var tmp = window.localStorage.getItem('recentWO');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(Array.isArray(tmpParsed)){
        setRecentWO(tmpParsed);
      }else{
        setRecentWO([]);
      }
    }
    if(Array.isArray(recentWO)){
      window.localStorage.setItem('recentWO', JSON.stringify(recentWO));
    }
    
  }, [recentWO]);

  useEffect(()=>{
    if(activeWorkOrder && activeWorkOrder.wo_record_id){
        var updateArray = [...recentWO];

        if(updateArray.length > 5){
            //remove first index
            updateArray.shift();
        }
        if( updateArray.length == 0 || ( updateArray.length > 0 && updateArray[updateArray.length-1]?.wo_record_id != activeWorkOrder.wo_record_id) ){
          setRecentWO([...updateArray, { wo_record_id: activeWorkOrder.wo_record_id, c_name: activeWorkOrder.c_name }])
        }
        

    }
  },[activeWorkOrder])

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

  useEffect(()=>{
    if(shipToContactOptionsWOI == null && activeWorkOrder && activeWorkOrder.wo_record_id){
      WorkOrderDetail.getShipToWOIOptions(activeWorkOrder.wo_record_id)
      .then((data)=>{
        if(data){
          setShipToContactOptionsWOI(data);
        }
      })
      .catch((error)=>{
        cogoToast.error("Failed to get shipToContactOptionsWOI ");
        console.error("Failed to get shipToContactOptionsWOI", error);
      })
    }
  },[shipToContactOptionsWOI, activeWorkOrder])

  useEffect(()=>{
    if(shipToAddressOptionsWOI == null && activeWorkOrder && activeWorkOrder.wo_record_id){
      WorkOrderDetail.getShipToAddressWOIOptions(activeWorkOrder.wo_record_id)
      .then((data)=>{
        if(data){
          setShipToAddressOptionsWOI(data);
        }
      })
      .catch((error)=>{
        cogoToast.error("Failed to get shipToContactOptionsWOI ");
        console.error("Failed to get shipToContactOptionsWOI", error);
      })
    }
  },[shipToAddressOptionsWOI, activeWorkOrder])

  const handleSetView = (view)=>{
    setCurrentView(view);
    setPreviousView(currentView ? currentView : null);
  }
    

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
      case "woItems":
        return <WOItemization />
        break;
      case "packingSlip":
        return <WOPackingSlip />
        break;
      case "woPdf":
        return <WorkOrderPdf/>
        break;
      case "pastWO":
        return <PastWOs/>
        break;
      case "woFPOrder":
        return <WOFairPlayOrders />
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
      case "woItems":
        return <WOSidebarDetail />
        break;
      case "packingSlip":
        return <WOSidebarDetail />
        break;
      case "woPdf":
        return <WOSidebarDetail />
        break;
      case "pastWO":
        return <WOSidebarDetail />
        break;
      case "woFPOrder":
        return <WOSidebarDetail />
        break;
      default: 
        cogoToast.error("Bad view");
        return <WOSidebarList />;
        break;
    }
  }
  

  return (
    <div className={classes.root}>
      <ListContext.Provider value={{workOrders, setWorkOrders, rowDateRange, setDateRowRange,
          currentView, previousView, handleSetView, views, detailWOid,setDetailWOid, activeWorkOrder, setActiveWorkOrder,
          editWOModalOpen, setEditWOModalOpen, raineyUsers, setRaineyUsers, setEditModalMode, recentWO, setRecentWO, compInvState, setCompInvState,
          searchValue,setSearchValue} } >
      <DetailContext.Provider value={{editWOIModalMode,setEditWOIModalMode, activeWOI, setActiveWOI, resetWOIForm, setResetWOIForm, workOrderItems, 
                    setWorkOrderItems,editWOIModalOpen,setEditWOIModalOpen, vendorTypes, setVendorTypes,
                     shipToContactOptionsWOI, setShipToContactOptionsWOI, shipToAddressOptionsWOI, setShipToAddressOptionsWOI, fpOrderModalMode,setFPOrderModalMode, activeFPOrder, setActiveFPOrder,
                     fpOrderModalOpen, setFPOrderModalOpen, fpOrders, setFPOrders, resetFPForm, setResetFPForm}} >
        <div className={classes.containerDiv}>
        
        <Grid container>

          <Grid item xs={12}>
            {currentView && <WOToolbar />}
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
        <AddEditModal editModalMode={editModalMode}/>
      </DetailContext.Provider>
      </ListContext.Provider>
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
    
  },
  mainPanel:{
    boxShadow: 'inset 0px 2px 4px 0px #a7a7a7',
  }
}));