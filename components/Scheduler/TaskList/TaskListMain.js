import React, {useRef, useState, useEffect} from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ListIcon from '@material-ui/icons/List';
import VisiblityOffIcon from '@material-ui/icons/VisibilityOff';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import { Scrollbars} from 'react-custom-scrollbars';
import TrashIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';

import CircularProgress from '@material-ui/core/CircularProgress';
import TaskListTasks from './TaskListTasks';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';

import TaskLists from '../../../js/TaskLists';


const TaskListMain = (props) => {
    //STATE
    const [expanded, setExpanded] = React.useState(false);
    const [taskListTasks, setTaskListTasks] = React.useState(null);
    //PROPS
    const {taskLists, setTaskLists, 
            mapRows, setMapRows, 
            selectedIds, setSelectedIds, 
            setModalTaskId, 
            modalOpen, setModalOpen, 
            activeTaskList, setActiveTaskList} = props;


    useEffect( () =>{ //useEffect for inputText
        //Gets data only on initial component mount
        if(taskLists == null){
            setTaskListTasks(null);
        }
        if(taskLists && activeTaskList && activeTaskList.id && taskListTasks == null ) { 
            TaskLists.getTaskList(activeTaskList.id)
            .then( (data) => {setTaskListTasks(data)})
            .catch( error => {
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
                })
                .catch( error => {
                    console.error(error);
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

    const handleAddNew = (event) =>{

        TaskLists.addTaskList("New List")
                .then((ok) => {
                    if(!ok){
                        throw new Error("Failed to remove Task List");
                    }
                    //refetch tasklists
                    setExpanded(false);
                    setActiveTaskList(null); 
                    setTaskLists(null);
                })
                .catch( error => {
                    console.error(error);
            });
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
                    startIcon={<AddIcon/>}
                />
                </div>
            </Paper>
            { taskLists ? 
            <React.Fragment>
            {taskLists.map((list, i)=> { return(
            <ExpansionPanel expanded={expanded === ('panel' + i)} onChange={handleChange(list, 'panel' + i)} className={classes.body } >
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                >
                        <ListIcon className={classes.icon}/><span>{list.list_name}:&nbsp;&nbsp;</span>
                        <ButtonGroup className={classes.buttonGroup}>
                                
                                <Button
                                    
                                    variant="text"
                                    color="secondary"
                                    size="large"
                                    className={classes.darkButton}
                                    
                                > Map Task List
                                </Button>
                                <Button
                                    onMouseDown={event => handleDelete(event,list.id)}
                                    variant="text"
                                    color="primary"
                                    size="large"
                                    className={classes.lightButton}
                                    startIcon={<TrashIcon/>}
                                />
                            </ButtonGroup>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.details}>
                    <Scrollbars universal autoHeight autoHeightMax={400} style={{marginLeft: '20px'}}>
                        {taskListTasks ? 
                            <TaskListTasks 
                                taskLists={taskLists}
                                taskListTasks={taskListTasks} setTaskListTasks={setTaskListTasks}
                                mapRows={mapRows} setMapRows={setMapRows}
                                selectedIds={selectedIds} setSelectedIds={setSelectedIds}
                                activeTaskList={activeTaskList} setActiveTaskList={setActiveTaskList}
                                setModalOpen={setModalOpen} setModalTaskId={setModalTaskId}
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

    }
  }));