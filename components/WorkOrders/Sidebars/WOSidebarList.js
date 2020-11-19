import React, {useRef, useState, useEffect, createContext,useContext } from 'react';
import {makeStyles, CircularProgress, Grid, Typography, Button} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import cogoToast from 'cogo-toast';

import Util from  '../../../js/Util';
import { ListContext } from '../WOContainer';

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    TimePicker,
    DateTimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';
import RecentWO from './components/RecentWO';
import FilterCompInv from './components/FilterCompInv';

const WOSidebarList = function(props) {
  const {user} = props;



  const { workOrders,setWorkOrders, rowDateRange, setDateRowRange, currentView, setCurrentView, 
      editWOModalOpen, setEditWOModalOpen, setEditModalMode} = useContext(ListContext);
  
  const classes = useStyles();
 
  
  const changeDateRange = (to, from) =>{
    setDateRowRange({
      to: to ? new Date(to) : rowDateRange.to,
      from: from ? new Date(from) : rowDateRange.from
    })
    setWorkOrders(null);
  }

  const searchOpen = currentView && currentView.value == "search";

  const handleOpenAddWOModal = () =>{
    setEditModalMode("add");
    setEditWOModalOpen(true);
  }
  
  return (
    <div className={classes.root}>
        <div className={classes.newButtonDiv} >
            <Button className={classes.newButton} 
                    classes={{label: classes.newButtonLabel}} 
                    variant="outlined"
                    onClick={event=> handleOpenAddWOModal()}>
              <AddIcon className={classes.plusIcon}/>
              <div>New Order</div>
            </Button>
        </div>
        <div className={classes.dateRangeDiv}>
        { !searchOpen && <div>
            <div className={classes.labelDiv}><span className={classes.dateRangeSpan}>Date Range</span></div>
            <div className={classes.inputDiv}>
              <span className={classes.inputSpan}>FROM:</span>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <DatePicker    format="MM/dd/yyyy"
                                  clearable
                                  showTodayButton
                                  inputVariant="outlined"
                                  variant="modal" 
                                  maxDate={new Date('01-01-2100')}
                                  minDate={new Date('01-01-1970')}
                                  className={classes.inputField}
                                  value={rowDateRange.from} 
                                  onChange={value => changeDateRange(null, value)} />
              </MuiPickersUtilsProvider>
            </div>
            <div className={classes.inputDiv}>
              <span className={classes.inputSpan}>TO:</span>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker    format="MM/dd/yyyy"
                                clearable
                                showTodayButton
                                inputVariant="outlined"
                                variant="modal" 
                                maxDate={new Date('01-01-2100')}
                                  minDate={new Date('01-01-1970')}
                                className={classes.inputField}
                                value={rowDateRange.to} 
                                onChange={value => changeDateRange(value, null)} />
            </MuiPickersUtilsProvider>
            </div>
            <div className={classes.warningDiv}>
            {workOrders && workOrders.length >= 2000 ? <span className={classes.inlineErrorText}>The data has been limited to 2000 items, please select a smaller date range</span> : <></>}
            </div>

            
        </div>}
          { !searchOpen && 
            <div>
                <FilterCompInv/>
            </div>
          }
        </div>
          <div className={classes.dateRangeDiv}>
            
            <RecentWO />
          </div>
    </div>
  );
}

export default WOSidebarList

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
      alignItems: 'flex-end',
      color: '#5f5f5f',
      fontWeight: 600,
    },
    newButton:{
      boxShadow: '0px 1px 1px 0px #4c4c4c',
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