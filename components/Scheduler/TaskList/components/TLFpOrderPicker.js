import React, {useRef, useState, useEffect, useContext, useCallback} from 'react';

import {makeStyles,Paper, Button, Dialog, DialogTitle, TextField, DialogContent, DialogActions,Checkbox} from '@material-ui/core';
import { useStaticState, ClockView, Calendar } from "@material-ui/pickers";

import cogoToast from 'cogo-toast';

import moment from 'moment';
import Tasks from '../../../../js/Tasks'
import CircularProgress from '@material-ui/core/CircularProgress';
import ReactTooltip from 'react-tooltip';
import clsx from 'clsx';


const TLFpOrderPicker = (props) => {
 
    //PROPS
    const { task, viewOnly, setTaskListTasksRefetch, user } = props;

    //STATE
    const [inputValue,setInputValue] = React.useState(null);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const textFieldRef = React.useRef();

    //CSS
    const classes = useStyles();

    const handleOpenPicker = ()=>{
        setDialogOpen(true);
        setInputValue(task.fp_order_number || '');
        if( textFieldRef?.current){
            textFieldRef.current.focus();
         }
    }

    const handleCloseDialog =  () =>{
        setDialogOpen(false);
        setInputValue(null);
    }

    const handleChangeInput = (event)=>{
        //refreshRef.current = Math.random();
        console.log("event.target.value",event.target.value)
        setInputValue( event.target.value);
    }

    const handleSave = () =>{
        if(!inputValue || !task){
            cogoToast.error("Failed to save FP order number");
            console.error("Bad iputvalue or task in handelSave");
        }

        Tasks.updateFpOrderNumber(inputValue, task.t_id, user)
        .then((data)=>{
            setTaskListTasksRefetch(true);
            handleCloseDialog();
        })
        .catch((error)=>{
            console.warn(error);
            cogoToast.error(`Error updating fpordernum`, {hideAfter: 4});
        })
        


    }

    const handleClearFPOrder = ()=>{
        if( !task){
            cogoToast.error("Failed to save FP order number");
            console.error("Bad iputvalue or task in handelSave");
        }

        Tasks.updateFpOrderNumber('', task.t_id, user)
        .then((data)=>{
            setTaskListTasksRefetch(true);
            handleCloseDialog();
        })
        .catch((error)=>{
            console.warn(error);
            cogoToast.error(`Error updating fpordernum`, {hideAfter: 4});
        })
    }


    if(!task){
        return <></>
    }

    return(
        <div className={classes.root}>
            {viewOnly ? <div className={classes.viewOnlyDiv}><span className={classes.viewOnlySpan}>{task.fp_order_number}</span></div>
            :

            <TextField inputVariant="outlined" onClick={handleOpenPicker} value={  task.fp_order_number } className={classes.input} variant="outlined" />}
            { !viewOnly && <Dialog  open={dialogOpen}  PaperProps={{className: classes.dialog}} >
                <ReactTooltip effect={"solid"} delayShow={500}/>
                <DialogTitle id="customized-dialog-title" onClose={handleCloseDialog} className={classes.dialogTitle}>
                    Update FP Order #
                </DialogTitle>
                <DialogContent className={classes.content}>

                    <div className={classes.body}>
                            <input id={`fp_order_update`} 
                                    ref={textFieldRef}
                                    autocomplete="off"
                                   variant="outlined"
                                   key={'testkey'}
                                   value={inputValue}
                                   autoFocus
                                   disableAutoFocus={true}
                                   className={classes.inputRoot }
                                   onChange={(event)=>handleChangeInput(event)}  
                                   />
                    </div>
                <DialogActions>
                <div className={classes.buttonDiv}>
                    <Button className={classes.button} fullWidth onClick={handleSave} data-tip="Save fp order number" data-place={'bottom'}>
                        Save
                    </Button>
                    <Button className={classes.button} fullWidth onClick={handleClearFPOrder} data-tip="Clear selected dates" data-place={'bottom'}>
                        Clear
                    </Button>
                    <Button className={classes.button} fullWidth onClick={handleCloseDialog}>
                        Cancel
                    </Button>
                </div>
                </DialogActions>
                </DialogContent>
            </Dialog>}
        </div>
    );

} 
export default TLFpOrderPicker;

const useStyles = makeStyles(theme => ({
    root: {

    },
    dialog:{
        padding: '4px',
    },
    content:{
        padding: 5,
        minHeight: '180',
        minWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    body:{
        padding: 5,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialogTitle:{
        padding: '10px 15px 10px 15px',
        background: '#222b3f',
        color: '#fff',
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
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '70%',
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

    },
    dialog:{
        maxWidth:'800px',
        minWidth: 400,
    },
    inputRoot:{
        margin: '10px 5px',
        
            padding: '10px 7px',
            fontSize: '1.5em',
            height: '1.8em',
            width: '350px',
        
        
    },
    

  }));
