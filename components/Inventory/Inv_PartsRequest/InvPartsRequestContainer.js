import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress, Grid} from '@material-ui/core';


import cogoToast from 'cogo-toast';
import {createSorter} from '../../../js/Sort';
import {createFilter} from '../../../js/Filter';

import Util from '../../../js/Util';
import Settings from '../../../js/Settings';
import InventoryPartsRequest from '../../../js/InventoryPartsRequest';


import PartsRequestToolbar from './Toolbar/PartsRequestToolbar';
//Sidebars
import PartsRequestListSidebar from './Sidebars/PartsRequestListSidebar';

//Main Panels
import PartsRequestList from './MainPanels/PartsRequestList';
import _ from 'lodash';

//Extras
import AddEditPartsRequestItemDialog from './components/AddEditPartsRequestItemDialog';


var today =  new Date();

export const ListContext = createContext(null);
export const DetailContext = createContext(null);

//This is the highest component for the Task Page
//Contains all important props that all tabs use
const InvPartsRequestContainer = function(props) {
  const {user} = props;

  const [partsRequestItems, setPartsRequestItems] = useState(null);
  const [partsRequestItemsSaved, setPartsRequestItemsSaved] = useState(null);
  const [partsRequestItemsRefetch, setPartsRequestItemsRefetch] = useState(false);
  const [partsRequestItemsSearchRefetch,setPartsRequestItemsSearchRefetch] = useState(false);

  
  // const [rowDateRange, setDateRowRange] = useState({
  //         to: Util.convertISODateToMySqlDate(today),
  //         from: Util.convertISODateToMySqlDate(new Date(new Date().setDate(today.getDate()-270)))
  // });

  //views used through inv partsRequestItems, 
  //child views with parent run parent's onClose() function
  const views = [ { value: "partsRequestItemsList", displayName: "Parts Request List",  },     ];

  const [currentView,setCurrentView] = useState(null);
  const [columnState, setColumnState] = useState(null);
  const [sorters, setSorters] = useState(null);
  const [statusSortState, setStatusSortState] = useState(null);

  //PRI
  const [editPRIDialogMode, setEditPRIDialogMode] = useState("add");
  const [editPRIModalOpen, setEditPRIModalOpen] = React.useState(false);
  const [ activePRItem, setActivePRItem] = React.useState(null);


  const classes = useStyles();

  //Get View from local storage if possible || kit default
  useEffect(() => {
    if(currentView == null){
      var tmp = window.localStorage.getItem('currentInvPartsRequestView');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(tmpParsed){
        var view = views.filter((v)=> v.value == tmpParsed)[0];
        setCurrentView(view || views[0]);
      }else{
        setCurrentView(views[0]);
      }
    }
    if(currentView){
      window.localStorage.setItem('currentInvPartsRequestView', JSON.stringify(currentView.value));
    }
    
  }, [currentView]);

  //Get View from local storage if possible || kit default
  useEffect(() => {
    if(statusSortState == null){
      var tmp = window.localStorage.getItem('invPartsRequestStatusFilterState');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(tmpParsed){
        setStatusSortState(tmpParsed );
      }else{
        setStatusSortState({denied: 'all', hold: 'all', filled: 'all'});
      }
    }
    if(statusSortState){
      window.localStorage.setItem('invPartsRequestStatusFilterState', JSON.stringify(statusSortState));
    }
    
  }, [statusSortState]);
  
 
  //Sign Rows
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is kit to null
    if(((partsRequestItems == null || partsRequestItemsRefetch == true) && sorters != null) ) {
      if(partsRequestItemsRefetch == true){
        setPartsRequestItemsRefetch(false);
      }

      InventoryPartsRequest.getAllPartsRequestItems()
      .then( data => { 
        var tmpData = [...data];

        //SORT after filters -------------------------------------------------------------------------
        if(sorters && sorters.length > 0){
          tmpData = tmpData.sort(createSorter(...sorters));
        }
        //--------------------------------------------------------------------------------------------
        if(statusSortState){

          var deny_state = statusSortState.denied;
          var filled_state = statusSortState.filled;
          var hold_state = statusSortState.hold;
          if(deny_state && filled_state && hold_state){
              var tmpItems = [...tmpData];
              
              tmpItems = tmpItems.filter( deny_state != "all" ? createFilter([{property: 'status', value: 3}], 
                                                                deny_state == "yes" ? "in" : "out" , "or") : ()=> true);

              tmpItems = tmpItems.filter( filled_state != "all" ? createFilter([{property: 'status', value: 5}], 
                                                                filled_state == "yes" ? "in" : "out" , "or") : ()=> true);
              
              tmpItems = tmpItems.filter( hold_state != "all" ? createFilter([{property: 'status', value: 7}], 
                                                                hold_state == "yes" ? "in" : "out" , "or") : ()=> true);
              
              setPartsRequestItems(tmpItems);
          }else{
            console.error("Failed to filter");
            
          }
        }else{
          setPartsRequestItems(tmpData);
        }
        setPartsRequestItemsSaved(data);
      })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting partsRequestItems`, {hideAfter: 4});
      })
    }
  },[partsRequestItems, partsRequestItemsRefetch, sorters]);
  
  //Save and/or Fetch sorters to local storage
    useEffect(() => {
        if(sorters == null){
          var tmp = window.localStorage.getItem('invPartsRequestSorters');
          var tmpParsed;
          if(tmp){
              tmpParsed = JSON.parse(tmp);
          }
          if(Array.isArray(tmpParsed)){
              setSorters([...tmpParsed]);
          }else{
              setSorters([]);
          }
        }
        if(Array.isArray(sorters)){
            window.localStorage.setItem('invPartsRequestSorters', JSON.stringify(sorters));
        }

    }, [sorters]);

    //Sort - when sort is updated after partsRequestItems already exist
    useEffect(()=>{
        if (Array.isArray(sorters) && sorters.length) {
            if (partsRequestItems && partsRequestItems.length) {
                var tmpData = partsRequestItems.sort(createSorter(...sorters));
                var copyObject = [...tmpData];
                setPartsRequestItems(copyObject);
                cogoToast.success(`Sorting by ${sorters.map((v, i)=> v.property + ", ")}`);
            }
        }
    },[sorters]);
 
   

  const getMainComponent = () =>{
    switch(currentView.value){
      case "partsRequestItemsList":
        return <PartsRequestList user={user} columnState={columnState} setColumnState={setColumnState}/>;
        break;
      default: 
        cogoToast.error("Bad view");
        return <>Bad view</>;
        break;
    }
  }

  const getSidebarComponent = () =>{
    switch(currentView.value){
      case "partsRequestItemsList":
        return <PartsRequestListSidebar/>;
        break;
      default: 
        cogoToast.error("Bad view");
        return <PartsRequestListSidebar />;
        break;
    }
  }

  return (
    <div className={classes.root}>
      <ListContext.Provider value={{user ,partsRequestItems, setPartsRequestItems, setPartsRequestItemsRefetch,
         partsRequestItemsSearchRefetch,setPartsRequestItemsSearchRefetch,currentView, setCurrentView, views,columnState, setColumnState,
          sorters, setSorters,  partsRequestItemsSaved, setPartsRequestItemsSaved,
          editPRIDialogMode, setEditPRIDialogMode, editPRIModalOpen, setEditPRIModalOpen,
         activePRItem, setActivePRItem, statusSortState, setStatusSortState} } >
      <DetailContext.Provider value={{}} >
        <div className={classes.containerDiv}>
        
        <Grid container>

          <Grid item xs={12}>
            {currentView && <PartsRequestToolbar />}
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
        {editPRIModalOpen  && <AddEditPartsRequestItemDialog /> }
        </DetailContext.Provider>
      </ListContext.Provider>
    </div>
  );
}

export default InvPartsRequestContainer;

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
    backgroundColor: '#fff',
  }
}));