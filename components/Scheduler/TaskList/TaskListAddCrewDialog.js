import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, FormControl, FormControlLabel, FormLabel, FormGroup, Checkbox, Button, Dialog, DialogActions,
         DialogContent, DialogTitle, Grid, TextField} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import Crew from '../../../js/Crew';
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
import { CrewContext } from '../Crew/CrewContextContainer';


const TaskListAddCrewDialog = (props) => {
 
    //PROPS
    const { selectedTasks,setSelectedTasks, taskListTasks, setTaskListTasks} = props;
    const { taskLists, setTaskLists, taskListTasksSaved } = useContext(TaskContext);
    const { allCrews, crewMembers, setShouldResetCrewState } = useContext(CrewContext);

    //STATE
    const [crewDialogOpen, setCrewDialogOpen] = React.useState(false);
    const [selectedType, setSelectedType] = React.useState(null);
    const [selectedCrew, setSelectedCrew] = React.useState(-1);
    const [selectedCrewLeader, setSelectedCrewLeader] = React.useState(-1);


    //CSS
    const classes = useStyles();

    //FUNCTIONS

    const handleOpenCrewDialog = (event) => {
        setCrewDialogOpen(true);   
        setSelectedCrew(-1);
        setSelectedCrewLeader(-1);
        setSelectedType(-1);
    };

    const handleCrewDialogClose = () => {
        setSelectedCrew(-1);
        setSelectedCrewLeader(-1);
        setSelectedType(-1);
        setCrewDialogOpen(false);
    };


    const handleSelectExistingChange = (event)=>{
        if(isNaN(event.target.value)){
            cogoToast.error("Bad Crew");
            console.error("handleSelectExistingChange recieved bad value");
            return;
        }
        console.log("value crew", event.target.value);
        setSelectedCrew(event.target.value);
    }

    const handleSelectLeaderChange = (event)=>{
        if(isNaN(event.target.value)){
            cogoToast.error("Bad Leader");
            console.error("handleSelectLeaderChange recieved bad value");
            return;
        }
        console.log("value leader", event.target.value);
        setSelectedCrewLeader(event.target.value);
    }

    const handleSelectTypeChange = (event)=>{
        if( typeof event.target.value != "string"){
            cogoToast.error("Bad Type");
            console.error("handleSelectTypeChange recieved bad value");
            return;
        }
        console.log("value type", event.target.value);
        setSelectedType(event.target.value);
    }
  

    const handleAddOrCreateCrew = (event, type, crew_id, crew_leader_id) =>{
        if(isNaN(crew_id) || isNaN(crew_leader_id) || !type){
            console.error("Bad crew_id or leader_id or type");
            cogoToast.error("Internal Server Error");
        }
        if(!selectedTasks){
            console.error("No selected tasks to add");
            cogoToast.warn("No Selected Tasks to add");
        }
        if(type == ""){
            cogoToast.warn("Please Choose a Crew Type, Drill or Install");
            return;
        }
        //Check if job with type already exists
        //Update to new value or cancel
        // let alreadyExistingTasks = selectedTasks.map((sel_task, i)=>(  {... taskListTasksSaved.filter((t)=>(t.t_id == sel_task))[0] }   ))
        //         .filter((check)=> type == "install" ? (check.install_crew ? true : false) : (check.drill_crew ? true : false)  );

        // console.log("AlreadyExisting" , alreadyExistingTasks);

        // confirmAlert({
        //     customUI: ({onClose}) => {
        //         return(
        //             <ConfirmYesNo onYes={deleteCrew} onClose={onClose} customMessage={"Delete Crew permanently?"}/>
        //         );
        //     }
        // })


        //Create and Add
        if(crew_id == -1){
            //Add Crew + return id
            Crew.addNewCrew()
            .then((data)=>{
                if(!isNaN(data)){
                    var id = data;
                    //Add Jobs
                    Crew.addCrewJobs(selectedTasks, type, id)
                    .then((response)=>{
                        if(response){
                            cogoToast.success("Created and added to crew");
                        }
                    })
                    .catch((err)=>{
                        console.error("Failed to add to creww", err);
                    })

                    //Add leader and Set as Leader if necessary - this updates crew as well
                    if(crew_leader_id != -1){
                        Crew.addNewCrewJobMember(crew_leader_id, id , /* is_leader= */ 1 )
                        .then((response)=>{
                            if(response){
                                cogoToast.success("Set leader of new crew");
                            }
                        })
                        .catch((err)=>{
                            console.error("Failed to set leader of new crew", err);
                        })
                    }
                }
            })
            .catch((error)=>{
                console.error("handleAddOrCreateCrew", error);
                cogoToast.error("Failed to Create and Add to Crew");
            })
            
            handleCrewDialogClose();
            setTaskListTasks(null);
            setShouldResetCrewState(true);
            return;
        }

        //Just Add
        Crew.addCrewJobs(selectedTasks, type, crew_id)
        .then((response)=>{
            if(response){
                cogoToast.success("Created and added to crew");
            }
        })
        .catch((err)=>{
            console.error("Failed to add to creww", err);
        })

        handleCrewDialogClose();
        setShouldResetCrewState(true);
        setTaskListTasks(null);

    };

    
    return(
        <React.Fragment>
            { selectedTasks && selectedTasks.length > 0 ?
                         <div className={classes.singleLineDiv}>
                            <span
                                className={classes.text_button} 
                                onClick={event => handleOpenCrewDialog(event)}>
                                Add Selected to Crew
                            </span>
                         </div>
            :<></>}
            
            { crewDialogOpen && selectedTasks ? 
            
            <Dialog PaperProps={{className: classes.dialog}} open={handleOpenCrewDialog} onClose={handleCrewDialogClose}>
            <DialogTitle className={classes.title}>Select Crew / Create New Crew</DialogTitle>
                <DialogContent className={classes.content}>

                    <Grid container className={classes.formGrid}>

                        <Grid item xs={3}>
                            <FormControl className={classes.inputField}>
                                <FormLabel component="legend">Select Type</FormLabel>
                                <FormGroup>
                                <div>
                                    <select
                                        
                                        id="artwork-input"
                                        value={selectedType}
                                        onChange={handleSelectTypeChange}
                                    > 
                                        <option value={""}>-</option>
                                        <option value={"drill"}> Drill</option>  
                                        <option value={"install"}> Install</option>  
                                    </select>
                                </div>
                                </FormGroup>
                            </FormControl>
                        </Grid>

                        <Grid item xs={4}>
                        <FormControl className={classes.inputField}>
                            <FormLabel component="legend">Select Crew</FormLabel>
                            <FormGroup>
                            <div>
                                <select
                                    
                                    id="artwork-input"
                                    value={selectedCrew}
                                    onChange={handleSelectExistingChange}
                                > 
                                <option value={-1}> *Create New*</option>  
                                { allCrews && allCrews.map((crew,i)=>{
                                    return (<option value={crew.id}>Crew - {crew.crew_leader_name ? crew.crew_leader_name : crew.id }</option>)
                                })}
                                    
                                </select>
                            </div>
                            </FormGroup>
                        </FormControl>
                        </Grid>

                        <Grid item xs={5}>
                            {selectedCrew == -1  ?
                                <FormControl className={classes.inputField}>
                                    <FormLabel component="legend">Crew Leader (optional)</FormLabel>
                                    <FormGroup>
                                    <div>
                                        <select
                                            
                                            id="artwork-input"
                                            value={selectedCrewLeader}
                                            onChange={handleSelectLeaderChange}
                                        > 
                                        <option value={-1}> *No Leader Yet*</option>  
                                        { selectedCrew && selectedCrew == -1 && crewMembers && crewMembers.map((member,i)=>{
                                            return (<option value={member.id}>{member.member_name }</option>)
                                        })}
                                            
                                        </select>
                                    </div>
                                    </FormGroup>
                                </FormControl>
                            :<></>}
                        </Grid>
                    </Grid>

                    <DialogActions>
                        <Button onMouseUp={handleCrewDialogClose} color="primary">
                            Cancel
                        </Button>
                        <Button
                            onMouseUp={event => handleAddOrCreateCrew(event, selectedType, selectedCrew, selectedCrewLeader)}
                            variant="contained"
                            color="secondary"
                            size="medium"
                            className={classes.saveButton} >
                            {selectedCrew == -1 ?  "Create New & Add" : "Add"}
                            </Button>
                    </DialogActions> 

            </DialogContent>
            </Dialog>
            :<></>}
        </React.Fragment>
      
    );

} 

export default TaskListAddCrewDialog;

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
