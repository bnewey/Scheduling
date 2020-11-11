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
import TaskListDateDialog from './TaskListDateDialog';
import {createSorter} from '../../../js/Sort';
import Util from '../../../js/Util';
import cogoToast from 'cogo-toast';

import {TaskContext} from '../TaskContainer';

import PDF from '../../../js/Pdf';
import {CrewContext} from '../Crew/CrewContextContainer';
import TaskListAddCrewDialog from './TaskListAddCrewDialog';
import TaskListMoveTasks from './Actions/TaskListMoveTasks';

const TaskListSidebar = (props) => {

    //STATE
    const [editOpen, setEditOpen] = React.useState(false);
    const [editList, setEditList] = React.useState(null);
    const [pdfLoaded,setPDFLoaded] = React.useState(false);

    //PROPS
    const { taskListTasks, setTaskListTasks,isPriorityOpen, setIsPriorityOpen, priorityList, setPriorityList,
        selectedTasks, setSelectedTasks, setSelectedIds, setTableInfo, handleChangeTaskView} = props;

    const { taskLists, setTaskLists, tabValue, setTabValue,
        taskListToMap, setTaskListToMap,setModalTaskId, 
        modalOpen, setModalOpen, setSorters, setFilters} = useContext(TaskContext);

    const {} = useContext(CrewContext);

    //CSS
    const classes = useStyles();


    const handleEditClickOpen = (event, list) => {
        setEditList(list);
        setEditOpen(true);  
    };

    const handleEditClose = () => {
        setEditList(null);
        setEditOpen(false);
    };

    const handleRemoveMultipleTasks = (event, selectedTasks, task_list) =>{
        const remove = () => {
            TaskLists.removeMultipleFromList(selectedTasks, task_list.id)
            .then((response)=>{
                const filtered_rows = taskListTasks.filter((task, i)=> (    !(selectedTasks.includes(task.t_id))   ));
                //Set Tasks to all but ones weve deleted
                setTaskListTasks(filtered_rows);
                setTaskListToMap(priorityList);
                //Set selected ids in table view to all but ones weve deleted
                setSelectedIds(filtered_rows.map((task,i)=> {return task.t_id}));
                cogoToast.success(`Removed tasks from Task List`, {hideAfter: 4});
            })
            .catch((error)=>{
                console.error("Error removing multiple",error);
                cogoToast.error("Error removing multiple items", {hideAfter: 4});
            });
        }

        confirmAlert({
            customUI: ({onClose}) => {
                return(
                    <ConfirmYesNo onYes={remove} onClose={onClose} customMessage={"Remove tasks from TaskList?"}/>
                );
            }
        })
    }

    const handlePrioritizeByInstallDate = (event, taskList) => {
        if(taskListTasks == null || taskListTasks.length <= 0){
            console.error("Bad tasklisttasks on reprioritize by install date");
            return;
        }
        if(!taskList.id){
            console.error("Bad taskListId in handlePrioritizeByInstallDate");
            return;
        }

        var tmpArray = taskListTasks.sort(createSorter({property: 'install_date', 
            direction: "ASC"}))
        
        var tmpNoInstall = tmpArray.filter((v,i)=> v.install_date == null || v.install_date == "0000-00-00 00:00:00" || v.install_date == "1970-01-01 00:00:00")
        var tmpInstall = tmpArray.filter((v,i)=> v.install_date != null || v.install_date != "0000-00-00 00:00:00" || v.install_date != "1970-01-01 00:00:00")
        var newTaskIds = [...tmpInstall, ...tmpNoInstall ].map((task,i)=> task.t_id);
        
        console.log(newTaskIds);

        const reorder = () => {
            TaskLists.reorderTaskList(newTaskIds,taskList.id)
            .then( (ok) => {
                    if(!ok){
                    throw new Error("Could not reorder tasklist" + taskListToMap.id);
                    }
                    cogoToast.success(`Reordered Task List by Install Date`, {hideAfter: 4});
                    setTaskListTasks(null);
                    //Set sorters back to priority
                    setSorters([{property: 'priority_order', 
                        direction: "ASC"}]);
                })
            .catch( error => {
            cogoToast.error(`Error reordering task list`, {hideAfter: 4});
                console.error(error);
            });
        }
        
        confirmAlert({
            customUI: ({onClose}) => {
                return(
                    <ConfirmYesNo onYes={reorder} onClose={onClose} customMessage={"Reprioritize by Install Date? This cannot be undone."}/>
                );
            }
        })
    }


    const handleCreateAndOpenPDF = (event)=>{
        if(!taskListTasks){
            cogoToast.error("Failed to create PDF");
            return;
        }
        PDF.createTLPdf(taskListTasks)
            .then( (data) => {
                cogoToast.success("Created PDF");
                setPDFLoaded(true);
                // setLoading(false);
            })
            .catch( error => {
              console.warn(error);
            })
    }

    const handleChangeTaskListToMap = (event, taskList) =>{
        if(!taskList){
            console.error("Bad tasklist in handleChangeTaskListToMap");
        }
        setSorters([{property: 'priority_order', 
                        direction: "ASC"}]);
        //TODO: add task_list_id to filters objects that are saved, so we can remember filters on tl switches
        // implement if we add more task_list switching functionality
        setFilters([]);
        setTaskListTasks(null);
        setSelectedTasks([]);
        setTaskListToMap(taskList);
    }


    return(
        <Paper className={classes.root}>
            <TaskListTasksEdit props={{list: editList, open: editOpen, handleClose: handleEditClose, ...props}}/>
            <div className={classes.sidebarHead}>
                <span>SIDEBAR</span>
            </div>
            <div className={classes.priority_info_div}>   
                <div className={classes.priority_info_heading}>
                    <span>List Info</span>
                </div>
                 <div>
                    {priorityList ? <div className={classes.priority_text_div}><span className={classes.priority_text_label}>Last Updated: </span><span className={classes.priority_text_grey}>{Util.convertISODateTimeToMySqlDateTime(priorityList.date_entered)}</span></div> : <></>}
                </div>
                <div className={classes.priority_info_heading}>
                    <span>Actions</span>
                </div>
                {taskListToMap ? 
                <>
                    <TaskListDateDialog  selectedTasks={selectedTasks} setSelectedTasks={setSelectedTasks}/>
                    <div className={classes.singleLineDiv}>
                            <span
                                className={classes.text_button} 
                                onClick={event => handlePrioritizeByInstallDate(event, taskListToMap)}>
                                RePrioritize by Install Date
                            </span>
                    </div>
                    { selectedTasks && selectedTasks.length > 0 ? <>
                         {/* <div className={classes.singleLineDiv}>
                            <span
                                className={classes.text_button} 
                                onClick={event => handleRemoveMultipleTasks(event, selectedTasks, taskListToMap)}>
                                Remove Multiple From TaskList
                            </span>
                         </div> */}
                         <div className={classes.singleLineDiv}>
                         <span
                             className={classes.text_button} 
                             onClick={event => setSelectedTasks([])}>
                             Clear Selected
                         </span>
                      </div></>
                         :<></>}
                    { selectedTasks && selectedTasks.length > 0 ? <>
                    <TaskListMoveTasks  selectedTasks={selectedTasks} setSelectedTasks={setSelectedTasks} setTaskListTasks={setTaskListTasks}/>
                        </> : <></>}
                    {/* <div className={classes.singleLineDiv}>
                    <span
                        className={classes.text_button} 
                        onClick={event => handleEditClickOpen(event, taskListToMap)}>
                        Rename
                    </span>
                    </div> */}
                </>
                :   <></> 
                }


                <div className={classes.priority_info_heading}>
                    <span>Crew</span>
                </div>
                <TaskListAddCrewDialog taskListTasks={taskListTasks} setTaskListTasks={setTaskListTasks} selectedTasks={selectedTasks} setSelectedTasks={setSelectedTasks}/>

                <div className={classes.priority_info_heading}>
                    <span>Other TaskLists</span>
                </div>
                    <div className={classes.singleLineDiv}>
                            {
                                taskLists && taskListToMap && taskLists.filter((v,i)=> (v.id != taskListToMap.id)).map((tl, index)=>{
                                    return(
                                        <span
                                            className={classes.text_button} 
                                            onClick={event => handleChangeTaskListToMap(event, tl)}>
                                            {tl.list_name}
                                        </span>
                                    )
                                })
                            }
                            
                    </div>
                <div className={classes.priority_info_heading}>
                    <span>TaskViews</span>
                </div>
                    <div className={classes.singleLineDiv}>
                            <span
                                className={classes.text_button} 
                                onClick={event => handleChangeTaskView("compact")}>
                                Compact
                            </span>
                    </div>
                    <div className={classes.singleLineDiv}>
                            <span
                                className={classes.text_button} 
                                onClick={event =>  handleChangeTaskView("date")}>
                                Dates
                            </span>
                    </div>
                    <div className={classes.singleLineDiv}>
                            <span
                                className={classes.text_button} 
                                onClick={event =>  handleChangeTaskView("default")}>
                                Simple
                            </span>
                    </div>

                <div className={classes.priority_info_heading}>
                    <span>PDF</span>
                </div>
                <div className={classes.singleLineDiv}>
                    <span
                        className={classes.text_button} 
                        onClick={event =>  handleCreateAndOpenPDF(event)}>
                        Create PDF
                    </span>
                </div>
                { pdfLoaded ? 
                <div className={classes.singleLineDiv}>
                    <span className={classes.text_button}  >
                            <a href={"./static/task_list.pdf"}
                        target="_blank" >Open PDF</a>
                        
                    </span>
                </div>
                : <></>}
            </div>
        </Paper>
    );
}


export default TaskListSidebar;

const useStyles = makeStyles(theme => ({
    root: {
        padding: '.62% .3% .3% .3%',
        margin: '0px 0px 5px 5px',
        background: '#e2e2e2',
        height: '100%',
    },
    sidebarHead:{
        padding:'2px',
        backgroundColor: '#5b7087',
        margin: '1%',
        borderRadius: '3px',
        boxShadow: '1px 1px 1px 0px #2f2b2b',
        display: 'flex',
        justifyContent: 'center',
        alignItems:'center',
        '& span':{
            color: '#fff',
            fontWeight:'400',
        }
    },
    singleLineDiv:{
        display: 'block',
    },
    head_div:{
        backgroundColor: '#fca437',
        padding: '1% 3%',
        margin: '3% 1% 0% 1%',
        borderRadius: '3px',
        textAlign: 'center',
        '& span':{
            color: '#fff',
            fontSize: '13px',
            fontWeight: '600',
        },
    },
    priority_head_div:{
        backgroundColor: '#ff4810',
        padding: '1% 3%',
        margin: '3% 1% 0% 1%',
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
        margin: '0% 3% 10% 3%',
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
    priority_info_div:{
        display: 'flex',
        flexWrap: 'nowrap',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ececec',
        padding: '7px 12px',
        margin: '0px 5px',
        border: '2px solid #adb0b0',
        borderRadius: '3px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        boxShadow: 'inset 0px 0px 2px 1px #00000099',
    },
    priority_info_heading:{
        '& span':{
            fontSize: '14px',
        },
        marginTop: '4%',
        display: 'block',
        width: '100%',
        textAlign: 'center',
        backgroundColor: '#66afa5a6',
        color: '#fff',
        borderRadius: '8px',
    }
  }));
