import React, {useRef, useState, useEffect, createContext,useContext } from 'react';
import {makeStyles, CircularProgress, Grid, Typography, Button} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import cogoToast from 'cogo-toast';
import PublishIcon from '@material-ui/icons/Publish';

//import FilterFinished from './components/FilterFinished'
//import SignsPdf from './components/SignsPdf';
//import SignsSortOrder from './components/SignsSortOrder';

import Util from  '../../../../js/Util';
import { ListContext } from '../InvKitsContainer';
// import FilterArrivalState from './components/FilterArrivalState';

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    TimePicker,
    DateTimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';
import RecentKits from './components/RecentKits';
//import TypeFilterSelect from './components/TypeFilterSelect';


const KitsListSidebar = function(props) {
  const {user} = props;

  const {  currentView, setEditKitModalMode, setEditKitModalOpen, setImportKitModalOpen  } = useContext(ListContext);
  
  const classes = useStyles(); 

  const searchOpen = currentView && currentView.value == "kitsSearch";

  const handleOpenAddEditKitModal = () =>{
    setEditKitModalMode("add");
    setEditKitModalOpen(true);
  }
  const handleOpenImportKitModal = () =>{
    setImportKitModalOpen(true);
  }
  

  return (
    <div className={classes.root}>
        <div className={classes.newButtonDiv} >
             <Button className={classes.newButton} 
                    classes={{label: classes.newButtonLabel}} 
                    variant="outlined"
                     onClick={event=> handleOpenAddEditKitModal()}
                    >
              <AddIcon className={classes.plusIcon}/>
              <div>New Kit</div>
            </Button> 
            <Button className={classes.newButton} 
                    classes={{label: classes.newButtonLabel}} 
                    variant="outlined"
                     onClick={event=> handleOpenImportKitModal()}
                    >
              <PublishIcon className={classes.importIcon}/>
              <div>Import Kit</div>
            </Button> 
        </div>
        <div className={classes.dateRangeDiv}>
            
            <RecentKits />
        </div>
    
          
    </div>
  );
}

export default KitsListSidebar

const useStyles = makeStyles(theme => ({
    root:{
      // border: '1px solid #993333',
      padding: '1%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '4%',
      minHeight: '730px',
      borderRight: '1px solid #d2cece',
      backgroundColor: '#f8f8f8'
    },
    newButtonDiv:{
      padding: '3%',
      marginBottom: '15px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dateRangeDiv:{
      borderTop: '1px solid #d2cece',
      borderBottom: '1px solid #d2cece',
      padding: '3%',
      width: '100%',
      backgroundColor: '#f9f9f9',
    },
    newButtonLabel:{
      display:'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#5f5f5f',
      fontWeight: 600,
    },
    newButton:{
      boxShadow: '0px 1px 1px 0px #4c4c4c',
      margin: '5px 0px',
      padding: '4px 17px',
      borderRadius: '21px',
      fontSize: '14px',
      background: 'linear-gradient(0deg, #f5f5f5, white)',
      '&:hover':{
        boxShadow: '0px 3px 10px 0px #8c8c8c',
      }
    },
    plusIcon:{
      fontSize: '30px',
      color: '#ce6a00',
    },
    importIcon:{
      fontSize: '27px',
      color: '#2f82fc',
    },
    labelDiv:{
      textAlign: 'center',
    },  
    inputDiv:{
      display:'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '60%',
      marginLeft: '20%',
      marginTop: '5px',
      color: '#a55400'
    },
    dateRangeSpan:{
      fontSize: '13px',
      fontFamily: 'sans-serif',
      fontWeight:'600',
      color: '#666',
      textAlign: 'center'
    },
    inputSpan:{
      marginRight: '10px',
      fontSize: '13px',
      fontFamily: 'sans-serif',
    },
    inputField:{
      '& input':{
      backgroundColor: '#fff',
      padding: '5px 8px',
      width: '80px'
      }
    },
    inlineErrorText:{

    },
    warningDiv:{
      textAlign: 'center',
      color: '#e91818',
      margin: '3px 10px'
    }
  
}));