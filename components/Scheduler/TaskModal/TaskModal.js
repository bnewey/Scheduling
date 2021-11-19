//The TaskModal displays a single tasks info
//Methods: Update field, delete task, 
//https://material-ui.com/components/modal/

import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, Modal, Backdrop, Fade, Grid, TextField, FormControl, InputLabel, MenuItem, Select, 
    ButtonGroup, Button, CircularProgress, Avatar} from '@material-ui/core';

import SaveIcon from '@material-ui/icons/Save';
import Move from '@material-ui/icons/Check';
import ListIcon from '@material-ui/icons/ListAltSharp';
import AddIcon from '@material-ui/icons/Add';

import cogoToast from 'cogo-toast';

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    TimePicker,
    DateTimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';

import Util from '../../../js/Util.js';
import Tasks from '../../../js/Tasks';
import TaskLists from '../../../js/TaskLists';

import TaskModalTaskInfo from './TaskModalSections/TaskModalTaskInfo';
import TaskModalAddressInfo from './TaskModalSections/TaskModalAddressInfo';
import TaskModalTaskList from './TaskModalSections/TaskModalTaskList';
import TaskModalWOSignArtItems from './TaskModalSections/TaskModalWOSignArtItems';
import TaskModalCrew from './TaskModalSections/TaskModalCrew';

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';
import { TaskContext } from '../TaskContainer.js';
import WoiStatusCheck from '../TaskList/components/WoiStatusCheck.js';

//ALERT ////
// This component is in TaskContainer, TaskList, and MapContainer -
// Chang props to this component in both locations to prevent breaking 

export default function TaskModal(props){

    const {modalOpen, setModalOpen, modalTaskId, setModalTaskId} = props;
    const {taskLists, setTaskLists, setRows, setRefreshView, tabValue, taskListToMap, user, activeTVOrder} = useContext(TaskContext);

    const classes = useStyles();

    const [modalTask, setModalTask] = React.useState(null); 
    const [shouldUpdate, setShouldUpdate] = React.useState(false);
    const [shouldUpdateAddressInfo, setShouldUpdateAddressInfo] = React.useState(false);
    const [shouldReFetch, setShouldReFetch] = React.useState(false);

    const [editTaskInfo, setEditTaskInfo] = React.useState(false);
    const [editAddressInfo, setEditAddressInfo] = React.useState(false);
    
    const variables_to_update = {
        task_info: ["t_name", "description", "notes", "type", "hours_estimate", "date_assigned", "date_desired","first_game", "date_completed"],
        delivery_install: ["delivery_date", "delivery_crew", "delivery_order", "sch_install_date","drill_date", "install_order"],
        task:["task_status", "drilling", "artwork", "sign"]
    };
    
    const text_variables = ["t_name", "description", "notes",  "hours_estimate", "delivery_crew", "delivery_order" , "install_order"];
    
    //Building an object of refs to update text input values instead of having them tied to state and updating every character
    const buildRefObject = arr => Object.assign({}, ...Array.from(arr, (k) => { return ({[k]: useRef(null)}) }));

    const [ref_object, setRef_Object] = React.useState(buildRefObject(text_variables));
    
    
    useEffect( () =>{ //useEffect for inputText
        //Gets data only on initial component mount
        if(modalTaskId) {
          Tasks.getTask(modalTaskId)
          .then( (data) => {
              console.log("taskmodal task", data);
              setModalTask(data[0]);
              if(shouldReFetch){
                setShouldReFetch(false);
              }
             })
          .catch( error => {
            console.warn(JSON.stringify(error, null,2));
            cogoToast.error(`Error Getting task. ` + error, {hideAfter: 4});
          });
        }

      
        return () => { //clean up
            //Reset modalTask so that it properly updates the modal form with the correct modalTask
            setModalTask(null);
            setShouldUpdate(false);
            setEditTaskInfo(false);
            setEditAddressInfo(false);
        }
      },[ modalTaskId, shouldReFetch]);

    
    const handleOpenModal = () => {
        setModalOpen(true);
    };

    
    const handleClose = () => {
        //Refreshes based on which tab is currently active
        var viewToRefresh;
        switch(tabValue){
            case 0:
                viewToRefresh = "calendar"
                break;
            case 1:
                viewToRefresh = "taskList"
                break;
            case 2:
                viewToRefresh = "map"
                break;
            case 3:
                viewToRefresh = "crew"
                break;
            case 4:
                viewToRefresh = "allTasks"
                break;
        }
        if(viewToRefresh){
            setRefreshView(viewToRefresh);
        }

        setModalOpen(false);
        setModalTask(null);
        setModalTaskId(null);
        setShouldUpdate(false);
        setShouldUpdateAddressInfo(false);
    };

    const handleDelete = id => () => {

        const remove = () => {
            Tasks.removeTask(id)
                .then((ok)=>{
                    cogoToast.success(`Task ${id} has been deleted`, {hideAfter: 4})
                    handleClose();})
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error deleting task. ` + error, {hideAfter: 4});
            });
        }
        confirmAlert({
            customUI: ({onClose}) => {
                return(
                    <ConfirmYesNo onYes={remove} onClose={onClose} customMessage="Delete this task permanently?"/>
                );
            }
        })

    };

    const handleShouldUpdate = param => () => {
        setShouldUpdate(param);
        
    }

    const handleInputOnChange = (value, param, type, key) => {
        if( !param || !type || !key){
            console.error("Bad handleInputOnChange call");
            return;
        }
        var tmpModalTask = {...modalTask};

        if(type === "datetime") {
            tmpModalTask[key] = value ? Util.convertISODateTimeToMySqlDateTime(value.toISOString()) : null;

        }
        if(type === "select"){
            tmpModalTask[key] = value.target.value;
        }

        setModalTask(tmpModalTask);
        setShouldUpdate(param);
        
    }


    const handleSave = task => () => {
        if(!task || !task.t_id){
            return;
        }
 
        if(shouldUpdate){
            var updateModalTask = {...task};

            //Create Object with our text input values using ref_object
            const objectMap = (obj, fn) =>
                Object.fromEntries(      Object.entries(obj).map( ([k, v], i) => [k, fn(v, k, i)]  )        );
            var textValueObject = objectMap(ref_object, v => v.current ? v.current.value ? v.current.value : null : null );

            //Adjusted Variables to Update, so that we can both: update one section at a time and/or update multiple
            var adj_variables_to_update = [ ...variables_to_update.task ];
            if(editTaskInfo) adj_variables_to_update = [...adj_variables_to_update, ...variables_to_update.task_info ];
            /*if(editDeliveryInstallInfo)*/ adj_variables_to_update = [...adj_variables_to_update, ...variables_to_update.delivery_install ];

            
            //Get only values we need to updateTask()
            for(var i =0 ; i< adj_variables_to_update.length; i++){
                const index = text_variables.indexOf(adj_variables_to_update[i]);
                //if key is not in text_variables, ie is a date or select input
                if(index === -1)
                    updateModalTask[adj_variables_to_update[i]] = task[adj_variables_to_update[i]];
                //if key is in text_variables, ie is a text input
                if(index >= 0){
                    updateModalTask[adj_variables_to_update[i]] = textValueObject[adj_variables_to_update[i]];
                }
                if(index === null){
                    console.error("index === null in handleSave");
                    cogoToast.error(`Internal Error`, {hideAfter: 4});
                }
            }
            //Add Id to this new object
            updateModalTask["t_id"] = task.t_id;
            
            console.log("UPDATE", updateModalTask);
            Tasks.updateTask(updateModalTask, user)
            .then( (data) => {
                //Refetch our data on save
                cogoToast.success(`Task ${task.t_name} has been updated!`, {hideAfter: 4});
                setRows(null);
                setTaskLists(null);
            })
            .catch( error => {
              console.warn(error);
              cogoToast.error(`Error updating task. ` + error, {hideAfter: 4});
            })
        }else{
            cogoToast.info("No Changes made");
        }
        handleClose();
    };

    const handleMoveItems = (event, modalTask, tl_id) =>{
        if(!modalTask?.t_id || !taskListToMap){
            console.error("Failed to handleMoveItem, bad params")
            cogoToast.error("Failed to move item");
            return;
        }

        TaskLists.addMultipleTasksToList([modalTask.t_id], tl_id, user)
        .then((response)=>{
            console.log("response", response)
            if(response === true){
                TaskLists.removeMultipleFromList([modalTask.t_id], taskListToMap.id, user)
                .then((data)=>{
                    if(data){
                        cogoToast.success("Successfully moved task");
                        //setTaskListTasks(null);
                        setShouldReFetch(true);
                    }
                })
                .catch((error)=>{
                    cogoToast.error("Failed to remove items");
                    console.error("Failed to remove items", error);
                })
            }
        })
        .catch((error)=>{
            cogoToast.error("Failed to add items")
            console.error("Failed to add items", error)
        })
        
    };


    

    return(
        <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={modalOpen}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={modalOpen}>
            { modalTask ? /* If modalTask is not loaded, load the circularprogrss instead */
            <div className={classes.container}>
            <div className={classes.modalTitleDiv}>
                <span id="transition-modal-title" className={classes.modalTitle}>WO: {modalTask.table_id}</span>
                <span id="transition-modal-title" className={classes.modalTitle}>Task: {modalTask.t_id}</span>
            </div>
            <Grid container >  
                <Grid item xs={9} className={classes.paperScroll}>
                <hr className={classes.hr}/>
                
                <TaskModalTaskInfo  classes={classes} 
                                    modalTask={modalTask} 
                                    handleInputOnChange={handleInputOnChange} 
                                    handleShouldUpdate={handleShouldUpdate}
                                    handleSave={handleSave}
                                    ref_object={ref_object}
                                    editTaskInfo={editTaskInfo} setEditTaskInfo={setEditTaskInfo}/>

                <hr className={classes.hr}/>
                
                    
                <TaskModalAddressInfo  classes={classes} 
                                    user={user}
                                    modalTask={modalTask} 
                                    handleInputOnChange={handleInputOnChange} 
                                    handleShouldUpdate={handleShouldUpdate}
                                    handleSave={handleSave}
                                    ref_object={ref_object}
                                    editAddressInfo={editAddressInfo} setEditAddressInfo={setEditAddressInfo}
                                    setShouldReFetch={setShouldReFetch}
                                    shouldUpdateAddressInfo={shouldUpdateAddressInfo} setShouldUpdateAddressInfo={setShouldUpdateAddressInfo}/>
                    
                    <hr className={classes.hr}/>
                
                    
                <TaskModalWOSignArtItems user={user} modalTask={modalTask} taskId={modalTask.table_id}/>
                        
                </Grid>
                <Grid item xs={3} className={classes.paper}>
                    
                

                <p className={classes.taskTitle}>Drill Date</p>
                <div>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}><DatePicker clearable showTodayButton  format="MM/dd/yyyy" className={classes.inputDate} inputVariant="outlined"  value={modalTask.drill_date} onChange={value => handleInputOnChange(value, true, "datetime", "drill_date")} /></MuiPickersUtilsProvider>
                </div>
                <p className={classes.taskTitle}>Install Date</p>
                <div>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}><DatePicker clearable showTodayButton format="MM/dd/yyyy" className={classes.inputDate} inputVariant="outlined"  value={modalTask.sch_install_date} onChange={value => handleInputOnChange(value, true, "datetime", "sch_install_date")} /></MuiPickersUtilsProvider>
                </div>
                
                <TaskModalCrew user={user} modalTask={modalTask} modalOpen={modalOpen} setModalOpen={setModalOpen} setTaskLists={setTaskLists} setShouldReFetch={setShouldReFetch} />
                { taskLists ?
                    <TaskModalTaskList user={user} taskLists={taskLists} setTaskLists={setTaskLists} 
                                        modalTask={modalTask}
                                        setShouldReFetch={setShouldReFetch}
                                        modalOpen={modalOpen} setModalOpen={setModalOpen} 
                                        setModalTaskId={setModalTaskId}
                                        activeTVOrder={activeTVOrder}/> 
                    :
                    <div>
                        <CircularProgress />
                    </div>
                }
                </Grid>
            </Grid>

            <Grid container >
                <Grid item xs={12} className={classes.paper_footer}>
                    {/* <div className={classes.footerInputField}>
                        <FormControl variant="outlined" className={classes.inputField}>
                            <InputLabel id="status-input-label">
                            Task Status
                            </InputLabel>
                            <Select
                            labelId="status-input-label"
                            id="status-input"
                            value={modalTask.task_status}
                            onChange={value => handleInputOnChange(value, true, "select", "task_status")}
                            >
                            <MenuItem value={null}>N/A</MenuItem>
                            <MenuItem value={'Not Started'}>Not Started</MenuItem>
                            <MenuItem value={'In Progress'}>In Progress</MenuItem>
                            <MenuItem value={'Delivered'}>Delivered</MenuItem>
                            <MenuItem value={'Installed'}>Installed</MenuItem>
                            <MenuItem value={'Completed'}>Completed</MenuItem>  
                            </Select>
                        </FormControl>
                    </div> */}
                    { modalTask?.task_list_id !== taskLists.find((list)=> list.list_name === "Completed Tasks")?.id && <Button
                            onClick={event => handleMoveItems(event, modalTask, taskLists.find((list)=> list.list_name === "Completed Tasks")?.id)}
                            variant="contained"
                            color="secondary"
                            size="large"
                            className={classes.moveButton}><Move />Move To Completed
                        </Button> }
                    { modalTask?.task_list_id !== taskLists.find((list)=> list.list_name === "Main List")?.id && <Button
                            onClick={event => handleMoveItems(event, modalTask, taskLists.find((list)=> list.list_name === "Main List")?.id)}
                            variant="contained"
                            color="secondary"
                            size="large"
                            className={classes.moveButton}><ListIcon />Move To Main List
                        </Button> }
                    <ButtonGroup className={classes.buttonGroup}>
                    <Button
                            onClick={() => handleClose()}
                            variant="contained"
                            color="primary"
                            size="large"
                            className={classes.saveButton}
                        >
                            Close
                        </Button></ButtonGroup>
                    <ButtonGroup className={classes.buttonGroup}>
                         
                        
                        <Button
                            onClick={handleSave(modalTask)}
                            variant="contained"
                            color="primary"
                            size="large"
                            className={classes.saveButton}
                        >
                            <SaveIcon />Save
                        </Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
            </div>
            : 
                <div>
                    <CircularProgress />
                </div>
            }   
        </Fade>
      </Modal>
    );
}

const useStyles = makeStyles(theme => ({
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '1 !important',
      '&& div':{
          outline: 'none',
      },
    },
    paper: {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[5],
      padding: '3% !important',
      position: 'relative',
      maxHeight: '650px',
      overflowY: 'auto',
    },
    paperScroll: {
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: '3% !important',
        position: 'relative',
        overflowY: 'auto',
        maxHeight: '650px',

        background: 'linear-gradient(white 30%, rgba(255, 255, 255, 0)), linear-gradient(rgba(255, 255, 255, 0), white 70%) 0 100%, radial-gradient(farthest-side at 50% 0, rgba(0, 0, 0, .2), rgba(0, 0, 0, 0)), radial-gradient(farthest-side at 50% 100%, rgba(0, 0, 0, .52), rgba(0, 0, 0, 0)) 0 100%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 40px, 100% 40px, 100% 14px, 100% 14px',
        /* Opera doesn't support this in the shorthand */
        backgroundAttachment: 'local, local, scroll, scroll',
      },
    paper_footer: {
        backgroundColor: '#ececec',
        padding: '1% !important',
        display: 'flex',
        justifyContent:'flex-end',
    },
    container: {
        width: '75%',
        minHeight: '50%',
        textAlign: 'center',
        
    },
    modalTitleDiv:{
        backgroundColor: '#5b7087',
        padding: '5px 0px 5px 0px',
        display:"flex",
        flexDirection: 'row',
        justifyContent: 'start',
        alignItems: 'center',
    },
    modalTitle: {
        padding: '0px 25px',
        fontSize: '18px',
        fontWeight: '300',
        color: '#fff',
    },
    taskTitle: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#000',
        display: 'inline',
    },
    inputField: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0px',
        '&& input':{
            padding: '12px 0px 12px 15px',
        },
        '&& .MuiSelect-select':{
            padding: '12px 40px 12px 15px',
            minWidth: '100px',
        },
        '&& .MuiOutlinedInput-multiline': {
            padding: '8.5px 12px'
        },
        '&& label':{
            backgroundColor: '#fff',
        }
    },
    inputDate: {
        padding: '0px',
        '&& input':{
            textAlign: 'center',
            padding: '8px 0px 8px 0px',
        },
    },
    avatar_and_label_div:{
        display: 'flex',
        flexDirection: 'column',
    },
    footerInputField: {

    },
    hr: {
        margin: '10px 0px 10px 0px',
        border: '2px solid #e1c179',
    },
    subsectionContainer:{
        padding: '2px 0px 2px 0px',
    },
    subsectionContainer_date:{
        backgroundColor: '#ebe63e4d',
    },
    lowerGrid: {
        textAlign: 'center',
    },
    lowerGridHead:{

    },
    text_head:{
        fontWeight: '600',
        fontVariant: 'small-caps',
        color: '#474747',
    },
    text_info:{
        fontWeight: '600',
        color: '#0083bf',
        fontSize: '12px',
    },
    text_info_grid:{
        padding: '4px 0px',
    },
    editFormButton: {
        padding: '0px 0px',
        marginLeft: '10px',
    },
    saveButton:{
        backgroundColor: '#414d5a'
    },
    moveButton:{
        backgroundColor: '#b7c3cd'
    },
    buttonGroup: {
        marginLeft: '1%',
        '& .MuiButton-label':{
            color: '#fff',
        },
        '&:hover':{
            '& .MuiButton-label':{
                color: '#333333',
                
            },
        }
    },
    selectBox: {
        '&& .MuiInputLabel-outlined': {
            transform: 'translate(14px, 12px) scale(1)',
        }
    },
    avatar:{
        display: 'inline-block',
        width: '25px',
        height:'25px',
        alignSelf:'center',
        backgroundColor: '#cbe8e4',
    },
    statusList:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: '0% 0% 2% 0%',
    },

    inputFieldMatUi: {
        margin: '10px 17px 7px 17px',
        padding: '0px',
        '&& input':{
            padding: '12px 0px 12px 15px',
        },
        '&& .MuiSelect-select':{
            padding: '12px 40px 12px 15px',
            minWidth: '120px',
        },
        '&& .MuiOutlinedInput-multiline': {
            padding: '8.5px 12px'
        },
        '&& label':{
            backgroundColor: '#fff',
        }
    },
    textButtonDiv:{
        display: 'inline',
        backgroundColor: '#416182',
        margin: '0px 10px',
        '&:hover':{
            backgroundColor: '#6a88a7',
        },
    },
    text_button:{
        cursor: 'pointer',
        fontSize: '14px',
        color: '#fff',
        margin: '1% 2%',
        padding: '1%',
    },
  }));