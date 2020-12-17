import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress, Grid} from '@material-ui/core';


import cogoToast from 'cogo-toast';
import {createSorter} from '../../js/Sort';

import Util from '../../js/Util';
import Settings from '../../js/Settings';
import Signs from  '../../js/Signs';

import SignToolbar from './Toolbar/SignToolbar';
//Sidebars
import SignSidebarScheduler from './Sidebars/SignSidebarScheduler';

//Main Panels
import SignScheduler from './MainPanels/SignScheduler';
import _ from 'lodash';

//Extras



var today =  new Date();

export const ListContext = createContext(null);

//This is the highest component for the Task Page
//Contains all important props that all tabs use
const SignContainer = function(props) {
  const {user} = props;

  const [signs, setSigns] = useState(null);
  const [signRefetch, setSignRefetch] = useState(false);

  const [signsSaved, setSignsSaved] = useState([]);
  const [filters, setFilters] = useState(null);
  const [filterInOrOut, setFilterInOrOut] = useState(null);
  const [filterAndOr, setFilterAndOr] = useState(null);
  // const [rowDateRange, setDateRowRange] = useState({
  //         to: Util.convertISODateToMySqlDate(today),
  //         from: Util.convertISODateToMySqlDate(new Date(new Date().setDate(today.getDate()-270)))
  // });
  const [finishedState, setFinishedState] = useState(null);

  //views used through whole app, 
  //child views with parent run parent's onClose() function
  const views = [ { value: "signScheduler", displayName: "Sign Scheduler",  },
                  { value: "allSigns", displayName: "Sign List",  },
                  {value: 'searchSigns', displayName: 'Search Signs', closeToView: 'signScheduler',
                      onClose: ()=> {setSignRefetch(true)}} ];

  const [currentView,setCurrentView] = useState(null);
  // const [detailWOid,setDetailWOid] = useState(null);

  // const [editPOModalOpen, setEditPOModalOpen] = React.useState(false);
  // const [editModalMode, setEditModalMode] = React.useState(null);
  
  //Extras
  //const [raineyUsers, setRaineyUsers] = useState(null);

  //Detail - FairPlay Order
  // const [fpOrders, setFPOrders] = React.useState(null);
  // const [fpOrders, setFPOrders] = React.useState(null);
  // const [activeFPOrder, setActiveFPOrder] =React.useState(null);
  // const [fpOrderModalMode,setFPOrderModalMode] = React.useState("add");
  // const [fpOrderModalOpen, setFPOrderModalOpen] = React.useState(false);
  // const [vendorTypes, setVendorTypes] = React.useState(null);
  
  const classes = useStyles();

  //Get View from local storage if possible || set default
  useEffect(() => {
    if(currentView == null){
      var tmp = window.localStorage.getItem('currentSignView');
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
      window.localStorage.setItem('currentSignView', JSON.stringify(currentView.value));
    }
    
  }, [currentView]);

  
  //Sign Rows
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is set to null
    if(signs == null || signRefetch == true) {
      if(signRefetch == true){
        setSignRefetch(false);
      }

      Signs.getAllSignsForScheduler()
      .then( data => { 

        var keys = [{key: "install_date", direction: 'ASC'},
                    {key: "type", direction: 'ASC'},
                    {key: "state", direction: 'ASC'},
                    {key: "work_order", direction: 'DESC'},
                    {key: "description", direction: 'ASC'}]
     
        const sortArray = (array, direction, value) =>{
          return array.sort(createSorter(...[{
            property: value, 
            direction: direction
          }]));
        }
       
        const recursiveSort = (dataArray, key, i) => {
          if(i >= keys.length-1){
            //Base case to end on
            return sortArray(dataArray, key.direction, key.key); 
          }
        
          var splitArray = [];
          sortArray( Array.from(new Set(dataArray.map((item)=>item[key.key]))),key.direction, null )
            .forEach((value)=>{
              var filteredArray = dataArray.filter((item)=> item[key.key] == value); //get items that match value
              var tmptmp = recursiveSort(filteredArray, keys[i+1], i+1)
              splitArray = [...splitArray, ...tmptmp];
            })
          return splitArray;
          
        }
        var setSignsData = recursiveSort(data, keys[0], 0);
        console.log("Final data", setSignsData)

        //Set Filters
        setSignsSaved(setSignsData);
        //filter out here

        if(finishedState){

          var finished = finishedState.finished;
          if( finished){
              var tmpSigns = [...setSignsData];
              if(finished == "yes"){
                  tmpSigns = tmpSigns.filter((v,i)=> v.sign_popped_and_boxed )
              }
              if(finished == "no"){
                tmpSigns = tmpSigns.filter((v,i)=> !v.sign_popped_and_boxed)
              }
              if(finished == "all"){
                //no need to filter
              }
              setSigns(tmpSigns)
          }
        }else{
          setSigns(setSignsData);
        }

      })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting signs`, {hideAfter: 4});
      })
    }

  },[signs, signRefetch, finishedState]);

  //Save and/or Fetch filters to local storage
  useEffect(() => {
    if(filters == null){
      var tmp = window.localStorage.getItem('signfilters');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(Array.isArray(tmpParsed)){
        setFilters(tmpParsed);
      }else{
        setFilters([]);
      }
    }
    if(Array.isArray(filters)){
      window.localStorage.setItem('signfilters', JSON.stringify(filters));
    }
    
  }, [filters]);

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

  // useEffect(()=>{
  //   if(raineyUsers == null){
  //     Settings.getRaineyUsers()
  //     .then((data)=>{
  //       setRaineyUsers(data);
  //     })
  //     .catch((error)=>{
  //       cogoToast.error("Failed to get rainey users");
  //       console.error("failed to get rainey users", error)
  //     })
  //   }
  // },[raineyUsers])

  

  // useEffect(()=>{
  //   if(vendorTypes == null){
  //     WorkOrderDetail.getVendorTypes()
  //     .then((data)=>{
  //       if(data){
  //         setVendorTypes(data);
  //       }
  //     })
  //     .catch((error)=>{
  //       cogoToast.error("Failed to get vendor types");
  //       console.error("Failed to get vendor types", error);
  //     })
  //   }
  // },[vendorTypes])

   

  const getMainComponent = () =>{
    switch(currentView.value){
      case "signScheduler":
        return <SignScheduler/>
        break;
      case "allSigns":
        return <SignScheduler />
        break;
      case "searchSigns":
        return <SignScheduler/>
        break;
      default: 
        cogoToast.error("Bad view");
        return <SignScheduler />;
        break;
    }
  }

  const getSidebarComponent = () =>{
    switch(currentView.value){
      case "signScheduler":
        return <SignSidebarScheduler/>
        break;
      case "allSigns":
        return <SignSidebarScheduler />
        break
      case "searchSigns":
        return <SignSidebarScheduler />
        break;
      default: 
        cogoToast.error("Bad view");
        return <SignSidebarScheduler />;
        break;
    }
  }
  

  return (
    <div className={classes.root}>
      <ListContext.Provider value={{signs, setSigns, setSignRefetch,currentView, setCurrentView, views, signsSaved, setSignsSaved,filters, setFilters,
      filterInOrOut, setFilterInOrOut,filterAndOr, setFilterAndOr, finishedState, setFinishedState} } >
      
        <div className={classes.containerDiv}>
        
        <Grid container>

          <Grid item xs={12}>
            {currentView && <SignToolbar />}
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

export default SignContainer

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