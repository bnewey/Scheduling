import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress, Grid} from '@material-ui/core';


import cogoToast from 'cogo-toast';
import {createSorter} from '../../js/Sort';

import Util from '../../js/Util';
import Settings from '../../js/Settings';

import InventoryTabs from './components/InventoryTabs';

//Page Panels
import InvPartsContainer from './Inv_Parts/InvPartsContainer';
//import InvSetsContainer from './Inv_Sets/InvSetsContainer';
//import InvOrdersOutContainer from './Inv_OrdersOut/InvOrdersOutContainer';
//import InvOrdersInContainer from './Inv_OrdersIn/InvOrdersInContainer';
import _ from 'lodash';
import InvAdminContainer from './Inv_Admin/InvAdminContainer';


export const InventoryContext = createContext(null);

//This is the highest component for the Inventory Page
//Contains all important props that all tabs use
const InventoryContainer = function(props) {
  const {user} = props;

  //views used through whole inventory app, 
  const views = [ { value: "invParts", displayName: "Inventory Parts", index: 0 },
                  { value: "invSets", displayName: "Inventory Sets", index: 1 },
                  { value: "invOrdersOut", displayName: "Inv Orders Out", index: 2},
                  { value: "invOrdersIn", displayName: "Inv Orders In", index: 3},
                  { value: "invAdmin", displayName: "Admin", index: 4 },];

  const [currentView,setCurrentView] = useState(null);

  //Parts

  const classes = useStyles();

  //Get View from local storage if possible || set default
  useEffect(() => {
    if(currentView == null){
      var tmp = window.localStorage.getItem('currentInventoryView');
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
      window.localStorage.setItem('currentInventoryView', JSON.stringify(currentView.value));
    }
    
  }, [currentView]);


  const getInvPage = () =>{
    switch(currentView.value){
      case "invParts":
        return <InvPartsContainer/>
        break;
      case "invSets":
        //return <InvSetsContainer/>
        break;
      case "invOrdersOut":
        //return <InvOrdersOutContainer/>
        break;
      case "invOrdersIn":
        //return <InvOrdersInContainer/>
        break;
      case "invAdmin":
        return <InvAdminContainer/>
        break;
      default: 
        cogoToast.error("Bad view");
        return <InvPartsContainer/>;
        break;
    }
  }
  

  return (
    <div className={classes.root}>
      <InventoryContext.Provider value={{currentView, setCurrentView, views} } >
      
        <div className={classes.containerDiv}>
        
        <InventoryTabs >
              { currentView && getInvPage()}
              { currentView && getInvPage()}
              { currentView && getInvPage()}
              { currentView && getInvPage()}
              { currentView && getInvPage()}
              {/* <InvSetsContainer/>
              <InvOrdersOutContainer/>
              <InvOrdersInContainer/> */}
         </InventoryTabs>

        </div>
      </InventoryContext.Provider>
    </div>
  );
}

export default InventoryContainer

const useStyles = makeStyles(theme => ({
  root:{
    margin: '0 0 0 0',
  },
  containerDiv:{
    backgroundColor: '#fff',
    padding: "0%",
    
  },
  mainPanel:{
    // boxShadow: 'inset 0px 2px 4px 0px #a7a7a7',
    // backgroundColor: '#e7eff8'
  }
}));