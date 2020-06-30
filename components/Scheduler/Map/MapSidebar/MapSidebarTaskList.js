import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, Paper, MenuItem, InputLabel, FormHelperText, FormControl, Select, Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';

import TaskLists from '../../../../js/TaskLists';
import Util from '../../../../js/Util';
import cogoToast from 'cogo-toast';
import { TaskContext } from '../../TaskContainer';
import EnhancedTableAddTL from "../../Table/EnhancedTableAddTL";


const MapSidebarTaskList = (props) => {
    //PROPS
    const { setActiveMarker, setResetBounds, reFetchTaskList, setReFetchTaskList} = props;
    const {mapRows, setMapRows, taskLists, setTaskLists, priorityList, selectedIds, setSelectedIds, taskListToMap, setTaskListToMap} = useContext(TaskContext);
    //STATE  
    const [open, setOpen] = React.useState(false);
    const [tempTaskListToMap, setTempTaskListToMap] = useState(null);
    //CSS
    const classes = useStyles();

    useEffect( () =>{ //useEffect for TaskListToMap, specifics for mapsidebar.
        //reset map bounds
        if(taskListToMap) {
            setResetBounds(true);
        }
    },[taskListToMap]);

    useEffect( () =>{ //useEffect for inputText
    //Gets and sets tasks from Task List when theres a tasklistToMap and a refetch is needed. 
    //ex when user selected same task list as taskListToMap or when we reorder
    if(reFetchTaskList && taskListToMap) {
        TaskLists.getTaskList(taskListToMap.id)
        .then( (data) => {
            //Set selected ids to Task List Tasks to prevent confusing on Tasks Table
            var newSelectedIds = data.map((item, i )=> item.t_id );
            setSelectedIds(newSelectedIds);
            
            setMapRows(data);
            //Zoom out to focus on new task list
            setResetBounds(true);
            setReFetchTaskList(false);
            cogoToast.success(`Active Task List: ${taskListToMap.list_name}.`, {hideAfter: 4});
        })
        .catch( error => {
            console.error(error);
            cogoToast.error(`Error getting task list`, {hideAfter: 4});
        })        
        
    }
    },[reFetchTaskList]);    


    //FUNCTIONS
    const handleChangeTaskListToMap = (event) => {
        //Handles select value in our select task list modal 
        //This function does not fetch any data just yet
        var id = event.target.value;
        if(id === ''){
            return;
        }
        var task = taskLists.filter((list, i)=> list.id === id)[0];
        setTempTaskListToMap(task);
    };
    const handleMapTaskList = (event) => {
        //Actually fetches data after clicking ok on modal
        setActiveMarker(null);
        //Remove any rows that are user selected in enhanced table
        setSelectedIds([]);
        //Fetch task list tasks
        if(taskListToMap === priorityList){
            //Special case where we need to refetch that wont work in regular fetching workflow
            setReFetchTaskList(true);
            return;
        }
        setTaskListToMap(priorityList);
    }; 

     
    return(
        <React.Fragment>
            
{ taskListToMap ? <p className={classes.p_activeTask}>Active Task List: {taskListToMap.list_name} {taskListToMap.is_priority ? "(PRIORITY LIST)" : "" }</p> 
                        : <><p className={classes.p_noActiveTask}>No Active Task List!</p></>}
            <Button className={classes.openButton} onClick={handleMapTaskList}>Map PriorityList</Button>
            {taskListToMap ? <></> : <EnhancedTableAddTL />}
        </React.Fragment>
      
    );

} 

export default MapSidebarTaskList;

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
    content:{
        minWidth: '500px',
    },
    saveButton:{
        backgroundColor: '#414d5a',
        color: '#fff'
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
        margin: '10px 17px 40px 57px',
        padding: '9px 5px',
        backgroundColor: '#f3f4f6',
        borderRadius: '3px',
        display: 'flex',
        '&& input':{
            color: '#16233b',
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
    p_activeTask:{
        fontSize: '13px',
        fontWeight: '600',
        margin: '5px 17px',
        backgroundColor: '#65aea4',
        padding: '3px 25px',
        borderRadius: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        boxShadow: 'inset 0px 2px 1px -1px rgba(0,0,0,0.2), inset 0px 1px 1px 0px rgba(0,0,0,0.14), inset 0px 1px 3px 0px rgba(0,0,0,0.12)'
    },
    p_noActiveTask:{
        fontSize: '13px',
        fontWeight: '600',
        margin: '5px 17px',
        backgroundColor: '#7d7d7d',
        padding: '3px 25px',
        borderRadius: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        boxShadow: 'inset 0px 2px 1px -1px rgba(0,0,0,0.2), inset 0px 1px 1px 0px rgba(0,0,0,0.14), inset 0px 1px 3px 0px rgba(0,0,0,0.12)'
    },
    menu_item_div:{
        display: 'flex',
        flexWrap: 'nowrap',

    },
    menu_item_name:{

    },
    menu_item_date:{
        color: "#999797",
        fontSize: '.8em',
        margin: '1%'
    },
  }));