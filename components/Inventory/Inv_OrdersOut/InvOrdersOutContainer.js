import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress, Grid} from '@material-ui/core';


import cogoToast from 'cogo-toast';
import {createSorter} from '../../../js/Sort';
import {createFilter} from '../../../js/Filter';

import moment from 'moment';
import Util from '../../../js/Util';
import Settings from '../../../js/Settings';
import InventoryOrdersOut from '../../../js/InventoryOrdersOut';


import OrdersOutToolbar from './Toolbar/OrdersOutToolbar';
//Sidebars
import OrdersOutListSidebar from './Sidebars/OrdersOutListSidebar';
import OrdersOutDetailSidebar from './Sidebars/OrdersOutDetailSidebar';

//Main Panels
import OrdersOutList from './MainPanels/OrdersOutList';
import OrdersOutDetail from './MainPanels/OrdersOutDetail';
import _ from 'lodash';

//Extras
import AddEditModal from './AddEditOrderOut/AddEditModal';
import OrderOutItemization from './MainPanels/DetailSubPanels/Itemization/OrderOutItemization';


var today =  new Date();

export const ListContext = createContext(null);
export const DetailContext = createContext(null);

//This is the highest component for the Task Page
//Contains all important props that all tabs use
const InvOrdersOutContainer = function(props) {
  const {user} = props;

  const [ordersOut, setOrdersOut] = useState(null);
  const [ordersOutSaved, setOrdersOutSaved] = useState(null);
  const [ordersOutRefetch, setOrdersOutRefetch] = useState(false);
  const [ordersOutSearchRefetch,setOrdersOutSearchRefetch] = useState(false);

  
  // const [rowDateRange, setDateRowRange] = useState({
  //         to: Util.convertISODateToMySqlDate(today),
  //         from: Util.convertISODateToMySqlDate(new Date(new Date().setDate(today.getDate()-270)))
  // });

  //views used through inv ordersOut, 
  //child views with parent run parent's onClose() function
  const views = [ { value: "ordersOutList", displayName: "OrdersOut List",  },
                  {value: 'ordersOutSearch', displayName: 'Search OrdersOut', closeToView: () => 'ordersOutList',
                  onClose: ()=> {setOrdersOutRefetch(true);setSavedSearch(null); setSavedSearchValue(null); setBackToSearch(false);}} ,
                  {value: 'ordersOutDetail', displayName: 'OrderOut Detail', closeToView: (search)=> search ? 'ordersOutSearch' : 'ordersOutList',
                  onClose: (search)=>{if(!search){setOrdersOutRefetch(true);setSavedSearchValue(null); setSearchValue("");} setActiveOrderOut(null); setDetailOrderOutId(null);}},
                      { value: "orderOutItems", displayName: 'Itemization', closeToView: (search)=> search ? 'ordersOutSearch' : 'ordersOutList',
                        parent: 'ordersOutDetail'},
                    {value: 'ordersOutRecentOrders', displayName: 'Recent Orders', closeToView: (search)=> search ? 'ordersOutSearch' : 'ordersOutList',
                      parent: 'ordersOutDetail'},
                    {value: 'ordersOutOrdersOut', displayName: 'Related OrdersOut', closeToView: (search)=> search ? 'ordersOutSearch' : 'ordersOutList',
                      parent: 'ordersOutDetail'},
                ];

  const [currentView,setCurrentView] = useState(null);
  const [columnState, setColumnState] = useState(null);
  const [sorters, setSorters] = useState(null);

  const [recentOrdersOut, setRecentOrdersOut] = React.useState(null);
  const [activeOrderOut, setActiveOrderOut] = React.useState(null);
  const [detailOrderOutId,setDetailOrderOutId] = useState(null);
  const [editOrderOutModalMode, setEditOrderOutModalMode] = React.useState("add")
  const [editOrderOutModalOpen, setEditOrderOutModalOpen] = React.useState(false);

  //OOI
  const [editOOIDialogMode, setEditOOIDialogMode] = useState("add")
  const [editOOIModalOpen, setEditOOIModalOpen] = React.useState(false);
  const [ activeOOItem, setActiveOOItem] = React.useState(null);

  const [searchValue,setSearchValue] = useState("");
  const [savedSearchValue, setSavedSearchValue] = useState(null);
  const [savedSearch, setSavedSearch] = useState(null);
  const [backToSearch, setBackToSearch] = useState(false);


  const classes = useStyles();

   //Get View from local storage if possible || set default
   useEffect(() => {
    if(currentView == null){
      var tmp = window.localStorage.getItem('currentInvOrdersOutView');
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
      window.localStorage.setItem('currentInvOrdersOutView', JSON.stringify(currentView.value + '#date#' + moment().format('YYYY-MM-DD HH:mm:ss')));
    }
    
  }, [currentView]);

  const handleSetView = (view)=>{
    setCurrentView(view);
  }
  
 
  //Sign Rows
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is kit to null
    if(((ordersOut == null || ordersOutRefetch == true) && sorters != null) ) {
      if(ordersOutRefetch == true){
        setOrdersOutRefetch(false);
      }

      InventoryOrdersOut.getAllOrdersOut()
      .then( data => { 
        var tmpData = [...data];
  

        //SORT after filters -------------------------------------------------------------------------
        if(sorters && sorters.length > 0){
          tmpData = tmpData.sort(createSorter(...sorters))
        }
        //--------------------------------------------------------------------------------------------
        setOrdersOut(tmpData);
        setOrdersOutSaved(data);
      })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting ordersOut`, {hideAfter: 4});
      })
    }
  },[ordersOut, ordersOutRefetch, sorters]);
  
  //Save and/or Fetch sorters to local storage
    useEffect(() => {
        if(sorters == null){
          var tmp = window.localStorage.getItem('invOrderOutSorters');
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
            window.localStorage.setItem('invOrderOutSorters', JSON.stringify(sorters));
        }

    }, [sorters]);

    //Sort - when sort is updated after ordersOut already exist
    useEffect(()=>{
        if (Array.isArray(sorters) && sorters.length) {
            if (ordersOut && ordersOut.length) {
                var tmpData = ordersOut.sort(createSorter(...sorters))
                var copyObject = [...tmpData];
                setOrdersOut(copyObject);
                cogoToast.success(`Sorting by ${sorters.map((v, i)=> v.property + ", ")}`);
            }
        }
    },[sorters]);



  //Save and/or Fetch detailOrderOutId to local storage
  useEffect(() => {
    if(detailOrderOutId == null && currentView && (currentView.value == "ordersOutDetail" || currentView.parent == "ordersOutDetail")){
      var tmp = window.localStorage.getItem('detailOrderOutId');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(tmpParsed){
        setDetailOrderOutId(tmpParsed);
      }else{
        setDetailOrderOutId(null);
      }
    }
    
    //set even if null
    if(currentView){
      window.localStorage.setItem('detailOrderOutId', JSON.stringify(detailOrderOutId || null));
    }
    
  }, [detailOrderOutId, currentView]);

  
  //OrderOut for detail views
  useEffect(()=>{
    if(detailOrderOutId && activeOrderOut == null){
      InventoryOrdersOut.getOrderOutById(detailOrderOutId)
      .then((data)=>{
        if(data){
          console.log("data",data)
          setActiveOrderOut(data[0]);
        }
      })
      .catch((error)=>{
        console.error("Failed to get work order", error);
        cogoToast.error("Failed to get work order");
      })
    }
  },[detailOrderOutId, activeOrderOut])

  //Save and/or Fetch recentWO to local storage
  useEffect(() => {
    if(recentOrdersOut == null){
      var tmp = window.localStorage.getItem('recentOrdersOut');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(Array.isArray(tmpParsed)){
        setRecentOrdersOut(tmpParsed);
      }else{
        setRecentOrdersOut([]);
      }
    }
    if(Array.isArray(recentOrdersOut)){
      window.localStorage.setItem('recentOrdersOut', JSON.stringify(recentOrdersOut));
    }
    
  }, [recentOrdersOut]);

  useEffect(()=>{
    if(activeOrderOut && activeOrderOut.id){
        var updateArray = [...recentOrdersOut];

        if(updateArray.length > 5){
            //remove first index
            updateArray.shift();
        }
        if( updateArray.length == 0 || ( updateArray.length > 0 && updateArray[updateArray.length-1]?.id != activeOrderOut.id) ){
          setRecentOrdersOut([...updateArray, { rainey_id: activeOrderOut.id, description: activeOrderOut.description }])
        }

    }
  },[activeOrderOut])

   

  const getMainComponent = () =>{
    switch(currentView.value){
      case "ordersOutList":
        return <OrdersOutList user={user} columnState={columnState} setColumnState={setColumnState}/>
        break;
      case "ordersOutSearch":
        return <OrdersOutList user={user} columnState={columnState} setColumnState={setColumnState}/>
        break;
      case "ordersOutDetail":
        return <OrdersOutDetail user={user}/>
        break;
      case 'orderOutItems':
        return <OrderOutItemization user={user}/>
        break;
      case  "ordersOutRecentOrders":
        return <></>;
        break;
      case "ordersOutOrdersOut":
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
      case "ordersOutList":
        return <OrdersOutListSidebar/>
        break;
      case "ordersOutSearch":
        return <OrdersOutListSidebar />
        break;
      case "ordersOutDetail":
      case  "ordersOutRecentOrders":
      case "orderOutItems":
      case "ordersOutOrdersOut":
        return <OrdersOutDetailSidebar />
        break;
      default: 
        cogoToast.error("Bad view");
        return <OrdersOutListSidebar />;
        break;
    }
  }

  return (
    <div className={classes.root}>
      <ListContext.Provider value={{user ,ordersOut, setOrdersOut, setOrdersOutRefetch, ordersOutSearchRefetch,setOrdersOutSearchRefetch,currentView, setCurrentView, views,columnState, setColumnState, 
      detailOrderOutId,  setDetailOrderOutId,editOrderOutModalMode,setEditOrderOutModalMode, activeOrderOut, setActiveOrderOut, editOrderOutModalOpen,setEditOrderOutModalOpen,
         recentOrdersOut, setRecentOrdersOut, sorters, setSorters,  ordersOutSaved, setOrdersOutSaved,
         searchValue,setSearchValue, savedSearch, setSavedSearch, backToSearch, setBackToSearch,
           savedSearchValue, setSavedSearchValue, handleSetView} } >
      <DetailContext.Provider value={{editOOIDialogMode, setEditOOIDialogMode, editOOIModalOpen, setEditOOIModalOpen,
      activeOOItem, setActiveOOItem}} >
        <div className={classes.containerDiv}>
        
        <Grid container>

          <Grid item xs={12}>
            {currentView && <OrdersOutToolbar />}
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
        {editOrderOutModalOpen  && <AddEditModal /> }
        </DetailContext.Provider>
      </ListContext.Provider>
    </div>
  );
}

export default InvOrdersOutContainer

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