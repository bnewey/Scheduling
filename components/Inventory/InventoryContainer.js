import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress, Grid} from '@material-ui/core';


import cogoToast from 'cogo-toast';
import moment from 'moment';
import {createSorter} from '../../js/Sort';

import Util from '../../js/Util';
import Settings from '../../js/Settings';

import InventoryTabs from './components/InventoryTabs';

//Page Panels
import InvPartsContainer from './Inv_Parts/InvPartsContainer';
import InvKitsContainer from './Inv_Kits/InvKitsContainer';
import InvOrdersOutContainer from './Inv_OrdersOut/InvOrdersOutContainer';
import InvPartRequestContainer from './Inv_PartsRequest/InvPartsRequestContainer';
//import InvOrdersInContainer from './Inv_OrdersIn/InvOrdersInContainer';
import _ from 'lodash';
import InvAdminContainer from './Inv_Admin/InvAdminContainer';


export const InventoryContext = createContext(null);

//This is the highest component for the Inventory Page
//Contains all important props that all tabs use
const InventoryContainer = function(props) {
  const {user} = props;

  //views used through whole inventory app, 
  const views = [ { value: "invParts", displayName: "Parts", index: 0, adminOnly: true },
                  { value: "invKits", displayName: "Kits", index: 1 , adminOnly: true},
                  { value: "invOrdersOut", displayName: "Orders Out", index: 2, adminOnly: true},
                  { value: "invOrdersIn", displayName: "Orders In", index: 3, adminOnly: true},
                  { value: "invPartRequest", displayName: "Parts Request", index: 4},
                  { value: "invAdmin", displayName: "Admin", index: 5 , adminOnly: true},];

  const [currentView,setCurrentView] = useState(null);

  //Parts

  const classes = useStyles();

   //Get View from local storage if possible || set default
   useEffect(() => {
    if(currentView == null){
      var tmp = window.localStorage.getItem('currentInventoryView');
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
      window.localStorage.setItem('currentInventoryView', JSON.stringify(currentView.value + '#date#' + moment().format('YYYY-MM-DD HH:mm:ss')));
    }
    
  }, [currentView]);

  const handleSetView = (view)=>{
    setCurrentView(view);
  }


  const getInvPages = () =>{
    let tabs = views.filter((item)=> {
      if(item.adminOnly == false || item.adminOnly == undefined){
        return true;
      }

      return user.isAdmin == item.adminOnly 
    })
    return tabs.map((tab, i)=>{
      
        switch(tab.value){
          case "invParts":
            return <InvPartsContainer key={`${i}_inv_tab`} user={user}/>
            break;
          case "invKits":
            return <InvKitsContainer key={`${i}_inv_tab`} user={user}/>
            break;
          case "invOrdersOut":
            return <InvOrdersOutContainer key={`${i}_inv_tab`} user={user}/>
            break;
          case "invOrdersIn":
            //return <InvOrdersInContainer key={`${i}_inv_tab`} user={user}/>
            break;
          case "invPartRequest":
            return <InvPartRequestContainer key={`${i}_inv_tab`} user={user}/>
            break;
          case "invAdmin":
            return <InvAdminContainer key={`${i}_inv_tab`} user={user}/>
            break;
          default: 
            cogoToast.error("Bad view");
            return <InvPartsContainer key={`${i}_inv_tab`} user={user}/>;
            break;
        }
    })
    
  }
  

  return (
    <div className={classes.root}>
      <InventoryContext.Provider value={{user,currentView, setCurrentView, views} } >
      
        <div className={classes.containerDiv}>
        
        <InventoryTabs >
              { currentView && getInvPages()}
              {/* <InvKitsContainer/>
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