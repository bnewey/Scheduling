import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, FormControl, FormControlLabel, FormLabel, FormGroup, Checkbox, Button, Dialog, DialogActions,
         DialogContent, DialogTitle, Grid, TextField} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DateRangeIcon from '@material-ui/icons/DateRange';

import Tasks from '../../../js/Tasks';
import Util from '../../../js/Util';
import { TaskContext } from '../TaskContainer';
import { CrewContext} from '../Crew/CrewContextContainer';
import cogoToast from 'cogo-toast';

import Timeline from 'react-calendar-timeline'
import moment from 'moment'

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    TimePicker,
    DateTimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';


const TaskListDateDialog = (props) => {
 
    //PROPS
    const { selectedTasks,setSelectedTasks, parentClasses} = props;
    const {taskLists, setTaskLists, taskListTasksSaved, setTaskListTasksSaved } = useContext(TaskContext);
    const {setShouldResetCrewState, crewMembers, setCrewMembers, crewModalOpen, setCrewModalOpen, allCrewJobs, 
        allCrewJobMembers, setAllCrewJobMembers, setAllCrewJobs, memberJobs,setMemberJobs, allCrews, setAllCrews} = useContext(CrewContext);

    //STATE
    const [dateDialogOpen, setDateDialogOpen] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState(null);
    const [dateType, setDateType] = React.useState("install");

    const date_params = [{ field: 'install', label: 'Install Date'},{ field: 'drill', label: 'Drill Date'}];

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
            cogoToast.error("Bad Date");
            console.error("handleChangeSelectedDate recieved bad value");
            return;
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
                    setSelectedTasks([]);

                    cogoToast.success(`Updated Multiple Dates`, {hideAfter: 4});
                })
                .catch( error => {
                    cogoToast.error(`Error updating dates`, {hideAfter: 4});
                    console.error(error);
            });
    };

    
    const groups = allCrews ? [...allCrews.map((crew, i)=>(
        {
            id: crew.id,
            title: crew.crew_leader_name ? crew.crew_leader_name : 'Crew '+crew.id,
            stackItems: true,
        }
    )), {id: 0, title: "No Crew",stackItems: true,} ] : [];

  
    const items = taskListTasksSaved ? taskListTasksSaved.flatMap((task,i)=>{
        var task_array = [];
        if(task.drill_crew != null){
            task_array.push({
                id: Number.parseInt(task.t_id.toString() + '1'),
                group: task.drill_crew,
                title: task.t_name,
                start_time: new Date(task.drill_date).getTime() ,
                end_time: new Date(task.drill_date).getTime() + 86400000,
            })
        }
        if(task.install_crew != null){
            task_array.push({
                id: Number.parseInt(task.t_id.toString() + '2'),
                group: task.install_crew,
                title: task.t_name,
                start_time: new Date(task.sch_install_date).getTime() ,
                end_time: new Date(task.sch_install_date).getTime()  + 86400000,
            })
        }
        //Neither and install date
        if(task.drill_crew== null && task.install_crew== null && task.sch_install_date){
            task_array.push({
                id: Number.parseInt(task.t_id.toString() + '3'),
                group: 0,
                title: task.t_name,
                start_time: new Date(task.sch_install_date).getTime() ,
                end_time: new Date(task.sch_install_date).getTime()  + 86400000,
            })
        }
        //Neither and drill date
        if(task.drill_crew== null && task.install_crew== null && task.drill_date){
            task_array.push({
                id: Number.parseInt(task.t_id.toString() + '4'),
                group: 0,
                title: task.t_name,
                start_time: new Date(task.drill_date).getTime() ,
                end_time: new Date(task.drill_date).getTime()  + 86400000,
            })
        }
        return (task_array)
    }) : [];
    console.log("Items", items);

    
    return(
        <React.Fragment>
            { selectedTasks && selectedTasks.length > 0 ?
                         <div className={parentClasses.singleLineDiv}>
                             <div className={parentClasses.singleItem}>
                             <DateRangeIcon className={parentClasses.icon} />
                            <span
                                className={parentClasses.text_button} 
                                onClick={event => handleOpenDateDialog(event)}>
                                Set Date for Multiple
                            </span>
                            </div>
                         </div>
            :<></>}
            
            { dateDialogOpen && selectedTasks ?
            <Dialog PaperProps={{className: classes.dialog}} open={handleOpenDateDialog} onClose={handleDateDialogClose}>
            <DialogTitle className={classes.title}>Set Date Type and Date</DialogTitle>
                <DialogContent className={classes.content}>
                    <Grid container className={classes.formGrid}>
                        <Grid item xs={12}>
                            <div>
                            <Timeline
                                groups={groups}
                                items={items}
                                sidebarWidth={100}
                                defaultTimeStart={moment().add(-3, 'day')}
                                defaultTimeEnd={moment().add(14, 'day')}
                               
                                lineHeight={25}
                                itemHeightRatio={.80}
                                canMove={false}
                                canResize={false}
                                canChangeGroup={false}
                                minZoom={24*60 * 60 * 1000}
                                traditionalZoom={true}
                                timeSteps={{
                                    second: 0,
                                    minute: 0,
                                    hour: 24,
                                    day: 1,
                                    month: 1,
                                    year: 1
                                  }}
                            />
                            </div>
                        </Grid>
                    </Grid>

                    <Grid container xs={5} className={classes.formGrid}>
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
                                <MuiPickersUtilsProvider utils={DateFnsUtils}><DatePicker label="Date" showTodayButton clearable format="MM/dd/yyyy" className={classes.datePicker} value={selectedDate} onChange={value => handleChangeSelectedDate(value)} /></MuiPickersUtilsProvider>
                            </div>
                        </Grid>
                    </Grid>

                    <DialogActions>
                        <Button onMouseUp={handleDateDialogClose} color="primary">
                            Cancel
                        </Button>
                        <Button
                            onMouseUp={event => handleUpdateDate(event, selectedDate, dateType)}
                            variant="contained"
                            color="secondary"
                            size="medium"
                            className={classes.saveButton}>
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
        maxWidth: '75%'
    },
    title:{
        '&& .MuiTypography-root':{
            fontSize: '16px',
            color: '#fff',
        },
        backgroundColor: '#16233b',
        padding: '7px 15px',
    },
    formGrid:{
        alignItems: 'baseline',
        padding: '20px'
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

    
    
  }));
