import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress, Grid} from '@material-ui/core';


import cogoToast from 'cogo-toast';
import {createSorter} from '../../../js/Sort';
import {createFilter} from '../../../js/Filter';

import Util from '../../../js/Util';
import Settings from '../../../js/Settings';
import InventorySets from '../../../js/InventorySets';


import SetsToolbar from './Toolbar/SetsToolbar';
//Sidebars
import SetsListSidebar from './Sidebars/SetsListSidebar';
import SetsDetailSidebar from './Sidebars/SetsDetailSidebar';

//Main Panels
import SetsList from './MainPanels/SetsList';
import SetsDetail from './MainPanels/SetsDetail';
import _ from 'lodash';

//Extras
import AddEditModal from './AddEditSet/AddEditModal';


var today =  new Date();

export const ListContext = createContext(null);
export const DetailContext = createContext(null);

//This is the highest component for the Task Page
//Contains all important props that all tabs use
const InvSetsContainer = function(props) {
  const {user} = props;

  const [sets, setSets] = useState(null);
  const [setsSaved, setSetsSaved] = useState(null);
  const [setsRefetch, setSetsRefetch] = useState(false);
  const [setsSearchRefetch,setSetsSearchRefetch] = useState(false);

  
  // const [rowDateRange, setDateRowRange] = useState({
  //         to: Util.convertISODateToMySqlDate(today),
  //         from: Util.convertISODateToMySqlDate(new Date(new Date().setDate(today.getDate()-270)))
  // });

  //views used through inv sets, 
  //child views with parent run parent's onClose() function
  const views = [ { value: "setsList", displayName: "Sets List",  },
                  {value: 'setsSearch', displayName: 'Search Sets', closeToView: 'setsList',
                      onClose: ()=> {setSetsRefetch(true)}},
                  {value: 'setsDetail', displayName: 'Set Detail', closeToView: 'setsList',
                      onClose: ()=> {setSetsRefetch(true); setActiveSet(null); setDetailSetId(null);}},
                    {value: 'setsRecentOrders', displayName: 'Recent Orders', closeToView: 'setsList',
                      parent: 'setsDetail'},
                    {value: 'setsSets', displayName: 'Related Sets', closeToView: 'setsList',
                      parent: 'setsDetail'},
                ];

  const [currentView,setCurrentView] = useState(null);
  const [columnState, setColumnState] = useState(null);
  const [sorters, setSorters] = useState(null);

  const [recentSets, setRecentSets] = React.useState(null);
  const [activeSet, setActiveSet] = React.useState(null);
  const [detailSetId,setDetailSetId] = useState(null);
  const [editSetModalMode, setEditSetModalMode] = React.useState("add")
  const [editSetModalOpen, setEditSetModalOpen] = React.useState(false);


  const classes = useStyles();

  //Get View from local storage if possible || set default
  useEffect(() => {
    if(currentView == null){
      var tmp = window.localStorage.getItem('currentInvSetsView');
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
      window.localStorage.setItem('currentInvSetsView', JSON.stringify(currentView.value));
    }
    
  }, [currentView]);
  
 
  //Sign Rows
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is set to null
    if(((sets == null || setsRefetch == true) && sorters != null) ) {
      if(setsRefetch == true){
        setSetsRefetch(false);
      }

      InventorySets.getAllSets()
      .then( data => { 
        var tmpData = [...data];
  

        //SORT after filters -------------------------------------------------------------------------
        if(sorters && sorters.length > 0){
          tmpData = tmpData.sort(createSorter(...sorters))
        }
        //--------------------------------------------------------------------------------------------
        setSets(tmpData);
        setSetsSaved(data);
      })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting sets`, {hideAfter: 4});
      })
    }
  },[sets, setsRefetch, sorters]);
  
  //Save and/or Fetch sorters to local storage
    useEffect(() => {
        if(sorters == null){
          var tmp = window.localStorage.getItem('invSetSorters');
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
            window.localStorage.setItem('invSetSorters', JSON.stringify(sorters));
        }

    }, [sorters]);

    //Sort - when sort is updated after sets already exist
    useEffect(()=>{
        if (Array.isArray(sorters) && sorters.length) {
            if (sets && sets.length) {
                var tmpData = sets.sort(createSorter(...sorters))
                var copyObject = [...tmpData];
                setSets(copyObject);
                cogoToast.success(`Sorting by ${sorters.map((v, i)=> v.property + ", ")}`);
            }
        }
    },[sorters]);



  //Save and/or Fetch detailSetId to local storage
  useEffect(() => {
    if(detailSetId == null && currentView && (currentView.value == "setsDetail" || currentView.parent == "setsDetail")){
      var tmp = window.localStorage.getItem('detailSetId');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(tmpParsed){
        setDetailSetId(tmpParsed);
      }else{
        setDetailSetId(null);
      }
    }
    
    //set even if null
    if(currentView){
      window.localStorage.setItem('detailSetId', JSON.stringify(detailSetId || null));
    }
    
  }, [detailSetId, currentView]);

  
  //Set for detail views
  useEffect(()=>{
    if(detailSetId && activeSet == null){
      InventorySets.getSetById(detailSetId)
      .then((data)=>{
        if(data){
          console.log("data",data)
          setActiveSet(data[0]);
        }
      })
      .catch((error)=>{
        console.error("Failed to get work order", error);
        cogoToast.error("Failed to get work order");
      })
    }
  },[detailSetId, activeSet])

  //Save and/or Fetch recentWO to local storage
  useEffect(() => {
    if(recentSets == null){
      var tmp = window.localStorage.getItem('recentSets');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(Array.isArray(tmpParsed)){
        setRecentSets(tmpParsed);
      }else{
        setRecentSets([]);
      }
    }
    if(Array.isArray(recentSets)){
      window.localStorage.setItem('recentSets', JSON.stringify(recentSets));
    }
    
  }, [recentSets]);

  useEffect(()=>{
    if(activeSet && activeSet.rainey_id){
        var updateArray = [...recentSets];

        if(updateArray.length > 5){
            //remove first index
            updateArray.shift();
        }
        if( updateArray.length == 0 || ( updateArray.length > 0 && updateArray[updateArray.length-1]?.rainey_id != activeSet.rainey_id) ){
          setRecentSets([...updateArray, { rainey_id: activeSet.rainey_id, description: activeSet.description }])
        }

    }
  },[activeSet])

   

  const getMainComponent = () =>{
    switch(currentView.value){
      case "setsList":
        return <SetsList  columnState={columnState} setColumnState={setColumnState}/>
        break;
      case "setsSearch":
        return <SetsList  columnState={columnState} setColumnState={setColumnState}/>
        break;
      case "setsDetail":
        return <SetsDetail/>
        break;
      case  "setsRecentOrders":
        return <></>;
        break;
      case "setsSets":
        return <></>;
        break;
      default: 
        cogoToast.error("Bad view");
        return <>Bad view</>;
        break;
    }
  }

  const getSidebarComponent = () =>{
    switch(currentView.value){
      case "setsList":
        return <SetsListSidebar/>
        break;
      case "setsSearch":
        return <SetsListSidebar />
        break;
      case "setsDetail":
      case  "setsRecentOrders":
      case "setsSets":
        return <SetsDetailSidebar />
        break;
      default: 
        cogoToast.error("Bad view");
        return <SetsListSidebar />;
        break;
    }
  }
  

  return (
    <div className={classes.root}>
      <ListContext.Provider value={{sets, setSets, setSetsRefetch, setsSearchRefetch,setSetsSearchRefetch,currentView, setCurrentView, views,columnState, setColumnState, 
      detailSetId,  setDetailSetId,editSetModalMode,setEditSetModalMode, activeSet, setActiveSet, editSetModalOpen,setEditSetModalOpen,
         recentSets, setRecentSets, sorters, setSorters,  setsSaved, setSetsSaved} } >
      <DetailContext.Provider value={{}} >
        <div className={classes.containerDiv}>
        
        <Grid container>

          <Grid item xs={12}>
            {currentView && <SetsToolbar />}
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
        {editSetModalOpen  && <AddEditModal /> }
        </DetailContext.Provider>
      </ListContext.Provider>
    </div>
  );
}

export default InvSetsContainer

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