import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress, Grid} from '@material-ui/core';


import cogoToast from 'cogo-toast';
import {createSorter} from '../../../js/Sort';
import {createFilter} from '../../../js/Filter';

import Util from '../../../js/Util';
import Settings from '../../../js/Settings';
import InventoryKits from '../../../js/InventoryKits';


import KitsToolbar from './Toolbar/KitsToolbar';
//Sidebars
import KitsListSidebar from './Sidebars/KitsListSidebar';
import KitsDetailSidebar from './Sidebars/KitsDetailSidebar';

//Main Panels
import KitsList from './MainPanels/KitsList';
import KitsDetail from './MainPanels/KitsDetail';
import KitsItemization from './MainPanels/DetailSubPanels/KitsItemization';
import _ from 'lodash';

//Extras
import AddEditModal from './AddEditKit/AddEditModal';
import ImportKitDialog from './components/ImportKitDialog';


var today =  new Date();

export const ListContext = createContext(null);
export const DetailContext = createContext(null);

//This is the highest component for the Task Page
//Contains all important props that all tabs use
const InvKitsContainer = function(props) {
  const {user} = props;

  const [kits, setKits] = useState(null);
  const [kitsSaved, setKitsSaved] = useState(null);
  const [kitsRefetch, setKitsRefetch] = useState(false);
  const [kitsSearchRefetch,setKitsSearchRefetch] = useState(false);

  
  // const [rowDateRange, setDateRowRange] = useState({
  //         to: Util.convertISODateToMySqlDate(today),
  //         from: Util.convertISODateToMySqlDate(new Date(new Date().setDate(today.getDate()-270)))
  // });

  //views used through inv kits, 
  //child views with parent run parent's onClose() function
  const views = [ { value: "kitsList", displayName: "Kits List",  },
                  {value: 'kitsSearch', displayName: 'Search Kits', closeToView: 'kitsList',
                      onClose: ()=> {setKitsRefetch(true)}},
                  {value: 'kitsDetail', displayName: 'Kit Detail', closeToView: 'kitsList',
                      onClose: ()=> {setKitsRefetch(true); setActiveKit(null); setDetailKitId(null);}},
                      {value: 'kitsItemization', displayName: 'Itemization', closeToView: 'kitsList',
                      parent: 'kitsDetail'},
                    {value: 'kitsRecentOrders', displayName: 'Recent Orders', closeToView: 'kitsList',
                      parent: 'kitsDetail'},
                    {value: 'kitsKits', displayName: 'Related Kits', closeToView: 'kitsList',
                      parent: 'kitsDetail'},
                ];

  const [currentView,setCurrentView] = useState(null);
  const [columnState, setColumnState] = useState(null);
  const [sorters, setSorters] = useState(null);

  const [recentKits, setRecentKits] = React.useState(null);
  const [activeKit, setActiveKit] = React.useState(null);
  const [detailKitId,setDetailKitId] = useState(null);
  const [editKitModalMode, setEditKitModalMode] = React.useState("add")
  const [editKitModalOpen, setEditKitModalOpen] = React.useState(false);

  const [editKitItemDialogMode,setEditKitItemDialogMode] = useState("add")
  const [editKitItemModalOpen,setEditKitItemModalOpen] = useState(false);
  const [ activeKitItemItem, setActiveKitItemItem] = React.useState(null);

  const [importKitModalOpen,setImportKitModalOpen] = useState(false);
  const [ activeImportItem, setActiveImportItem] = React.useState(null);
   


  const classes = useStyles();

  //Get View from local storage if possible || set default
  useEffect(() => {
    if(currentView == null){
      var tmp = window.localStorage.getItem('currentInvKitsView');
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
      window.localStorage.setItem('currentInvKitsView', JSON.stringify(currentView.value));
    }
    
  }, [currentView]);
  
 
  //Sign Rows
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is set to null
    if(((kits == null || kitsRefetch == true) && sorters != null) ) {
      if(kitsRefetch == true){
        setKitsRefetch(false);
      }

      InventoryKits.getAllKits()
      .then( data => { 
        var tmpData = [...data];
  

        //SORT after filters -------------------------------------------------------------------------
        if(sorters && sorters.length > 0){
          tmpData = tmpData.sort(createSorter(...sorters))
        }
        //--------------------------------------------------------------------------------------------
        setKits(tmpData);
        setKitsSaved(data);
      })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting kits`, {hideAfter: 4});
      })
    }
  },[kits, kitsRefetch, sorters]);
  
  //Save and/or Fetch sorters to local storage
    useEffect(() => {
        if(sorters == null){
          var tmp = window.localStorage.getItem('invKitSorters');
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
            window.localStorage.setItem('invKitSorters', JSON.stringify(sorters));
        }

    }, [sorters]);

    //Sort - when sort is updated after kits already exist
    useEffect(()=>{
        if (Array.isArray(sorters) && sorters.length) {
            if (kits && kits.length) {
                var tmpData = kits.sort(createSorter(...sorters))
                var copyObject = [...tmpData];
                setKits(copyObject);
                cogoToast.success(`Sorting by ${sorters.map((v, i)=> v.property + ", ")}`);
            }
        }
    },[sorters]);



  //Save and/or Fetch detailKitId to local storage
  useEffect(() => {
    if(detailKitId == null && currentView && (currentView.value == "kitsDetail" || currentView.parent == "kitsDetail")){
      var tmp = window.localStorage.getItem('detailKitId');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(tmpParsed){
        setDetailKitId(tmpParsed);
      }else{
        setDetailKitId(null);
      }
    }
    
    //set even if null
    if(currentView){
      window.localStorage.setItem('detailKitId', JSON.stringify(detailKitId || null));
    }
    
  }, [detailKitId, currentView]);

  
  //Kit for detail views
  useEffect(()=>{
    if(detailKitId && activeKit == null){
      InventoryKits.getKitById(detailKitId)
      .then((data)=>{
        if(data){
          console.log("data",data)
          setActiveKit(data[0]);
        }
      })
      .catch((error)=>{
        console.error("Failed to get work order", error);
        cogoToast.error("Failed to get work order");
      })
    }
  },[detailKitId, activeKit])

  //Save and/or Fetch recentWO to local storage
  useEffect(() => {
    if(recentKits == null){
      var tmp = window.localStorage.getItem('recentKits');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(Array.isArray(tmpParsed)){
        setRecentKits(tmpParsed);
      }else{
        setRecentKits([]);
      }
    }
    if(Array.isArray(recentKits)){
      window.localStorage.setItem('recentKits', JSON.stringify(recentKits));
    }
    
  }, [recentKits]);

  useEffect(()=>{
    if(activeKit && activeKit.rainey_id){
        var updateArray = [...recentKits];

        if(updateArray.length > 5){
            //remove first index
            updateArray.shift();
        }
        if( updateArray.length == 0 || ( updateArray.length > 0 && updateArray[updateArray.length-1]?.rainey_id != activeKit.rainey_id) ){
          setRecentKits([...updateArray, { rainey_id: activeKit.rainey_id, description: activeKit.description }])
        }

    }
  },[activeKit])

   

  const getMainComponent = () =>{
    switch(currentView.value){
      case "kitsList":
        return <KitsList user={user} columnState={columnState} setColumnState={setColumnState}/>
        break;
      case "kitsSearch":
        return <KitsList user={user} columnState={columnState} setColumnState={setColumnState}/>
        break;
      case "kitsDetail":
        return <KitsDetail user={user}/>
        break;
      case "kitsItemization":
        return <KitsItemization user={user}/>
        break;
      case  "kitsRecentOrders":
        return <></>;
        break;
      case "kitsKits":
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
      case "kitsList":
        return <KitsListSidebar/>
        break;
      case "kitsSearch":
        return <KitsListSidebar />
        break;
      case "kitsDetail":
      case  "kitsRecentOrders":
      case "kitsKits":
      case "kitsItemization":
        return <KitsDetailSidebar />
        break;
      default: 
        cogoToast.error("Bad view");
        return <KitsListSidebar />;
        break;
    }
  }
  

  return (
    <div className={classes.root}>
      <ListContext.Provider value={{user, kits, setKits, setKitsRefetch, kitsSearchRefetch,setKitsSearchRefetch,currentView, setCurrentView, views,columnState, setColumnState, 
      detailKitId,  setDetailKitId,editKitModalMode,setEditKitModalMode, activeKit, setActiveKit, editKitModalOpen,setEditKitModalOpen,
         recentKits, setRecentKits, sorters, setSorters,  kitsSaved, setKitsSaved, importKitModalOpen,setImportKitModalOpen, activeImportItem, setActiveImportItem
        } } >
      <DetailContext.Provider value={{ editKitItemModalOpen,setEditKitItemModalOpen,editKitItemDialogMode,setEditKitItemDialogMode,
        activeKitItemItem, setActiveKitItemItem}} >
        <div className={classes.containerDiv}>
        
        <Grid container>

          <Grid item xs={12}>
            {currentView && <KitsToolbar />}
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
        {editKitModalOpen  && <AddEditModal /> }
        {importKitModalOpen && <ImportKitDialog /> }
        </DetailContext.Provider>
      </ListContext.Provider>
    </div>
  );
}

export default InvKitsContainer

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