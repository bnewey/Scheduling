import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress, Grid} from '@material-ui/core';

import moment from 'moment';
import cogoToast from 'cogo-toast';
import {createSorter} from '../../../js/Sort';
import {createFilter} from '../../../js/Filter';

import Util from '../../../js/Util';
import Settings from '../../../js/Settings';
import Inventory from '../../../js/Inventory';


import PartsToolbar from './Toolbar/PartsToolbar';
//Sidebars
import PartsListSidebar from './Sidebars/PartsListSidebar';
import PartsDetailSidebar from './Sidebars/PartsDetailSidebar';

//Main Panels
import PartsList from './MainPanels/PartsList';
import PartsDetail from './MainPanels/PartsDetail';
import _ from 'lodash';

//Extras
import AddEditModal from './AddEditPart/AddEditModal';


var today =  new Date();

export const ListContext = createContext(null);
export const DetailContext = createContext(null);

//This is the highest component for the Task Page
//Contains all important props that all tabs use
const InvPartsContainer = function(props) {
  const {user} = props;
  console.log("user",user);

  const [parts, setParts] = useState(null);
  const [partsSaved, setPartsSaved] = useState(null);
  const [partsRefetch, setPartsRefetch] = useState(false);
  const [partsSearchRefetch,setPartsSearchRefetch] = useState(false);

  
  // const [rowDateRange, setDateRowRange] = useState({
  //         to: Util.convertISODateToMySqlDate(today),
  //         from: Util.convertISODateToMySqlDate(new Date(new Date().setDate(today.getDate()-270)))
  // });

  //views used through inv parts, 
  //child views with parent run parent's onClose() function
  const views = [ { value: "partsList", displayName: "Parts List",  },
                  {value: 'partsSearch', displayName: 'Search Parts', closeToView: ()=>  'partsList',
                  onClose: ()=> {setPartsRefetch(true);setSavedSearch(null); setSavedSearchValue(null); setBackToSearch(false);}},
                  {value: 'partsDetail', displayName: 'Part Detail', closeToView: (search)=> search ? 'partsSearch' : 'partsList',
                  onClose: (search)=>{if(!search){setPartsRefetch(true);setSavedSearchValue(null); setSearchValue("");} setActivePart(null); setDetailPartId(null);}},
                    {value: 'partsRecentOrders', displayName: 'Recent Orders', closeToView: (search)=> search ? 'partsSearch' : 'partsList',
                      parent: 'partsDetail'},
                    {value: 'partsKits', displayName: 'Related Kits', closeToView: (search)=> search ? 'partsSearch' : 'partsList',
                      parent: 'partsDetail'},
                ];

  const [currentView,setCurrentView] = useState(null);
  const [columnState, setColumnState] = useState(null);
  const [sorters, setSorters] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);

  const [recentParts, setRecentParts] = React.useState(null);
  const [activePart, setActivePart] = React.useState(null);
  const [detailPartId,setDetailPartId] = useState(null);
  const [editPartModalMode, setEditPartModalMode] = React.useState("add")
  const [editPartModalOpen, setEditPartModalOpen] = React.useState(false);

  const [searchValue,setSearchValue] = useState("");
  const [savedSearchValue, setSavedSearchValue] = useState(null);
  const [savedSearch, setSavedSearch] = useState(null);
  const [backToSearch, setBackToSearch] = useState(false);


  const classes = useStyles();
  
   //Get View from local storage if possible || set default
   useEffect(() => {
    if(currentView == null){
      var tmp = window.localStorage.getItem('currentInvPartsView');
      var tmpParsed, view, date;
      if(tmp){
        tmpParsed = JSON.parse(tmp)
        let tmpParsedArray = tmpParsed.split('#date#');
        view = tmpParsedArray[0];
        date = tmpParsedArray[1];
      }
      if(view){
        var view = views.filter((v)=> v.value == view)[0]
        console.log('view',view);
        handleSetView(view || views[0]);

        //if date and is older than 15 minutes
        if(date && moment() > moment(date).add(15,'minute') ){
          console.log("Disregard saved view, go to default", date);
          handleSetView(views[0]);
        }
      }else{
        handleSetView(views[0]);
      }
    }
    if(currentView){
      window.localStorage.setItem('currentInvPartsView', JSON.stringify(currentView.value + '#date#' + moment().format('YYYY-MM-DD HH:mm:ss')));
    }
    
  }, [currentView]);

  const handleSetView = (view)=>{
    setCurrentView(view);
  }
 
  //Sign Rows
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is set to null
    if(((parts == null || partsRefetch == true) && sorters != null) ) {
      if(partsRefetch == true){
        setPartsRefetch(false);
      }

      Inventory.getAllParts()
      .then( data => { 
        var tmpData = [...data];
        //Filters
        if(typeFilter){
          tmpData = tmpData.filter(createFilter([{property: 'type', value: typeFilter}], "in", "or"))
        }

        //SORT after filters -------------------------------------------------------------------------
        if(sorters && sorters.length > 0){
          tmpData = tmpData.sort(createSorter(...sorters))
        }
        //--------------------------------------------------------------------------------------------
        setParts(tmpData);
        setPartsSaved(data);
      })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting parts`, {hideAfter: 4});
      })
    }
  },[parts, partsRefetch, sorters]);
  
  //Save and/or Fetch sorters to local storage
    useEffect(() => {
        if(sorters == null){
          var tmp = window.localStorage.getItem('invPartSorters');
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
            window.localStorage.setItem('invPartSorters', JSON.stringify(sorters));
        }

    }, [sorters]);

    //Sort - when sort is updated after parts already exist
    useEffect(()=>{
        if (Array.isArray(sorters) && sorters.length) {
            if (parts && parts.length) {
                var tmpData = parts.sort(createSorter(...sorters))
                var copyObject = [...tmpData];
                setParts(copyObject);
                cogoToast.success(`Sorting by ${sorters.map((v, i)=> v.property + ", ")}`);
            }
        }
    },[sorters]);

    //Save and/or Fetch sorters to local storage
    useEffect(() => {
      if(typeFilter == null){
        var tmp = window.localStorage.getItem('invTypeFilter');
        var tmpParsed;
        if(tmp){
            tmpParsed = JSON.parse(tmp);
        }
        if(tmpParsed){
            setTypeFilter(tmpParsed);
        }else{
            setTypeFilter("");
        }
      }
      if(typeFilter || typeFilter === ""){
          window.localStorage.setItem('invTypeFilter', JSON.stringify(typeFilter));
      }

    }, [typeFilter]);

    //Filter - when filter is updated after parts already exist
    useEffect(()=>{
      if (typeFilter) {
            if (partsSaved && partsSaved.length) {
              var tmpData = partsSaved.filter(createFilter([{property: 'type', value: typeFilter}], "in", "or"))
              var copyObject = [...tmpData];
              setParts(copyObject);
              cogoToast.success(`Filtering by ${typeFilter}`);
          }
      }
    },[typeFilter]);


  //Save and/or Fetch detailPartId to local storage
  useEffect(() => {
    if(detailPartId == null && currentView && (currentView.value == "partsDetail" || currentView.parent == "partsDetail")){
      var tmp = window.localStorage.getItem('detailPartId');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(tmpParsed){
        setDetailPartId(tmpParsed);
      }else{
        setDetailPartId(null);
      }
    }
    
    //set even if null
    if(currentView){
      window.localStorage.setItem('detailPartId', JSON.stringify(detailPartId || null));
    }
    
  }, [detailPartId, currentView]);

  
  //Part for detail views
  useEffect(()=>{
    if(detailPartId && activePart == null){
      Inventory.getPartById(detailPartId)
      .then((data)=>{
        if(data){
          setActivePart(data[0]);
        }
      })
      .catch((error)=>{
        console.error("Failed to get work order", error);
        cogoToast.error("Failed to get work order");
      })
    }
  },[detailPartId, activePart])

  //Save and/or Fetch recentWO to local storage
  useEffect(() => {
    if(recentParts == null){
      var tmp = window.localStorage.getItem('recentParts');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(Array.isArray(tmpParsed)){
        setRecentParts(tmpParsed);
      }else{
        setRecentParts([]);
      }
    }
    if(Array.isArray(recentParts)){
      window.localStorage.setItem('recentParts', JSON.stringify(recentParts));
    }
    
  }, [recentParts]);

  useEffect(()=>{
    if(activePart && activePart.rainey_id){
        var updateArray = [...recentParts];

        if(updateArray.length > 5){
            //remove first index
            updateArray.shift();
        }
        if( updateArray.length == 0 || ( updateArray.length > 0 && updateArray[updateArray.length-1]?.rainey_id != activePart.rainey_id) ){
          setRecentParts([...updateArray, { rainey_id: activePart.rainey_id, description: activePart.description }])
        }

    }
  },[activePart])

   

  const getMainComponent = () =>{
    switch(currentView.value){
      case "partsList":
        return <PartsList user={user} columnState={columnState} setColumnState={setColumnState}/>
        break;
      case "partsSearch":
        return <PartsList user={user} columnState={columnState} setColumnState={setColumnState}/>
        break;
      case "partsDetail":
        return <PartsDetail user={user}/>
        break;
      case  "partsRecentOrders":
        return <></>;
        break;
      case "partsKits":
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
      case "partsList":
        return <PartsListSidebar/>
        break;
      case "partsSearch":
        return <PartsListSidebar />
        break;
      case "partsDetail":
      case  "partsRecentOrders":
      case "partsKits":
        return <PartsDetailSidebar />
        break;
      default: 
        cogoToast.error("Bad view");
        return <PartsListSidebar />;
        break;
    }
  }
  

  return (
    <div className={classes.root}>
      <ListContext.Provider value={{user, parts, setParts, setPartsRefetch, partsSearchRefetch,setPartsSearchRefetch,currentView, setCurrentView, views,columnState, setColumnState, 
      detailPartId,  setDetailPartId,editPartModalMode,setEditPartModalMode, activePart, setActivePart, editPartModalOpen,setEditPartModalOpen,
         recentParts, setRecentParts, sorters, setSorters, typeFilter, setTypeFilter, partsSaved, setPartsSaved, handleSetView,
         searchValue,setSearchValue, savedSearch, setSavedSearch, backToSearch, setBackToSearch,
           savedSearchValue, setSavedSearchValue,} } >
      <DetailContext.Provider value={{}} >
        <div className={classes.containerDiv}>
        
        <Grid container>

          <Grid item xs={12}>
            {currentView && <PartsToolbar />}
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
        {editPartModalOpen  && <AddEditModal user={user} /> }
        </DetailContext.Provider>
      </ListContext.Provider>
    </div>
  );
}

export default InvPartsContainer

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