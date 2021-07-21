import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress, Grid} from '@material-ui/core';


import cogoToast from 'cogo-toast';
import {createSorter} from '../../../js/Sort';

import Util from '../../../js/Util';
import Settings from '../../../js/Settings';
import Inventory from '../../../js/Inventory';


import AdminToolbar from './Toolbar/AdminToolbar';
//Sidebars
import AdminSidebar from './Sidebars/AdminSidebar';

//Main Panels
import AdminPage from './MainPanels/AdminPage';
import _ from 'lodash';

//Extras


var today =  new Date();

export const AdminContext = createContext(null);

//This is the highest component for the Task Page
//Contains all important props that all tabs use
const InvAdminContainer = function(props) {
  const {user} = props;

  const [manItems, setManItems] = useState(null);
  const [manItemsRefetch, setManItemsRefetch] = useState(false);
  const [partTypes, setPartTypes] = useState(null);
  const [partTypesRefetch, setPartTypesRefetch] = useState(false);

  //views used through inv parts, 
  //child views with parent run parent's onClose() function
  const views = [ { value: "adminPage", displayName: "Admin",  },
                  
                ];

  const [currentView,setCurrentView] = useState(null);



  const classes = useStyles();

  //Get View from local storage if possible || kit default
  useEffect(() => {
    if(currentView == null){
      var tmp = window.localStorage.getItem('currentInvAdminView');
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
      window.localStorage.setItem('currentInvAdminView', JSON.stringify(currentView.value));
    }
    
  }, [currentView]);
  
 
  //Sign Rows
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is kit to null
    if(((manItems == null || manItemsRefetch == true) ) ) {
      if(manItemsRefetch == true){
        setManItemsRefetch(false);
      }

      Inventory.getManufactures()
      .then( data => { 
        setManItems(data);
      })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting manufacturers`, {hideAfter: 4});
      })
    }
  },[manItems, manItemsRefetch]);

  //Sign Rows
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is kit to null
    if(((partTypes == null || partTypesRefetch == true) ) ) {
      if(partTypesRefetch == true){
        setPartTypesRefetch(false);
      }

      Inventory.getPartTypes()
      .then( data => { 
        setPartTypes(data);
      })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting manufacturers`, {hideAfter: 4});
      })
    }
  },[partTypes, partTypesRefetch]);
  
 

   

  const getMainComponent = () =>{
    switch(currentView.value){
      case "adminPage":
        return <AdminPage user={user} />
        break;
      
      default: 
        cogoToast.error("Bad view");
        return <>Bad view</>;
        break;
    }
  }

  const getSidebarComponent = () =>{
    switch(currentView.value){
      case "adminPage":
        return <AdminSidebar/>
        break;
      default: 
        cogoToast.error("Bad view");
        return <AdminSidebar />;
        break;
    }
  }
  

  return (
    <div className={classes.root}>
      <AdminContext.Provider value={{user, currentView, setCurrentView, views, manItems, manItemsRefetch, setManItemsRefetch, partTypes, partTypesRefetch, setPartTypesRefetch} } >
      
        <div className={classes.containerDiv}>
        
        <Grid container>

          <Grid item xs={12}>
            {currentView && <AdminToolbar />}
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
      </AdminContext.Provider>
    </div>
  );
}

export default InvAdminContainer

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