import React, {useRef, useState, useEffect, useContext, useCallback} from 'react';

import {makeStyles,Paper, Button, Dialog, DialogTitle, TextField, DialogContent, DialogActions,Select} from '@material-ui/core';
import { useStaticState, ClockView, Calendar } from "@material-ui/pickers";

import cogoToast from 'cogo-toast';

import moment from 'moment';
import ReactTooltip from 'react-tooltip';
import clsx from 'clsx';
import WorkOrders from '../../../../js/Work_Orders'


const TLCompletedAddNewJobQuery = (props) => {
 
    //PROPS
    const {open, handleCloseFunction, completeFunction} = props;

    const types = [
        { type: 'Install'},
        { type: 'Install (Drill)'},
        { type: 'Delivery'},
        { type: 'Parts (Mfg.)'},
        { type: 'Parts (Service)'},
        { type: 'Field'},
        { type: 'Loaner'},
        { type: 'Shipment'},
        { type: 'Bench'},
        { type: 'Pickup'},
    ]
        

    //STATE
    const [sendToType, setSendToType] = useState(null);

    const handleCompleteTask = ()=>{

        if(completeFunction){
            completeFunction(sendToType);
        }else{
            cogoToast.error("Not able to complete");
        }
    }
    
    const handleClose =()=>{
        if(completeFunction){
            completeFunction(null);
        }else{
            cogoToast.error("Not able to complete");
        }
        if(handleCloseFunction){
            handleCloseFunction();
        }else{
            cogoToast.error("Failed to close");
        }
    }
    //CSS
    const classes = useStyles();

    const handleChangeSelectType = (value)=>{
        setSendToType(value);
    }


    return(
        <div className={classes.root}>
            <Dialog open={open}  maxWidth="md">
                <DialogTitle id="customized-dialog-title" onClose={handleClose} className={classes.dialogTitle}>
                    {props.title ? props.title : "Send task elsewhere?"}
                </DialogTitle>
                <DialogContent className={classes.dialog} >
                <div className={classes.calendarContainer}>
                    <Select
                        id={`completed_select_type`}
                        value={sendToType || 0}
                        inputProps={{classes:  classes.inputSelect}}
                        onChange={value => handleChangeSelectType(value.target.value)}
                        native
                    >
                        <option value={0}>
                            Select New Type
                        </option>
                        {types && types.map((item)=>{
                            return (
                                <option value={item.type}>
                                    {item.type}
                                </option>
                            )
                        })}
                    </Select>
                </div>
                <DialogActions>
                <div className={classes.buttonDiv}>
                    <Button className={classes.button} disabled={sendToType == null || sendToType == 0} fullWidth onClick={handleCompleteTask}>
                        Send
                    </Button>
                    <Button className={classes.button} fullWidth onClick={handleClose}>
                        No
                    </Button>
                </div>
                </DialogActions>
                </DialogContent>
            </Dialog>
        </div>
    );

} 
export default TLCompletedAddNewJobQuery;

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
            fontSize: 13,
        }
        
    },
    buttonDiv:{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    inputSelect:{
        width: '100%',
        whiteSpace: 'nowrap',
      overflow: 'hidden',
      maxWidth: '250px',
      textOverflow: 'ellipsis',
      },

  }));
