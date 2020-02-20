import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, Paper, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography, ButtonGroup, Button } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ListIcon from '@material-ui/icons/List';
import VisiblityOffIcon from '@material-ui/icons/VisibilityOff';
import { Scrollbars} from 'react-custom-scrollbars';
import TrashIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';

import CircularProgress from '@material-ui/core/CircularProgress';
import TaskListTasks from './TaskListTasks';
import TaskListTasksEdit from './TaskListTasksEdit';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';

import TaskLists from '../../../js/TaskLists';
import cogoToast from 'cogo-toast';

import {TaskContext} from '../Table/TaskContainer';

const TaskListMain = (props) => {
    //STATE
    const [expanded, setExpanded] = React.useState(false);
    const [taskListTasks, setTaskListTasks] = React.useState(null);
    const [editOpen, setEditOpen] = React.useState(false);
    const [editList, setEditList] = React.useState(null);
    //PROPS
    const { setModalTaskId, 
            modalOpen, setModalOpen, 
            activeTaskList, setActiveTaskList} = props;

    const {taskLists, setTaskLists, tabValue, setTabValue,
        taskListToMap, setTaskListToMap} = useContext(TaskContext);


    useEffect( () =>{ //useEffect for inputText
        //Gets data only on initial component mount
        if(taskLists == null){
            setTaskListTasks(null);
        }
        if(taskLists && activeTaskList && activeTaskList.id && taskListTasks == null ) { 
            TaskLists.getTaskList(activeTaskList.id)
            .then( (data) => {
                setTaskListTasks(data)
            })
            .catch( error => {
                cogoToast.error(`Error getting Task List`);
                console.warn(JSON.stringify(error, null,2));
            })
        }
    return () => { //clean up
        if(taskLists){
            
        }
    }
    },[activeTaskList,taskListTasks, taskLists]);

    //CSS
    const classes = useStyles();

    //FUNCTIONS
    const handleChange = (list, panel ) => (event, isExpanded) => {
        //Annoying bug with expansion and dialogs, return if dialog is open
        if(editOpen){
            return;
        }
        //Dont want to nullify tasks when we expand list
        if(isExpanded != false){
            setTaskListTasks(null);
        }

        setExpanded(isExpanded ? panel : false);

        if(isExpanded){
            setActiveTaskList(list);
        }
        else{
            //Refetch
            setActiveTaskList(null);
        }
    };

    const handleDelete = (event, id) => {
        
        const remove = () => {
            TaskLists.removeTaskList(id)
                .then((ok) => {
                    if(!ok){
                        throw new Error("Failed to remove Task List");
                    }
                    //refetch tasklists
                    setExpanded(false);
                    setActiveTaskList(null);
                    setTaskLists(null);
                    cogoToast.success(`Removed Task List ${id}`);
                })
                .catch( error => {
                    console.error(error);
                    cogoToast.error(`Error removing Task List`);
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

    const handleMapTaskList = (event, list) => {
        if(!list){
            return;
        }
        setTaskListToMap(list);
        setTabValue(2);
    };

    const handleAddNew = (event) =>{

        TaskLists.addTaskList("New List")
                .then((id) => {
                    if(!id){
                        console.warn("Bad id returned from addNewTaskList");
                    }
                    //refetch tasklists
                    setExpanded(false);
                    setActiveTaskList(null); 
                    setTaskLists(null);
                    cogoToast.success(`Added new Task List`);
                })
                .catch( error => {
                    cogoToast.error(`Error adding new task list`);
                    console.error(error);
            });
    };

    const handleEditClickOpen = (event, list) => {
        setEditList(list);
        setEditOpen(true);   
    };

    const handleEditClose = () => {
        setEditList(null);
        setEditOpen(false);
    };


     
    return(
        <Paper className={classes.root}>
            <Paper className={classes.head}>
                <span>Task Lists</span>
                <div className={classes.headButton}>
                <Button         
                    onClick={event => handleAddNew(event)}    
                    variant="text"
                    color="secondary"
                    size="large"
                    className={classes.darkButton}
                ><AddIcon/></Button>
                </div>
            </Paper>
            { taskLists ? 
            
            <React.Fragment>
            <TaskListTasksEdit props={{list: editList, open: editOpen, handleClose: handleEditClose, ...props}}/>
            {taskLists.map((list, i)=> { return(
            <ExpansionPanel expanded={expanded === ('panel' + i)} 
                            onChange={handleChange(list, 'panel' + i)} 
                            className={classes.body } 
                            key={"tasklist"+i}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                >
                        <ListIcon className={classes.icon}/>
                        <span>{list.list_name} 
                        {taskListToMap===list ? <p className={classes.p_active}>ACTIVE IN MAP</p>: <></>} :&nbsp;&nbsp;
                        </span>
                        <ButtonGroup className={classes.buttonGroup}>
                                
                                <Button
                                    onMouseDown={event => handleMapTaskList(event, list)}
                                    variant="text"
                                    color="secondary"
                                    size="large"
                                    className={classes.darkButton}
                                    
                                > Map Task List
                                </Button>
                                <Button
                                    onMouseDown={event => handleEditClickOpen(event, list)}
                                    variant="text"
                                    color="primary"
                                    size="large"
                                    className={classes.lightButton}
                                    ><EditIcon/></Button>
                                <Button
                                    onMouseDown={event => handleDelete(event,list.id)}
                                    variant="text"
                                    color="primary"
                                    size="large"
                                    className={classes.lightButton}
                                ><TrashIcon/></Button>
                            </ButtonGroup>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.details}>
                    <Scrollbars universal autoHeight autoHeightMax={400} style={{marginLeft: '20px'}}>
                        {taskListTasks ? 
                            <TaskListTasks 
                                taskListTasks={taskListTasks} setTaskListTasks={setTaskListTasks}
                                activeTaskList={activeTaskList} setActiveTaskList={setActiveTaskList}
                                setModalOpen={setModalOpen} 
                                setModalTaskId={setModalTaskId}
                        />
                        : 
                        <div>
                            <CircularProgress style={{marginLeft: "47%"}}/>
                        </div>
                        }
                    </Scrollbars>
                </ExpansionPanelDetails>
            </ExpansionPanel>
            )
            })}
            </React.Fragment>
            : <div>
                 <CircularProgress style={{marginLeft: "47%"}}/>
            </div>}
        </Paper>
    );

} 

export default TaskListMain;

const useStyles = makeStyles(theme => ({
    root: {
        padding: '1% 2% 2% 2%',
        margin: '0px 0px 0px 0px',
        backgroundColor: '#adb0b0',
        minHeight: '600px',
    },
    head: {
        padding: '.2% 2% .2% 2%',
        color: '#fff',
        backgroundColor: '#16233b',
        fontSize: '30px',
        fontWeight: '400',
    },
    body:{
        color: '#d87904',
        margin: '0',
        fontWeight: '800',
        fontSize: '16px',

    },
    details:{
        padding: '2px 8px 8px 6px'
    },
    attention:{
        color: 'red'
    },
    icon:{
        margin: '1px 12px 1px 1px',
        color: '#a0a0a0',
    },
    buttonGroup: {
        position: 'absolute',
        bottom: '6px',
        right: '106px',
    },
    darkButton:{
        backgroundColor: '#fca437',
        color: '#fff',
        fontWeight: '600',
        border: '1px solid rgb(255, 237, 196)',
      '&:hover':{
        border: '',
        backgroundColor: '#ffedc4',
        color: '#d87b04'
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
        display: "inline-block",
        position: "absolute",
        right: "75px",
        "&& .MuiButton-startIcon":{
            margin: '0px 5px',
        }

    },
    p_active:{
        color:'#fff',
        fontWeight: '200',
        display:'inline',
        backgroundColor: '#2e92da',
        padding: '3px 9px',
        margin: '0px 10px',
        borderRadius: '4px',
        boxShadow: 'inset 0px 2px 1px -1px rgba(0,0,0,0.2), inset 0px 1px 1px 0px rgba(0,0,0,0.14), inset 0px 1px 3px 0px rgba(0,0,0,0.12)'
    }
  }));