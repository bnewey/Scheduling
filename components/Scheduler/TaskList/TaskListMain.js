import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, Paper,IconButton,ListItemSecondaryAction, ListItem, ListItemText, FormControlLabel, Switch,Grid, List } from '@material-ui/core';


import CircularProgress from '@material-ui/core/CircularProgress';
import TaskListTasks from './TaskListTasks';
import TaskListToolbar from './TaskListToolbar';
import TaskListSidebar from './TaskListSidebar';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';

import TaskLists from '../../../js/TaskLists';
import {createSorter} from '../../../js/Sort';
import {createFilter} from '../../../js/Filter';
import cogoToast from 'cogo-toast';

import {TaskContext} from '../TaskContainer';

const TaskListMain = (props) => {
    //STATE
    const [taskListTasks, setTaskListTasks] = React.useState(null);
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [filters, setFilters] = useState([]);
    const [sorters, setSorters] = useState([]);
    
    //PROPS
    const { openTaskList, setOpenTaskList,isPriorityOpen, setIsPriorityOpen} = props;

    const {taskLists, setTaskLists, tabValue, setTabValue,
        taskListToMap, setTaskListToMap,setModalTaskId, 
        modalOpen, setModalOpen, priorityList, setPriorityList, setSelectedIds, setMapRows} = useContext(TaskContext);

    //CSS
    const classes = useStyles();

    useEffect( () =>{ //useEffect for inputText
        //Gets data only on initial component mount
        if(taskLists == null){
            setTaskListTasks(null);
        }
        if(taskLists && openTaskList && openTaskList.id && taskListTasks == null ) { 
            TaskLists.getTaskList(openTaskList.id)
            .then( (data) => {
                setTaskListTasks(data)
            })
            .catch( error => {
                cogoToast.error(`Error getting Task List`, {hideAfter: 4});
                console.warn(JSON.stringify(error, null,2));
            })
        }
    return () => { //clean up
        if(taskLists){
        }
    }
    },[openTaskList,taskListTasks, taskLists]);

    useEffect(()=>{
        if (Array.isArray(sorters) && sorters.length) {
            if (taskListTasks && taskListTasks.length) {
                var tmpData = taskListTasks.sort(createSorter(...sorters))
                console.log(tmpData);
                var copyObject = [...tmpData];
                setTaskListTasks(copyObject);
                cogoToast.success(`Sorting by ${sorters.map((v, i)=> v.property + ", ")}`);
            }
        }
    },[sorters])
    


    const table_info = [
        {text: "WO #", field: "table_id", width: '7%', type: 'number'},
        {text: "Desired Date", field: "date_desired", width: '10%', style: 'boldListItemText', type: 'date'},
        {text: "1st Game", field: "first_game", width: '10%', type: 'date'},
        {text: "install_date", field: "install_date", width: '10%', type: 'date'},
        {text: "Name", field: "t_name", width: '20%', style: 'boldListItemText', type: 'text'},
        {text: "Type", field: "type", width: '8%', type: 'text'},
        {text: "Description", field: "description", width: '19%', style: 'smallListItemText', type: 'text'},
        {text: "Drill Status", field: "drilling", width: '8%', type: 'text'},
        {text: "Task Status", field: "task_status", width: '8%', type: 'text'}
    ];

    const handleListSort = (event, item) =>{
        if(!item){
            cogoToast.error("Bad field while trying to sort");
            return;
        }
        //sort taskListItems according to item
        //this sort can take multiple sorters but i dont think its necessary
           // if it is, you will have to change the [0] to a dynamic index!
        if(item.type == 'date' || item.type == 'number' || item.type == 'text'){
            setSorters([{
                property: item.field, 
                direction: sorters[0] && sorters[0].direction == "ASC" ? "DESC" : "ASC",
            }])
        }
    }

     
    return(
        <>
            <TaskListToolbar openTaskList={openTaskList} setOpenTaskList={setOpenTaskList} 
                            taskListTasks={taskListTasks} setTaskListTasks={setTaskListTasks} 
                            isPriorityOpen={isPriorityOpen} setIsPriorityOpen={setIsPriorityOpen}
                            priorityList={priorityList} setPriorityList={setPriorityList} setSelectedIds={setSelectedIds}/>
            <Grid container >  
                <Grid item xs={2} >
                    <TaskListSidebar taskListTasks={taskListTasks} setTaskListTasks={setTaskListTasks}
                                 openTaskList={openTaskList} setOpenTaskList={setOpenTaskList} 
                                 isPriorityOpen={isPriorityOpen} setIsPriorityOpen={setIsPriorityOpen}
                                  priorityList={priorityList} setPriorityList={setPriorityList}
                                  selectedTasks={selectedTasks} setSelectedTasks={setSelectedTasks} setSelectedIds={setSelectedIds} />
                </Grid>
                <Grid item xs={10} >
                    <Paper className={classes.root}>
                        {taskListTasks ? 
                        <>
                            <ListItem className={classes.HeadListItem} classes={{container: classes.liContainer}}>
                                {table_info.map((item, i)=>(
                                    <ListItemText id={"Head-ListItem"+i} 
                                                    className={classes.listItemText} 
                                                    style={{flex: `0 0 ${item.width}`}} 
                                                    classes={{primary: classes.listItemTextPrimary}}
                                                    onClick={event=>handleListSort(event, item)}
                                                    >
                                                    {item.text}
                                    </ListItemText>
                                ))}
                                <ListItemSecondaryAction>            
                                        <React.Fragment>
                                        <IconButton edge="end" aria-label="edit">
                                        
                                        </IconButton>
                                        <IconButton edge="end" aria-label="delete">
                                            
                                        </IconButton> 
                                        </React.Fragment>
                                    &nbsp;&nbsp;&nbsp;
                                </ListItemSecondaryAction>
                            </ListItem>
                            <TaskListTasks 
                                selectedTasks={selectedTasks} setSelectedTasks={setSelectedTasks}
                                taskListTasks={taskListTasks} setTaskListTasks={setTaskListTasks}
                                openTaskList={openTaskList} setOpenTaskList={setOpenTaskList}
                                setModalOpen={setModalOpen} 
                                setModalTaskId={setModalTaskId}
                                table_info={table_info}
                                priorityList={priorityList} setTaskListToMap={setTaskListToMap} setSelectedIds={setSelectedIds}
                                setMapRows={setMapRows}/>
                        </>
                        : <>
                        <ListItem className={classes.HeadListItem} classes={{container: classes.liContainer}}>
                                <ListItemText id="Head-ListItem" classes={{primary: classes.listItemTextPrimary}}>
                                        Select a Task List in the dropdown menu above.
                                </ListItemText>
                            </ListItem>
                        </>}

                        
                    </Paper>
                </Grid>
            </Grid>
            
            
        </>
    );

} 

export default TaskListMain;

const useStyles = makeStyles(theme => ({
    root: {
        padding: '.62% .3% .3% .3%',
        margin: '0px 0px 5px 5px',
        backgroundColor: '#eee',
        height: '100%',

    },
    HeadListItem:{
        backgroundColor: '#293a5a !important',
        boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
        fontSize: '12px',
        fontWeight: '700',
        display:'flex',
        flexWrap: 'nowrap',
        justifyContent: 'space-around',
        padding: '3px',
        paddingRight: '6%',
    },
    liContainer: {
        listStyle: 'none',
        margin: '23px 8px 0px 8px',
     },
    listItemTextPrimary:{
        fontWeight: '600',
        color: '#ffffff',
     },
    listItemText:{
        textAlign: 'center',
     }

      
  }));
