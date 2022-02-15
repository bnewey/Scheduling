import React, {useRef, useState, useEffect, useContext, useCallback} from 'react';

import {makeStyles,Paper, Button, Dialog, DialogTitle, TextField, DialogContent, DialogActions} from '@material-ui/core';
import { useStaticState, ClockView, Calendar } from "@material-ui/pickers";

import cogoToast from 'cogo-toast';

import moment from 'moment';
import Tooltip from "react-tooltip";

import clsx from 'clsx';
import WorkOrders from '../../../../js/Work_Orders'
import TLCompletedAddNewJobQuery from './TLCompletedAddNewJobQuery';
import Check from '@material-ui/icons/Check';
import NoCheck from '@material-ui/icons/IndeterminateCheckBox';
import LocateIcon from '@material-ui/icons/MyLocation'
import DeveloperBoardIcon from '@material-ui/icons/DeveloperBoard';

import ReactTooltip from 'react-tooltip';

const TLDrillLocatedDatePicker = (props) => {
 
    //PROPS
    const { type, viewOnly, located, ...other} = props;

    // you can past mostly all available props, like minDate, maxDate, autoOk and so on
    const { pickerProps, wrapperProps, inputProps } = useStaticState({
        // value,
         //onChange: handleDateChange,
        ...other
    });

    //STATE
    const [inputValue,setInputValue] = React.useState(props.value);
    const [completeDialogOpen,setCompleteDialogOpen] = React.useState(false);


    //CSS
    const classes = useStyles();

    const handleTodayClick = () =>{
        //wrapperProps.onSetToday();
        props.onChange(moment().endOf('day').format('YYYY-MM-DD hh:mm:ss'))
    }


    const handleOnMonthChange = (date, num)=>{
        //num: 1 == left calendar | 2 == right calendar
        return new Promise((resolve, reject)=>{

            if(num ==1){ // left only
                setInputValue(moment(date).format('MM-DD-YYYY'))
            }
            if(num ==2){ //right only
                setInputValue(moment(date).subtract(1, "M").format('MM-DD-YYYY'))
            }
            resolve(date);
        })
    }

    const handleRenderDayForCalendar =  (day, selectedDate, dayInCurrentMonth, dayComponent, realValue) => {
        
        let selected = moment(realValue).isSame(day,'day') ; 
        let matchToday = moment().isSame(day, 'day');

        //Hides the numbers if the date is outside of the month (the numbers are disabled otherwise id leave them)
        if(!dayInCurrentMonth){
            return <><button className={clsx( classes.pickerDay, classes.pickerIconButton, classes.pickerButtonBase, { [classes.pickerDaySet]: selected })} disabled tabindex="0" type="button">
            <span class="MuiIconButton-label"><p class="MuiTypography-root MuiTypography-body2 MuiTypography-colorInherit"></p></span>
            <span class="MuiTouchRipple-root"></span>
        </button></>
        }

       return   <div className={clsx({[classes.todayDayComponent]: matchToday })}>
                    <button data-tip={clsx(
                                { ["Job Date"]: selected,
                                  ["(Today)"]: matchToday
                                 }
                            )} 
                            className={clsx( classes.pickerDay, classes.pickerIconButton, classes.pickerButtonBase,
                                           { /*[classes.pickerDaySelected]: selected && !futureMonth, */
                                            [classes.pickerDaySet]: selected ,
                                            [classes.dateInRange]: moment(day).isBetween(moment(new Date()).startOf('day'),moment(located).endOf('day') )
                                            })}
                            tabindex="0" type="button">
                        <span class="MuiIconButton-label">
                            <p class="MuiTypography-root MuiTypography-body2 MuiTypography-colorInherit">{moment(day).date()}</p>
                        </span>
                        <span class="MuiTouchRipple-root"></span>
                    </button>
                </div>
        
        
    }

    const getTextFieldValue = (value) =>{
        if(located){
            if(moment(located).diff(moment(new Date()).endOf('day'), 'days') < 0){
                return `RELOCATE (${moment(located).diff(moment(new Date()).endOf('day'), 'days')} Days)`
            }
            return `${moment(value).format('MMM DD')} (${moment(located).diff(moment(new Date()).endOf('day'), 'days')} Days)`
        }
        return value ? moment(value).format('MM-DD-YYYY') : "";
    }

    return(
        <div className={classes.root} >
            <div className={classes.inputRootDiv}>
                
                {viewOnly ? <div className={classes.viewOnlyDiv}><span className={classes.viewOnlySpan}>{getTextFieldValue(props.value)}</span></div>
                    : <TextField {...inputProps} onClick={inputProps.openPicker} value={ getTextFieldValue(props.value) } className={classes.input} variant="outlined" /> }
        
                
            </div>
            { !viewOnly && <Dialog {...wrapperProps}  maxWidth="md">
                <DialogTitle id="customized-dialog-title" onClose={wrapperProps.onDismiss} className={classes.dialogTitle}>
                    {props.title ? props.title : "Select Date"}
                </DialogTitle>
                <DialogContent className={classes.dialog} >
                <div className={classes.calendarContainer}>
                    <div className={classes.calendarDiv}>
                        <Calendar {...pickerProps} onMonthChange={(date)=>handleOnMonthChange(date, 1)}  showDaysOutsideCurrentMonth={true} date={ (()=>{  return inputValue  ? new Date(inputValue) : new Date() })()} renderDay={(day, selectedDate, dayInCurrentMonth, dayComponent)=>handleRenderDayForCalendar(day, selectedDate, dayInCurrentMonth, dayComponent, props.value)}
                          rightArrowButtonProps={{disableRipple: true,disabled: true, style: {color: '#fff', visibility: 'hidden'}}}/>
                    </div>
                    <div className={classes.calendarDiv}>
                        <Calendar {...pickerProps} onMonthChange={(date)=>handleOnMonthChange(date,2)}  date={ (()=>{  return inputValue  ? new Date(moment(inputValue).add(1, 'M')) : new Date(moment().add(1, 'M')) })()} 
                        renderDay={(day, selectedDate, dayInCurrentMonth, dayComponent)=>handleRenderDayForCalendar(day, selectedDate, dayInCurrentMonth, dayComponent, props.value)} disableHighlightToday={true} showDaysOutsideCurrentMonth={true}
                        leftArrowButtonProps={{disableRipple: true,disabled: true, style: {color: '#fff', visibility: 'hidden'}}}/>
                    </div>
                </div>
                <DialogActions>
                <div className={classes.buttonDiv}>
                    <Button className={classes.button} data-tip="Set Date to today" data-place={'bottom'} fullWidth onClick={handleTodayClick}>
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
            }
            <TLCompletedAddNewJobQuery open={completeDialogOpen} handleCloseFunction={()=> { setCompleteDialogOpen(false) }} completeFunction={props.onCompleteTasks}/>
        </div>
    );

} 
export default TLDrillLocatedDatePicker;

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
            backgroundColor: '#e9f1ff',
            padding: '0px 5px',
            fontSize: 13,
        }
        
    },
    buttonDiv:{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        '& span':{
            whiteSpace: 'nowrap',
        }
    },
    calendarContainer:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    calendarDiv:{
        margin: '0px 10px',
        padding: '0px 10px',
        boxShadow: '-1px 2px 8px -1px rgb(161 161 161)',
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
    },
    pickerIconButton:{
        flex: '0 0 auto',
        color: 'rgba(0, 0, 0, 0.54)',
        padding: 12,
        overflow: 'visible',
        fontSize: '1.1785714285714286rem',
        textAlign: 'center',
        transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        borderRadius: '50%',
        '&:hover':{
            backgroundColor: 'rgba(0, 0, 0, 0.10)',
            //borderRadius: '50%',
        }
    },
    pickerButtonBase:{
        color: 'inherit',
        border: 0,
        cursor: 'pointer',
        margin: 0,
        display: 'inline-flex',
        outline: 0,
        padding: 0,
        position: 'relative',
        alignItems: 'center',
        userSelect: 'none',
        borderRadius: 0,
        verticalAlign: 'middle',
        MozAppearance: 'none',
        justifyContent: 'center',
        textDecoration: 'none',
        backgroundColor: 'transparent',
        WebkitAppearance: 'none',
        WebkitTapHighlightColor: 'transparent',
    },
    pickerDay:{
        color: 'rgba(0, 0, 0, 0.87)',
        width: 36,
        height: 36,
        margin: '0 2px',
        padding: 0,
        fontSize: '0.5892857142857143rem',
        fontWeight: 500,
    },
    pickerDaySelected:{
        background: '#14523b',
        color: '#fff',
        borderRadius: '50%',
        '&:hover':{
            color: '#000',
            backgroundColor: 'rgba(0, 0, 0, 0.80)',
        }
    },
    pickerDaySet:{
        background: '#3d8b6e',
        color: '#fff',
        borderRadius: '50%',
        '&:hover':{
            color: '#000',
            backgroundColor: 'rgba(0, 0, 0, 0.80)',
        }
    },
    pickerDaySetArrived:{
        backgroundColor: 'rgba(0, 0, 0, 0.80)',
    },
    dateInRange:{
        background: '#3d8b6e',
        color: '#fff',
        borderRadius: '50%',
        '&:hover':{
            color: '#000',
            backgroundColor: 'rgba(0, 0, 0, 0.80)',
        }
    },
    inputRootDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    small_icon:{
        color: '#fff',
        background: '#05c417',
        width: '.7em',
        height: '.7em',
    },
    locate_icon:{
        color: '#0061fc',
        width: '.7em',
        height: '.7em',
    },
    locate_icon_gray:{
        color: '#999',
        width: '.7em',
        height: '.7em',
    },
    diagram_icon:{
        color: '#6431f6',
        width: '.7em',
        height: '.7em',
    },
    diagram_icon_gray:{
        color: '#999',
        width: '.7em',
        height: '.7em',
    },
    small_icon_gray:{
        color: '#fff',
        background: '#999',
        width: '.7em',
        height: '.7em',
    },
    small_icon_inverse:{
        background: '#fff',
        color: '#05c417',
        width: '1em',
        height: '1em',
        marginRight: '-5px',
    },
    locatedDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems:'center',
    },
    viewOnlyDiv:{
        display: 'flex',
        flexDirection: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0px 5%',
    },
    viewOnlySpan:{
        fontFamily: 'arial',
        fontWeight: '500',
        fontSize: '1.3em !important',

    }

  }));