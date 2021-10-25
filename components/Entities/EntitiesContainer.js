import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress, Grid} from '@material-ui/core';


import cogoToast from 'cogo-toast';

import Util from '../../js/Util';
import Settings from '../../js/Settings';
import Entities from '../../js/Entities';


import EntityToolbar from './Toolbar/EntityToolbar';
//Sidebars
import EntitySidebarList from './Sidebars/EntitySidebarList';
import EntitySidebarDetail from './Sidebars/EntitySidebarDetail';

//Main Panels
import EntityList from './MainPanels/EntityList';
import EntityDetail from './MainPanels/EntityDetail';
import EntDetailAddresses from './MainPanels/DetailSubPanels/Addresses/EntDetailAddresses'
import EntDetailContacts from './MainPanels/DetailSubPanels/Contacts/EntDetailContacts'
import EntWOs from './MainPanels/DetailSubPanels/EntWOs/EntWOs.js'

//Extras
import AddEditModal from './AddEditEntity/AddEditModal'


export const ListContext = createContext(null);
export const DetailContext = createContext(null);

//This is the highest component for the Task Page
//Contains all important props that all tabs use
const EntitiesContainer = function(props) {
  const {user} = props;

  const [entities, setEntities] = useState(null);
  const [entitiesRefetch, setEntitiesRefetch] = useState(false);

  //views used through whole app, 
  //child views with parent run parent's onClose() function
  const views = [ { value: "allEntities", displayName: "Entities", /*onClose: ()=> {setEntities(null)}*/ },
                  {value: 'search', displayName: 'Search', closeToView: 'allEntities',
                      onClose: ()=> {setEntities(null)}} ,
                  {value: "entityDetail", displayName: 'Entity Detail', closeToView: 'allEntities', 
                      onClose: ()=>{setEntities(null);setActiveEntity(null); setDetailEntityId(null);}}, 
                  { value: "entAddresses", displayName: 'Addresses', closeToView: 'allEntities',
                    parent: 'entityDetail'},
                  { value: "entContacts", displayName: 'Contacts', closeToView: 'allEntities',
                    parent: 'entityDetail'},
                  { value: "entWOs", displayName: 'Related Work Orders', closeToView: 'allEntities',
                    parent: 'entityDetail'},
                ];

  const [currentView,setCurrentView] = useState(null);
  const [previousView, setPreviousView] = useState(null);
  const [detailEntityId,setDetailEntityId] = useState(null);
  const [activeEntity, setActiveEntity] = useState(null);

  const [editEntModalOpen, setEditEntModalOpen] = React.useState(false);
  const [editModalMode, setEditModalMode] = React.useState(null);

  const [recentEntities, setRecentEntities] = React.useState(null);
  
  const [raineyUsers, setRaineyUsers] = useState(null);
  //Detail Context States
      //Detail Addresses
      const [detailEntAddressId,setDetailEntAddressId] = useState(null);
      const [activeAddress, setActiveAddress] = useState(null);
      const [editAddressModalOpen, setEditAddressModalOpen] = React.useState(false);
      const [editAddressModalMode, setEditAddressModalMode] = React.useState(null);
      //Detail Contacts
      const [detailEntContactId,setDetailEntContactId] = useState(null);
      const [activeContact, setActiveContact] = useState(null);
      const [editContactModalOpen, setEditContactModalOpen] = React.useState(false);
      const [editContactModalMode, setEditContactModalMode] = React.useState(null);
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
        var view = views.filter((v)=> v.value == tmpParsed)[0];
        console.log("View", view);
        handleSetView(view || views[0]);
      }else{
        handleSetView(views[0]);
      }
    }
    if(currentView){
      window.localStorage.setItem('entitiesView', JSON.stringify(currentView.value));
    }
    
  }, [currentView]);

  
  //OrderRows
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is set to null
    if(entities == null || entitiesRefetch == true ) {
      if(entitiesRefetch == true){
        setEntitiesRefetch(false);

      }
      Entities.getAllEntities()
      .then( data => {   
        setEntities(data);
      })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting tasks`, {hideAfter: 4});
      })
    }

  },[entities, entitiesRefetch]);

  //Work Order for detail views
  useEffect(()=>{
    if(detailEntityId && activeEntity == null){
      Entities.getEntityById(detailEntityId)
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
          setRecentEntities([...updateArray, { record_id: activeEntity.record_id, name: activeEntity.name }])
        }
    }
  },[activeEntity])

  const handleSetView = (view)=>{
    setCurrentView(view);
    setPreviousView(currentView ? currentView : null);
  }
    

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
      case "entAddresses":
        return <EntDetailAddresses />
        break;
      case "entContacts":
        return <EntDetailContacts/>
        break;
      case "entWOs":
        return <EntWOs/>
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
      case "entAddresses":
      case "entWOs":
      case "entContacts":
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
      <ListContext.Provider value={{user, entities, setEntities,
          currentView, previousView, handleSetView, views, detailEntityId,setDetailEntityId, activeEntity, setActiveEntity,
          editEntModalOpen, setEditEntModalOpen, raineyUsers, setRaineyUsers, setEditModalMode, recentEntities, 
          setRecentEntities, entitiesRefetch, setEntitiesRefetch} } >
      <DetailContext.Provider value={{user, detailEntAddressId,setDetailEntAddressId, activeAddress, setActiveAddress,editAddressModalOpen, setEditAddressModalOpen,
        editAddressModalMode, setEditAddressModalMode,detailEntContactId,setDetailEntContactId,activeContact, setActiveContact,editContactModalOpen,
        setEditContactModalOpen,editContactModalMode, setEditContactModalMode  }} >
        <div className={classes.containerDiv}>
        
        <Grid container>

          <Grid item xs={12}>
            {currentView && <EntityToolbar />}
          </Grid>

        </Grid>
        
            <Grid container>

              <Grid item xs={3} md={2}>
                
                {currentView && getSidebarComponent()}
              </Grid>

              <Grid item xs={9} md={10} className={classes.mainPanel}>
                {currentView && getMainComponent()}
              </Grid>

            </Grid>
        

        </div>
        { editEntModalOpen && <AddEditModal editModalMode={editModalMode}/> }
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