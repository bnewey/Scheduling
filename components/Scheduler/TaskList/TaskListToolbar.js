import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, Paper, ButtonGroup, Button, MenuItem, Select} from '@material-ui/core';

import TrashIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Clear';
import LinkIcon from '@material-ui/icons/Link';

import CircularProgress from '@material-ui/core/CircularProgress';
import TaskListTasksEdit from './TaskListTasksEdit';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';

import TaskLists from '../../../js/TaskLists';
import TaskListActionAdd from './TaskListActionAdd';
import Util from '../../../js/Util';
import CustomEmail from '../../../js/Email';
import cogoToast from 'cogo-toast';

import {TaskContext} from '../TaskContainer';

const TaskListToolbar = (props) => {
    //STATE
    const [editOpen, setEditOpen] = React.useState(false);
    const [editList, setEditList] = React.useState(null);
    const [idToActivateOnRefreshTL, setIdToActivateOnRefreshTL] = React.useState(null);
    //PROPS
    const { isPriorityOpen, setIsPriorityOpen,
                 priorityList, setPriorityList} = props;

    const {taskListTasks,setTaskListTasks, taskLists, setTaskLists, setTabValue,
        taskListToMap, setTaskListToMap} = useContext(TaskContext);


    useEffect(()=>{
        //set priority list ON START if exists
        if(taskLists && taskListTasks == null && taskListToMap == null){
            // POTENTIAL BUG
            setIsPriorityOpen(false);
            var priority_list = taskLists.filter((list)=> {
                return ( list.is_priority );
            })[0];
            if(priority_list){
                setIsPriorityOpen(true);
                setTaskListToMap(priority_list);
            }
        }   

        //change taskListToMap and taskListToMap to newly created 
        if(taskLists && idToActivateOnRefreshTL){
            let tmpTl = taskLists.filter((i)=>i.id == idToActivateOnRefreshTL)[0];
            if(tmpTl){
                setTaskListToMap(tmpTl);
                setIdToActivateOnRefreshTL(null);
            }
        }
    },[taskLists])

    
    useEffect(()=>{ //Handle Priority on taskListToMap change
        if(taskListToMap){
            if(taskListToMap.is_priority != null){
                setIsPriorityOpen(taskListToMap.is_priority);
            }
        }
        console.log("useeffect open task list");
    },[taskListToMap])

    //CSS
    const classes = useStyles();

    //FUNCTIONS
    const handleChange = (event) => {
        if(!event.target.value){
            return;
        }
        setTaskListToMap(event.target.value);
        setTaskListTasks(null);
    };

    const handleDelete = (event, id) => {
        
        const remove = () => {
            TaskLists.removeTaskList(id)
                .then((ok) => {
                    if(!ok){
                        throw new Error("Failed to remove Task List");
                    }
                    //refetch tasklists
                    setTaskListToMap(null);
                    setTaskLists(null);
                    cogoToast.success(`Removed Task List ${id}`, {hideAfter: 4});
                })
                .catch( error => {
                    console.error(error);
                    cogoToast.error(`Error removing Task List`, {hideAfter: 4});
            });
        }
        confirmAlert({
            customUI: ({onClose}) => {
                return(
                    <ConfirmYesNo onYes={remove} onClose={onClose} customMessage="Delete this task list permanently?"/>
                );
            }
        })
    
    };

    const handleEditModeTaskList = (event, priorityOpen) => {
        if(priorityOpen != null){
            setIsPriorityOpen(!priorityOpen);
        }

        //change to Priority List regardless of current TaskListToMap
        if(!priorityOpen){
            let priority_list = taskLists.filter((list)=> list.is_priority)[0];
            setTaskListToMap(priority_list);
            setTaskListTasks(null);
        }

    };


    const handleMapTaskList = (event, list) => {
        if(!list){
            return;
        }
        setTaskListToMap(list);
        setTabValue(1);
    };

    // const handleAddNew = (event) =>{
    //     TaskLists.addTaskList("New List")
    //             .then((id) => {
    //                 if(!id){
    //                     console.warn("Bad id returned from addNewTaskList");
    //                 }
    //                 //refetch tasklists
    //                 setTaskLists(null);
    //                 setIdToActivateOnRefreshTL(id);
    //                 cogoToast.success(`Added new Task List`, {hideAfter: 4});
    //             })
    //             .catch( error => {
    //                 cogoToast.error(`Error adding new task list`, {hideAfter: 4});
    //                 console.error(error);
    //         });
    // };

    
    // const handleEditClickOpen = (event, list) => {
    //     setEditList(list);
    //     setEditOpen(true);   
    // };

    const handleEditClose = () => {
        setEditList(null);
        setEditOpen(false);
    };

    const handleEmailUpdate = (event) =>{
        CustomEmail.sendEmail("bnewey@raineyelectronics.com", "Schedule has been updated.")
        .then((response)=>{
            cogoToast.success("Successfully sent Update Email!", {hideAfter: 4});
        })
        .catch((err)=>{
            cogoToast.error("Failed to send Email!", {hideAfter: 4});
            console.error(err);
        })
    }

    // const handleSetPriority = (event, tl_id, tl_name) => {
    //     if(!taskListToMap){
    //         return;
    //     }
    //     console.log("ID ", tl_id);

    //     const setPriority = () =>{
    //         TaskLists.setPriorityTaskList(tl_id, tl_name)
    //         .then((data)=>{
    //             console.log("reponse", data);
    //             cogoToast.success("Setting Priority");
    //             setTaskLists(null);
    //             setTaskListToMap(null);
    //         })
    //         .catch((error)=>{
    //             console.error(error);
    //             cogoToast.error("Failed to set priority");
    //         })
            
    //     }

    //     confirmAlert({
    //         customUI: ({onClose}) => {
    //             return(
    //                 <ConfirmYesNo onYes={setPriority} onClose={onClose} customMessage="Use the active task list to set priority?"/>
    //             );
    //         }
    //     })
        
    // }

    return(
        <>
        
        <Paper className={classes.head}>
            <span className={classes.tasklistHeadSpan}>{taskListToMap ? taskListToMap.list_name : 'TaskList'}&nbsp;View</span>
                {taskLists ? 
                <>
                    <TaskListTasksEdit props={{list: editList, open: editOpen, handleClose: handleEditClose, ...props}}/>
                    <div className={classes.leftButtonGroup}>
                    {taskListToMap ? 
                        <ButtonGroup  className={classes.buttonGroup}> 
                                   
                            <Button
                                onMouseDown={event => handleMapTaskList(event, taskListToMap)}
                                variant="text"
                                color="secondary"
                                size="large"
                                className={classes.darkButton}
                                
                            > Map TaskList
                            </Button>
                            <Button
                                onMouseDown={event => handleEmailUpdate(event)}
                                variant="text"
                                color="secondary"
                                size="large"
                                className={classes.darkButton}
                                
                            > Email Update
                            </Button>
                        </ButtonGroup>
                    : <>
                        <TaskListActionAdd  setIdToActivateOnRefreshTL={setIdToActivateOnRefreshTL}/>
                        </>} 
                        
                    </div>

                    { taskListToMap ?  
                    <>
                        
                    </> : <></> }
                </> : <></>}

            </Paper>
        </>
    );

} 

export default TaskListToolbar;

const useStyles = makeStyles(theme => ({

    head: {
        display: 'flex',
        flexWrap: 'nowrap',
        alignItems: 'center',
        padding: '.1% ',
        color: '#293a5a',
        background: 'linear-gradient( #dadada, #a2a2a2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '6px',
        fontSize: '20px',
    },
    tasklistHeadSpan:{
        fontSize: '20px ',
        fontWeight: '400',
    },
    icon:{
        margin: '1px 12px 1px 1px',
        color: '#a0a0a0',
    },
    buttonGroup: {
        maxHeight: '1em'
    },
    select: {
        backgroundColor: '#3d87c1',
        padding: '2px 18px',
        color: '#fff',
        fontWeight: '600',
        fontSize: '15px',
        margin: '0em 1em',
        minWidth: '120px',
    },
    darkButton:{
        backgroundColor: '#fca437',
        color: '#fff',
        fontWeight: '600',
      '&:hover':{
        border: '',
        backgroundColor: '#ffedc4',
        color: '#d87b04'
      }
    },darkPriorityButton:{
        backgroundColor: '#3d87c1',
        color: '#fff',
        fontWeight: '600',
        border: '1px solid rgb(255, 237, 196)',
      '&:hover':{
        border: '',
        backgroundColor: '#6aa1c2',
        color: '#fff'
      }
    },
    lightButton:{
        backgroundColor: '#b7c3cd',
        fontWeight: '600',
        "&& .MuiButton-startIcon":{
            margin: '0px 5px',
        }
    },
    headButton:{
        float: 'right',
        padding: '0% 1%',
        "&& .MuiButton-startIcon":{
            margin: '0px 5px',
        }

    },
    priority_div:{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ececec',
        padding: '7px 12px',
        border: '2px solid #adb0b0',
        borderRadius: '3px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    priority_text_div:{
        display: 'flex',
        flexDirection: 'row',
        margin: '0px 20px',
        
    },
    priority_text_label:{
        color: '#3f4249',
        fontSize: '10px',
        margin: '1% 1%',
        fontWeight: '400'
    },
    priority_text:{
        color: '#3d87c1',
        fontWeight: '600',
        fontSize: '12px',
        margin: '0% 1%',
    },
    priority_text_grey:{
        color: '#5e5e5e',
        fontWeight: '600',
        fontSize: '12px',
        margin: '0% 1%',
    },
    taskListLabelDiv:{
        borderRadius: '5px',
        padding: '0px 13px',
        backgroundColor: '#65aea4',
        border: '1px solid #ececec',
        boxShadow: 'inset 0 0 4px 0px black',
        margin: '0px 33px 0px 5px',
        display: 'flex',
        alignItems: "baseline",
        minWidth:'500px',
        justifyContent: 'space-between',
    },
    taskListLabelText:{
        color: '#fff',     
        fontSize: '23px',   
        fontWeight: '600',
        maxWidth: '300px',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        display: 'inline-block',
        verticalAlign: 'bottom',
    },
    taskListLabelPriorityIndicator:{
        color: '#fbff00',
        fontWeight: '400',
        fontSize: '20px',
        display: 'inline-block',
        verticalAlign: 'bottom',
    },
    leftButtonGroup:{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '.2em 2em',
        backgroundColor: '#ececec',
        padding: '7px 12px',
        border: '2px solid #adb0b0',
        borderRadius: '3px',
    },
    icon_small:{
        verticalAlign: 'text-bottom'
    }
      
  }));
