import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, FormControl, FormControlLabel, FormLabel, FormGroup, Checkbox, Button, Dialog, DialogActions,
         DialogContent, DialogTitle, Grid, TextField} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import Tasks from '../../../js/Tasks';
import Util from '../../../js/Util';
import { TaskContext } from '../TaskContainer';
import cogoToast from 'cogo-toast';

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    TimePicker,
    DateTimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';


const TaskListDateDialog = (props) => {
 
    //PROPS
    const { selectedTasks,setSelectedTasks} = props;
    const {taskLists, setTaskLists } = useContext(TaskContext);

    //STATE
    const [dateDialogOpen, setDateDialogOpen] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState(null);
    const [dateType, setDateType] = React.useState("install_date");

    const date_params = [{ field: 'sch_install_date', label: 'Install Date'},{ field: 'drill_date', label: 'Drill Date'},
    { field: 'date_desired', label: 'Date Desired'},{ field: 'delivery_date', label: 'Delivery Date'}];

    //CSS
    const classes = useStyles();

    //FUNCTIONS

    const handleOpenDateDialog = (event) => {
        setDateDialogOpen(true);   
    };

    const handleDateDialogClose = () => {
        setDateType(null);
        setDateDialogOpen(false);
    };

    const handleSetDateType = (value) =>{
        setDateType(value);
    }

    const handleChangeSelectedDate = (value)=>{
        if(!value){
            return;
            cogoToast.error("Bad Date");
            console.error("handleChangeSelectedDate recieved bad value");
        }
        setSelectedDate(value);
    }
  

    const handleUpdateDate = (event, date, date_type) =>{
        if(!date || !dateType){
            return;
        }
        const conv_date = Util.convertISODateToMySqlDate(date);


        Tasks.updateMultipleTaskDates(selectedTasks, conv_date, date_type)
                .then((reponse) => {
                    if(!reponse){
                        console.error("Bad response from updateMultipleTaskDates");
                    }
                    //refetch tasklists
                    setTaskLists(null);
                    handleDateDialogClose();
                    cogoToast.success(`Updated Multiple Dates`, {hideAfter: 4});
                })
                .catch( error => {
                    cogoToast.error(`Error updating dates`, {hideAfter: 4});
                    console.error(error);
            });
    };

    
    return(
        <React.Fragment>
            { selectedTasks && selectedTasks.length > 0 ?
                         <div className={classes.singleLineDiv}>
                            <span
                                className={classes.text_button} 
                                onClick={event => handleOpenDateDialog(event)}>
                                Set Date for Multiple
                            </span>
                         </div>
            :<></>}
            
            { dateDialogOpen && selectedTasks ? 
            
            <Dialog PaperProps={{className: classes.dialog}} open={handleOpenDateDialog} onClose={handleDateDialogClose}>
            <DialogTitle className={classes.title}>Set Date Type and Date</DialogTitle>
                <DialogContent className={classes.content}>

                    <Grid container className={classes.formGrid}>
                        <Grid item xs={6}>
                        <FormControl className={classes.inputField}>
                            <FormLabel component="legend">Type</FormLabel>
                            <FormGroup>
                                { date_params.map((param, i)=> {
                                    return (
                                        <FormControlLabel key={param.field + i} className={dateType == param.field ? classes.checkedType : classes.uncheckedType}
                                            control={<Checkbox key={'checkbox' + i}checked={dateType == param.field} onChange={event =>handleSetDateType(event.target.value)} 
                                                value={param.field} />}
                                                label={param.label}
                                        />
                                    );
                                })}
                            </FormGroup>
                        </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <div className={classes.inputField}>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}><DatePicker label="Date" className={classes.datePicker}  value={selectedDate} onChange={value => handleChangeSelectedDate(value)} /></MuiPickersUtilsProvider>
                            </div>
                        </Grid>
                    </Grid>

                    <DialogActions>
                        <Button onMouseDown={handleDateDialogClose} color="primary">
                            Cancel
                        </Button>
                        <Button
                            onMouseDown={event => handleUpdateDate(event, selectedDate, dateType)}
                            variant="contained"
                            color="secondary"
                            size="medium"
                            className={classes.saveButton} >
                            Save
                            </Button>
                    </DialogActions> 

            </DialogContent>
            </Dialog>
            :<></>}
        </React.Fragment>
      
    );

} 

export default TaskListDateDialog;

const useStyles = makeStyles(theme => ({
    root: {

    },
    dialog:{
        
    },
    title:{
        '&& .MuiTypography-root':{
            fontSize: '22px',
            color: '#fff',
        },
        
        backgroundColor: '#16233b',

    },
    formGrid:{
        alignItems: 'baseline',
    },
    content:{
        minWidth: '500px',
    },
    lightButton:{
        backgroundColor: '#b7c3cd',
        fontWeight: '600',
        "&& .MuiButton-startIcon":{
            margin: '0px 5px',
        }
    },
    openButton:{
        backgroundColor: '#fca437',
        color: '#fff',
        margin: '0px 30px',
        fontWeight: '700',
        fontSize: '13px',
        padding: '0px 16px',
        '&:hover':{
            border: '',
            backgroundColor: '#ffedc4',
            color: '#d87b04'
        }
    },
    inputField: {
        '&:active':{
            backgroundColor: '#dde8eb',
        },
        '&:hover':{
            backgroundColor: '#dde8eb',
        },
        margin: '10px 17px ',
        padding: '9px 5px',
        backgroundColor: '#dbdbdb85',
        borderRadius: '3px',
        display: 'block',
    },
    textField:{
        display: 'block',
        minWidth: '220px',
    },
    darkButton:{
        backgroundColor: '#fca437',
        color: '#fff',
        fontWeight: '600',
        border: '1px solid rgb(255, 237, 196)',
        fontSize: '9px',
        padding:'1%',
      '&:hover':{
        border: '',
        backgroundColor: '#ffedc4',
        color: '#d87b04'
      },
    },
    icon_small:{
        verticalAlign: 'text-bottom'
    },
    checkedType:{
        backgroundColor: '#ead78f',
        marginLeft: '0px',
        marginRight: '0px'
    },
    uncheckedType:{

    },
    text_button:{
        cursor: 'pointer',
        fontSize: '12px',
        color: '#677fb3',
        margin: '0% 3% 0% 0%',
        '&:hover':{
            color: '#697fb1',
            textDecoration: 'underline',
        }
    },
    
  }));
