import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress, Grid} from '@material-ui/core';


import cogoToast from 'cogo-toast';

import Util from '../../js/Util';
import Settings from '../../js/Settings';
import Work_Orders from  '../../js/Work_Orders';
import WorkOrderDetail from  '../../js/WorkOrderDetail';

import AdminToolbar from './Toolbar/AdminToolbar';
//Sidebars

//Main Panels
import Users from './MainPanels/Users';


//Extras
import AdminSidebar from './Sidebars/AdminSidebar';



var today =  new Date();

export const AdminContext = createContext(null);
export const DetailContext = createContext(null);

//This is the highest component for the Task Page
//Contains all important props that all tabs use
const AdminContainer = function(props) {
  const {user} = props;

  //views used through whole app, 
  //child views with parent run parent's onClose() function
  const views = [ { value: "users", displayName: 'Users'},
                  ];

  const [currentView,setCurrentView] = useState(null);
  const [previousView, setPreviousView] = useState(null);
    
      

  const classes = useStyles();

  //Get View from local storage if possible || set default
  useEffect(() => {
    if(currentView == null){
      var tmp = window.localStorage.getItem('currentAdminView');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(tmpParsed){
        var view = views.filter((v)=> v.value == tmpParsed)[0]
        handleSetView(view || views[0]);
      }else{
        handleSetView(views[0]);
      }
    }
    if(currentView){
      window.localStorage.setItem('currentAdminView', JSON.stringify(currentView.value));
    }
    
  }, [currentView]);

  
  //get settings


  const handleSetView = (view)=>{
    setCurrentView(view);
    setPreviousView(currentView ? currentView : null);
  }
    

  const getMainComponent = () =>{
    switch(currentView.value){
      case "users":
        return <Users />
        break;
      default: 
        cogoToast.error("Bad view");
        return <Users />;
        break;
    }
  }

  const getSidebarComponent = () =>{
    switch(currentView.value){
      case "users":
        return <AdminSidebar />
        break
      default: 
        cogoToast.error("Bad view");
        return <AdminSidebar />
        break;
    }
  }
  

  return (
    <div className={classes.root}>
      <AdminContext.Provider value={{user, currentView, previousView, handleSetView, views} } >
      
        <div className={classes.containerDiv}>
        
        <Grid container>

          <Grid item xs={12}>
            {currentView && <AdminToolbar />}
          </Grid>

        </Grid>
        
            <Grid container>

              <Grid item xs={3} md={2} >
                {currentView && getSidebarComponent()}
              </Grid>

              <Grid item xs={9} md={10} className={classes.mainPanel}>
                {currentView && getMainComponent()}
                
              </Grid>

            </Grid>
        

        </div>
      </AdminContext.Provider>
    </div>
  );
}

export default AdminContainer

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