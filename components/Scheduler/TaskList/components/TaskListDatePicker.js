import React, {useRef, useState, useEffect, useContext, useCallback} from 'react';

import {makeStyles,Paper, Button, Dialog, DialogTitle, TextField, DialogContent, DialogActions} from '@material-ui/core';
import { useStaticState, ClockView, Calendar } from "@material-ui/pickers";

import cogoToast from 'cogo-toast';

import moment from 'moment';
import WorkOrders from '../../../../js/Work_Orders'


const TaskListDatePicker = (props) => {
 
    //PROPS
    const { ...other} = props;

    // you can past mostly all available props, like minDate, maxDate, autoOk and so on
    const { pickerProps, wrapperProps, inputProps } = useStaticState({
        // value,
        // onChange: handleDateChange,
        ...other
    });

    //STATE
    console.log("other",{ ...other})
    console.log("PickerProps", pickerProps);
    console.log("WrapperProps", wrapperProps);
    console.log("inputProps", inputProps);

    //CSS
    const classes = useStyles();

    const handleTodayClick = () =>{
        //wrapperProps.onSetToday();
        props.onChange(moment().format('YYYY-MM-DD hh:mm:ss'))
    }

    const handleCompleteTask = ()=>{
        if(props.onCompleteTasks){
            props.onCompleteTasks();
        }
        wrapperProps.onDismiss();
    }

    const handleRenderDayForCalendar =  (day, selectedDate, dayInCurrentMonth, dayComponent) => {

        if(!moment().isSame(day, 'day')){
            return dayComponent
        }else{
            return getTodayStyledDayComponent(dayComponent)
        }
        
    }

    const getTodayStyledDayComponent = (dayComponent) =>{
        if(!dayComponent){
            console.error("Bad dayComponent in getTodayStyledDayComponent")
            return;
        }

        return <div className={classes.todayDayComponent}>{dayComponent}</div>

        
    }


    return(
        <div className={classes.root}>
            <TextField {...inputProps} onClick={inputProps.openPicker} value={ props.value ? moment(props.value).format('MM-DD-YYYY') : null} className={classes.input} variant="outlined" />
            <Dialog {...wrapperProps} >
                <DialogTitle id="customized-dialog-title" onClose={wrapperProps.onDismiss} className={classes.dialogTitle}>
                    {props.title ? props.title : "Select Date"}
                </DialogTitle>
                <DialogContent className={classes.dialog} >
                <Calendar {...pickerProps} renderDay={handleRenderDayForCalendar}/>
                <DialogActions>
                <div className={classes.buttonDiv}>
                    <Button className={classes.button} fullWidth onClick={handleCompleteTask}>
                        Complete
                    </Button>
                    <Button className={classes.button} fullWidth onClick={handleTodayClick}>
                        Today
                    </Button>
                    <Button className={classes.button} fullWidth onClick={wrapperProps.onClear}>
                        Clear
                    </Button>
                    <Button className={classes.button} fullWidth onClick={wrapperProps.onDismiss}>
                        Cancel
                    </Button>
                </div>
                </DialogActions>
                </DialogContent>
            </Dialog>
        </div>
    );

} 
export default TaskListDatePicker;

const useStyles = makeStyles(theme => ({
    root: {

    },
    dialog:{
        padding: '4px',
    },
    dialogTitle:{
        background: '#222b3f',
        color: '#fff',
    },
    input:{
        '& input':{
            textAlign: 'center',
            cursor: 'pointer',
            padding: '1px 0px 0px 0px',
            backgroundColor: '#f5fdff',
            padding: '0px 5px',
        }
        
    },
    buttonDiv:{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    button:{
        flexBasis: '25%',
        background: '#fff',
        borderTop: '1px solid #bbb',
        borderRadius: 0,
        fontFamily: 'sans-serif',
        color: '#001652',
        '&:hover':{
            color: '#0016ff',
            background: 'linear-gradient(#f3f3f3, #c9ced5)',
        }
    },
    todayDayComponent:{
        background: '#ff77228c',
    }

  }));
