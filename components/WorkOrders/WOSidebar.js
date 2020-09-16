import React, {useRef, useState, useEffect, createContext,useContext } from 'react';
import {makeStyles, CircularProgress, Grid, Typography, Button} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import cogoToast from 'cogo-toast';

import Util from  '../../js/Util';
import { WOContext } from './WOContainer';

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    TimePicker,
    DateTimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';


const OrdersSidebar = function(props) {
  const {user} = props;



  const { workOrders,setWorkOrders, rowDateRange, setDateRowRange} = useContext(WOContext);
  
  const classes = useStyles();
  
  
  const changeDateRange = (to, from) =>{
    setDateRowRange({
      to: to ? new Date(to) : rowDateRange.to,
      from: from ? new Date(from) : rowDateRange.from
    })
    setWorkOrders(null);
  }

  
  return (
    <div className={classes.root}>
        <div ><Button className={classes.newButton} classes={{label: classes.newButtonLabel}} variant="outlined"><AddIcon className={classes.plusIcon}/><div>New Order</div></Button></div>
        <div>
        <Typography className={classes.inlineHeadText}>Date Range</Typography>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker    format="MM/dd/yyyy"
                                variant="inline"
                                className={classes.inputField}
                                value={rowDateRange.from} 
                                onChange={value => changeDateRange(null, value)} />
            </MuiPickersUtilsProvider> 
            <Typography className={classes.inlineHeadText}>&nbsp;to&nbsp;</Typography>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker    format="MM/dd/yyyy"
                                variant="inline"
                                className={classes.inputField}
                                value={rowDateRange.to} 
                                onChange={value => changeDateRange(value, null)} />
            </MuiPickersUtilsProvider>{workOrders && workOrders.length >= 2000 ? <Typography className={classes.inlineErrorText}>The data has been limited to 2000 items, please select a smaller date range</Typography> : <></>}
        </div>
    </div>
  );
}

export default OrdersSidebar

const useStyles = makeStyles(theme => ({
    root:{
      // border: '1px solid #993333',
      padding: '1%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '4%',
      minHeight: '600px',
      borderRight: '1px solid #d2cece',
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
      background: 'linear-gradient(0deg, #efefef, white)',
      '&:hover':{
        boxShadow: '0px 2px 1px 0px #4c4c4c',
      }
    },
    plusIcon:{
      fontSize: '30px',
      color: '#ce6a00',
    }
  
}));