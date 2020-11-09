import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress, Grid} from '@material-ui/core';


import cogoToast from 'cogo-toast';

import Util from '../../js/Util';
import Settings from '../../js/Settings';
import Work_Orders from  '../../js/Work_Orders';
import WorkOrderDetail from  '../../js/WorkOrderDetail';

import EntityToolbar from './Toolbar/EntityToolbar';
//Sidebars
import EntitySidebarList from './Sidebars/EntitySidebarList';
import EntitySidebarDetail from './Sidebars/EntitySidebarDetail';

//Main Panels
import EntityList from './MainPanels/EntityList';
import EntityDetail from './MainPanels/EntityDetail';

import EntityFairPlayOrders from './MainPanels/DetailSubPanels/FairPlayOrders/EntityFairPlayOrders'

//Extras
import AddEditModal from './AddEditWorkOrder/AddEditModal'


export const ListContext = createContext(null);
export const DetailContext = createContext(null);

//This is the highest component for the Task Page
//Contains all important props that all tabs use
const EntitiesContainer = function(props) {
  const {user} = props;

  const [entities, setEntities] = useState(null);


  //views used through whole app, 
  //child views with parent run parent's onClose() function
  const views = [ { value: "allEntities", displayName: "Entities", /*onClose: ()=> {setEntities(null)}*/ },
                  {value: 'search', displayName: 'Search', closeToView: 'allEntities',
                      onClose: ()=> {setEntities(null)}} ,
                  {value: "entityDetail", displayName: 'Entity Detail', closeToView: 'allEntities', 
                      onClose: ()=>{setEntities(null);setActiveEntity(null); setDetailEntityId(null); setShipToOptionsWOI(null)}}, 
                  { value: "entityFPOrder", displayName: 'FairPlay Order', closeToView: 'allEntities',
                        parent: 'entityDetail'}];

  const [currentView,setCurrentView] = useState(null);
  const [detailEntityId,setDetailEntityId] = useState(null);
  const [activeEntity, setActiveEntity] = useState(null);

  const [editWOModalOpen, setEditWOModalOpen] = React.useState(false);
  const [editModalMode, setEditModalMode] = React.useState(null);

  const [recentEntities, setRecentEntities] = React.useState(null);
  
  const [raineyUsers, setRaineyUsers] = useState(null);
  //Detail Context States
      //Detail - WOI
      const [vendorTypes, setVendorTypes] = React.useState(null);
      const [shipToOptionsWOI,setShipToOptionsWOI] = React.useState(null);
      //
      //Detail - FairPlay Order
      const [fpOrders, setFPOrders] = React.useState(null);
      const [fpOrderModalMode,setFPOrderModalMode] = React.useState("add");
      const [activeFPOrder, setActiveFPOrder] =React.useState(null);
      const [fpOrderModalOpen, setFPOrderModalOpen] = React.useState(false);
  //
  
  const classes = useStyles();

  //Get View from local storage if possible || set default
  useEffect(() => {
    if(currentView == null){
      var tmp = window.localStorage.getItem('entitiesView');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(tmpParsed){
        var view = views.filter((v)=> v.value == tmpParsed)[0]
        setCurrentView(view || views[0]);
      }else{
        setCurrentView(views[0]);
      }
    }
    if(currentView){
      window.localStorage.setItem('entitiesView', JSON.stringify(currentView.value));
    }
    
  }, [currentView]);

  
  //OrderRows
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is set to null
    if(entities == null ) {
      
      Entities.getAllEntities()
      .then( data => {   
        setEntities(data);
      })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting tasks`, {hideAfter: 4});
      })
    }

  },[entities]);

  //Work Order for detail views
  useEffect(()=>{
    if(detailEntityId && activeEntity == null){
      Work_Orders.getWorkOrderById(detailEntityId)
      .then((data)=>{
        if(data){
          setActiveEntity(data[0]);
        }
      })
      .catch((error)=>{
        console.error("Failed to get work order", error);
        cogoToast.error("Failed to get work order");
      })
    }
  },[detailEntityId, activeEntity])

  //Save and/or Fetch detailEntityId to local storage
  useEffect(() => {
    if(detailEntityId == null && currentView && (currentView.value == "entityDetail" || currentView.parent == "entityDetail")){
      var tmp = window.localStorage.getItem('detailEntityId');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(tmpParsed){
        setDetailEntityId(tmpParsed);
      }else{
        setDetailEntityId(null);
      }
    }
    
    //set even if null
    if(currentView){
      window.localStorage.setItem('detailEntityId', JSON.stringify(detailEntityId || null));
    }
    
  }, [detailEntityId, currentView]);

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

  //Save and/or Fetch recentEntities to local storage
  useEffect(() => {
    if(recentEntities == null){
      var tmp = window.localStorage.getItem('recentEntities');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(Array.isArray(tmpParsed)){
        setRecentEntities(tmpParsed);
      }else{
        setRecentEntities([]);
      }
    }
    if(Array.isArray(recentEntities)){
      window.localStorage.setItem('recentEntities', JSON.stringify(recentEntities));
    }
    
  }, [recentEntities]);

  useEffect(()=>{
    if(activeEntity && activeEntity.record_id){
        var updateArray = [...recentEntities];

        if(updateArray.length > 5){
            //remove first index
            updateArray.shift();
        }
        if( updateArray.length == 0 || ( updateArray.length > 0 && updateArray[updateArray.length-1]?.record_id != activeEntity.record_id) ){
          setRecentEntities([...updateArray, { record_id: activeEntity.record_id, c_name: activeEntity.c_name }])
        }
        

    }
  },[activeEntity])

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
    if(shipToOptionsWOI == null && activeEntity && activeEntity.record_id){
      WorkOrderDetail.getShipToWOIOptions(activeEntity.record_id)
      .then((data)=>{
        if(data){
          setShipToOptionsWOI(data);
        }
      })
      .catch((error)=>{
        cogoToast.error("Failed to get shipToOptionsWOI ");
        console.error("Failed to get shipToOptionsWOI", error);
      })
    }
  },[shipToOptionsWOI, activeEntity])
    

  const getMainComponent = () =>{
    switch(currentView.value){
      case "allEntities":
        return <EntityList />
        break;
      case "search":
        return <EntityList/>
        break;
      case "entityDetail":
        return <EntityDetail />
        break;
      case "entityFPOrder":
        return <EntityFairPlayOrders />
        break;
      default: 
        cogoToast.error("Bad view");
        return <EntityList />;
        break;
    }
  }

  const getSidebarComponent = () =>{
    switch(currentView.value){
      case "allEntities":
        return <EntitySidebarList />
        break
      case "search":
        return <EntitySidebarList />
        break;
      case "entityDetail":
        return <EntitySidebarDetail />
        break;
      case "entityFPOrder":
        return <EntitySidebarDetail />
        break;
      default: 
        cogoToast.error("Bad view");
        return <EntitySidebarList />;
        break;
    }
  }
  

  return (
    <div className={classes.root}>
      <ListContext.Provider value={{entities, setEntities,
          currentView, setCurrentView, views, detailEntityId,setDetailEntityId, activeEntity, setActiveEntity,
          editWOModalOpen, setEditWOModalOpen, raineyUsers, setRaineyUsers, setEditModalMode, recentEntities, setRecentEntities} } >
      <DetailContext.Provider value={{ vendorTypes, setVendorTypes,
                     shipToOptionsWOI, setShipToOptionsWOI, fpOrderModalMode,setFPOrderModalMode, activeFPOrder, setActiveFPOrder,
                     fpOrderModalOpen, setFPOrderModalOpen, fpOrders, setFPOrders}} >
        <div className={classes.containerDiv}>
        
        <Grid container>

          <Grid item xs={12}>
            {currentView && <EntityToolbar />}
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

export default EntitiesContainer

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