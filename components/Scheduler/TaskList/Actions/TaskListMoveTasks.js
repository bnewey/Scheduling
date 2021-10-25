import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, FormControl, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, InputLabel, MenuItem} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import TaskLists from '../../../../js/TaskLists';
import { TaskContext } from '../../TaskContainer';
import cogoToast from 'cogo-toast';
import {PlaylistAddCheck, PanTool, Reorder } from '@material-ui/icons';


const TaskListActionAdd = (props) => {
 
    //PROPS
    const { selectedTasks, setSelectedTasks, setTaskListTasks, setTaskListTasksRefetch,parentClasses} = props;
    const {taskLists, setTaskLists, taskListToMap, setTaskListToMap, user } = useContext(TaskContext);

    //STATE

    //CSS
    const classes = useStyles();

    //FUNCTIONS

   

    const handleMoveItems = (event, selectedTasks, selectedTaskList) =>{
        if(!selectedTasks || selectedTasks.length == 0 || !selectedTaskList || !taskListToMap){
            console.error("Failed to handleMoveItems, bad params")
            cogoToast.error("Failed to move items");
            return;
        }

        TaskLists.addMultipleTasksToList(selectedTasks, selectedTaskList.id, user)
        .then((response)=>{
            console.log("response", response)
            if(response === true){
                TaskLists.removeMultipleFromList(selectedTasks, taskListToMap.id, user)
                .then((data)=>{
                    if(data){
                        cogoToast.success("Successfully moved tasks");
                        setSelectedTasks([]);
                        //setTaskListTasks(null);
                        setTaskListTasksRefetch(true);
                    }
                })
                .catch((error)=>{
                    cogoToast.error("Failed to remove multiple items");
                    console.error("Failed to remove multiple items", error);
                })
            }
        })
        .catch((error)=>{
            cogoToast.error("Failed to add multiple items")
            console.error("Failed to add multiple items", error)
        })
        
    };

    const getIcon = (list_name) =>{
        var return_value;
        switch(list_name){
            case "Completed Tasks":
                return_value = <PlaylistAddCheck className={parentClasses.icon}/>
                break;
            case "Holds":
                return_value = <PanTool className={parentClasses.icon}/>
                break;
            case "Main List":
                return_value = <Reorder className={parentClasses.icon}/>
                break;
            default:
                return_value = <Reorder className={parentClasses.icon}/>
                break;
        }
        return return_value;
    }



    
    return(
        <React.Fragment>
                    <div className={parentClasses.priority_action_heading}>
                    <span>Move</span>
                    </div>
                    { taskLists?.map((list)=>{
                        if(list.id === taskListToMap.id){
                            return (<></>);
                        }
                        return(
                            <div className={parentClasses.singleLineDiv}>
                                <div className={parentClasses.singleItem}>
                                    {getIcon(list.list_name)}
                                    <span
                                        key={list.id}
                                        className={parentClasses.text_button} 
                                        onClick={event => handleMoveItems(event, selectedTasks, list)}>
                                        Move Selected to {list.list_name}
                                    </span>
                                    </div>
                            </div>

                        )
                    })}
                            
            
        </React.Fragment>
      
    );

} 

export default TaskListActionAdd;

const useStyles = makeStyles(theme => ({
    root: {

    },
    dialog:{
        
    },
    title:{
        '&& .MuiTypography-root':{
            fontSize: '15px',
            color: '#fff',
        },
        padding: '5px 13px',
        backgroundColor: '#16233b',
  
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
        margin: '10px 17px ',
        padding: '9px 5px',
        backgroundColor: '#f3f4f6',
        borderRadius: '3px',
        display: 'block',
        '&& input':{
            color: '#16233b',
            minWidth: '292px',
        },
        '&& .MuiSelect-select':{
            minWidth: '292px',
            color: '#000',
            fontSize: '15px'
        },
        '&& .MuiOutlinedInput-multiline': {
        },
        '&& label':{
            backgroundColor: 'rgba(0, 0, 0, .00)',
            color: '#16233b',
            fontWeight: '500',
            fontSize: '14px'
        }
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

  }));
