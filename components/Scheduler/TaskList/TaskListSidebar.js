import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, Paper,IconButton,ListItemSecondaryAction, ListItem, ListItemText, FormControlLabel,Grid, List, ListItemIcon, Button } from '@material-ui/core';


import CircularProgress from '@material-ui/core/CircularProgress';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';
import ListIcon from '@material-ui/icons/FormatListBulletedSharp';
import AddIcon from '@material-ui/icons/Add';

import TaskLists from '../../../js/TaskLists';
import TaskListTasksEdit from './TaskListTasksEdit';
import TaskListActionAdd from './TaskListActionAdd';
import Util from '../../../js/Util';
import cogoToast from 'cogo-toast';

import {TaskContext} from '../TaskContainer';

const TaskListSidebar = (props) => {

    //STATE
    const [editOpen, setEditOpen] = React.useState(false);
    const [editList, setEditList] = React.useState(null);
    const [idToActivateOnRefreshTL, setIdToActivateOnRefreshTL] = React.useState(null);

    //PROPS
    const { taskListTasks, setTaskListTasks, openTaskList, setOpenTaskList,isPriorityOpen, setIsPriorityOpen, priorityList, setPriorityList} = props;

    const {taskLists, setTaskLists, tabValue, setTabValue,
        taskListToMap, setTaskListToMap,setModalTaskId, 
        modalOpen, setModalOpen} = useContext(TaskContext);

    //CSS
    const classes = useStyles();

    useEffect(()=>{

        //change openTaskList and taskListToMap to newly created 
        //also exists in TaskListToolbar
        if(taskLists && idToActivateOnRefreshTL){
            let tmpTl = taskLists.filter((i)=>i.id == idToActivateOnRefreshTL)[0];
            if(tmpTl){
                setTaskListToMap(tmpTl);
                setOpenTaskList(tmpTl);
                setIdToActivateOnRefreshTL(null);
            }
            
        }
    },[taskLists])


    const handleSelectTaskList = (event, list) => {
        setTaskListToMap(list);
        setOpenTaskList(list)
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
                    setOpenTaskList(null);
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

    const handleEditClickOpen = (event, list) => {
        setEditList(list);
        setEditOpen(true);   
    };

    const handleEditClose = () => {
        setEditList(null);
        setEditOpen(false);
    };



    return(
        <>
        <Paper className={classes.root}>
            <TaskListTasksEdit props={{list: editList, open: editOpen, handleClose: handleEditClose, ...props}}/>
            <div className={classes.head_div}>
                <span>TaskLists</span>
            </div>
           
            <Paper className={classes.list_div}>
                <List component="nav" aria-label="main mailbox folders">
                    {taskLists && taskLists.map((list)=>(
                        <ListItem
                        button
                        selected={openTaskList && openTaskList.id === list.id}
                        onClick={event => handleSelectTaskList(event, list)}
                        className={classes.list_item}
                        >
                            <ListItemIcon className={classes.list_item_icon}>
                                <ListIcon />
                            </ListItemIcon>
                            <ListItemText className={classes.list_item_text}>
                                <div class="list_">
                                    <span class="list_name">{list.list_name}</span> 
                                    <span class={priorityList && priorityList.id == list.id 
                                            ? "list_item_priority" 
                                            : priorityList && priorityList.linked_tl == list.id 
                                                ? "list_item_linked" 
                                                : ""}>
                                        {priorityList && priorityList.id == list.id 
                                            ? "PRIORITY LIST" 
                                            : priorityList && priorityList.linked_tl == list.id 
                                                ? "PRIORITY LINKED" 
                                                : ""}
                                    </span>
                                </div>
                                <div>
                                    <span class="list_item_date">Updated: {Util.convertISODateTimeToMySqlDateTime(list.date_entered)}</span>
                                </div>
                                {openTaskList && openTaskList.id === list.id 
                                ? 
                                    <div>
                                        <span
                                            class="list_item_text_button" 
                                            onClick={event => handleEditClickOpen(event, openTaskList)}>
                                            Rename
                                        </span>
                                        <span
                                            class="list_item_text_button" 
                                            onClick={event => handleDelete(event, list.id)}>
                                            Delete
                                        </span>
                                        
                                    </div>
                                :   <></> 
                                }
                                
                                
                            </ListItemText>
                        </ListItem>
                    ))}     
                </List>
            </Paper>
            <div className={classes.button_div}>
                <TaskListActionAdd  setIdToActivateOnRefreshTL={setIdToActivateOnRefreshTL}/>
            </div>
        </Paper>
        </>
    );
}

export default TaskListSidebar;

const useStyles = makeStyles(theme => ({
    root: {
        padding: '.62% .3% .3% .3%',
        margin: '0px 0px 5px 5px',
        background: 'linear-gradient( #dadada, #a2a2a2)',
        height: '100%',
    },
    head_div:{
        backgroundColor: '#fca437',
        padding: '1% 3%',
        margin: '3% 1%',
        borderRadius: '3px',
        textAlign: 'center',
        '& span':{
            color: '#fff',
            fontSize: '13px',
            fontWeight: '600',
        },
    },
    button_div:{
        textAlign: 'center',
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
    list_div:{
        margin: '2% 3%',
        '& .MuiListItem-root.Mui-selected':{
            backgroundColor: '#46aeff54',
        }
    },
    list_item:{
        margin: '0%',
        padding: '1% 6%',
        border: '1px solid #efefef',
        
    },
    list_item_icon:{
        minWidth: '15%',
        color: '#767676',
    },
    list_item_text:{
        fontSize: '14px',
        '& .list_name':{
            fontWeight: '600',
            margin: '0% 3% 0% 0%',
        },
        '& .list_item_priority':{
            fontSize: '12px',
            color: '#3d87c1',
            fontWeight: '600',
        },
        '& .list_item_linked':{
            fontSize: '12px',
            color: '#3a9fc4'
        },
        '& .list_item_date':{
            fontSize: '11px',
            color: '#767676'
        },
        '& span .list_item_text_button':{
            cursor: 'pointer',
            fontSize: '12px',
            color: '#677fb3',
            margin: '0% 3% 0% 0%',
            '&:hover':{
                color: '#697fb1',
                textDecoration: 'underline',
            }

        }
    }
  }));
