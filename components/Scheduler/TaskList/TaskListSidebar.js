import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, Paper,IconButton,ListItemSecondaryAction, ListItem, ListItemText, FormControlLabel,Grid, List, ListItemIcon, Button } from '@material-ui/core';


import CircularProgress from '@material-ui/core/CircularProgress';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';
import ListIcon from '@material-ui/icons/FormatListBulletedSharp';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import {PlaylistAddCheck, PanTool, Reorder,DateRange,Update,Clear , FilterList, ViewColumn, PictureAsPdf} from '@material-ui/icons';


import TaskLists from '../../../js/TaskLists';
import TaskListTasksEdit from './TaskListTasksEdit';
import TaskListActionAdd from './TaskListActionAdd';
import TaskListDateDialog from './TaskListDateDialog';
import {createSorter} from '../../../js/Sort';
import Util from '../../../js/Util';
import Settings from '../../../js/Settings';
import cogoToast from 'cogo-toast';

import {TaskContext} from '../TaskContainer';

import PDF from '../../../js/Pdf';
import {CrewContext} from '../Crew/CrewContextContainer';
import TaskListAddCrewDialog from './TaskListAddCrewDialog';
import TaskListMoveTasks from './Actions/TaskListMoveTasks';
import _ from 'lodash';

const TaskListSidebar = (props) => {

    //STATE
    const [editOpen, setEditOpen] = React.useState(false);
    const [editList, setEditList] = React.useState(null);

    const [quickFilters, setQuickFilters] = React.useState(null);

    //PROPS
    const { taskListTasks, setTaskListTasks,isPriorityOpen, setIsPriorityOpen, priorityList, setPriorityList,
        selectedTasks, setSelectedTasks, setSelectedIds,  taskListTasksRefetch, setTaskListTasksRefetch} = props;

    const { taskLists, setTaskLists, tabValue, setTabValue,
        taskListToMap, setTaskListToMap,setModalTaskId, 
        modalOpen, setModalOpen, setSorters, filters, setFilters, user, filterInOrOut, setFilterInOrOut,filterAndOr ,
        refreshView, setFilterAndOr, tableInfo, setTableInfo, taskViews, activeTaskView, setActiveTaskView,} = useContext(TaskContext);

    const {} = useContext(CrewContext);

    //CSS
    const classes = useStyles();

    //Refresh
    useEffect(()=>{
        if(refreshView && refreshView == "taskList"){
            setQuickFilters(null)
        }
    },[refreshView])

    useEffect(()=>{
        if(quickFilters == null && user){
            var user_id = user?.id;
            Settings.getTaskUserFilters(user_id)
            .then((data)=>{
                if(data){
                    var savedFilters = data?.map((item)=>{
                        item.filter_json = JSON.parse(item.filter_json);
                        return item;
                    })
                    console.log("taskUSerfilters", savedFilters);
                    setQuickFilters(savedFilters);
                }
            })
            .catch((error)=>{
                console.error("Failed to get user filters");
                cogoToast.error("Failed to get user filters");
            })
        }
        
    },[quickFilters, user])

    const handleApplySavedFilter = (event, item) =>{
        if(!item){
            console.error("Bad filter in handleApplySavedFilter ");
            return;
        }
        if(item.task_view && !isNaN(item.task_view)){ //0 = none
            setActiveTaskView(item.task_view)
        }
        setFilters(item.filter_json);
        setFilterInOrOut(item.in_out == 0 ? "in" : (item.in_out == 1 ? "out": null ) );
        setFilterAndOr(item.and_or == 0 ? "and" : (item.and_or == 1 ? "or": null ));
        cogoToast.success(`Filtering by ${item.name}`)

    }


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
                setWoiData(null);
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

        var tmpArray = taskListTasks.sort(createSorter({property: 'sch_install_date', 
            direction: "ASC"}))
        
        var tmpNoInstall = tmpArray.filter((v,i)=> v.sch_install_date == null || v.sch_install_date == "0000-00-00 00:00:00" || v.sch_install_date == "1970-01-01 00:00:00")
        var tmpInstall = tmpArray.filter((v,i)=> v.sch_install_date != null || v.sch_install_date != "0000-00-00 00:00:00" || v.sch_install_date != "1970-01-01 00:00:00")
        var newTaskIds = [...tmpInstall, ...tmpNoInstall ].map((task,i)=> task.t_id);
        
        console.log(newTaskIds);

        const reorder = () => {
            TaskLists.reorderTaskList(newTaskIds,taskList.id)
            .then( (ok) => {
                    if(!ok){
                    throw new Error("Could not reorder tasklist" + taskListToMap.id);
                    }
                    cogoToast.success(`Reordered Task List by Install Date`, {hideAfter: 4});
                    //setTaskListTasks(null);
                    setTaskListTasksRefetch(true);
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
        PDF.createTLPdf(taskListTasks, tableInfo)
        .then( (data) => {
            var fileURL = URL.createObjectURL(data);
            window.open(fileURL);
        })
        .catch((error)=>{
            console.error("Failed to create and open pdf", error);
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
        //setTaskListTasks(null);
        setTaskListTasksRefetch(true);
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
                {/* <div className={classes.priority_detail_heading}>
                    <span>List Info</span>
                </div>
                 <div>
                    {priorityList ? <div className={classes.priority_text_div}><span className={classes.priority_text_label}>Last Updated: </span><span className={classes.priority_text_grey}>{Util.convertISODateTimeToMySqlDateTime(priorityList.date_entered)}</span></div> : <></>}
                </div> */}
                <div className={classes.priority_action_heading}>
                    <span>Actions</span>
                </div>
                {taskListToMap ? 
                <>
                    <TaskListDateDialog  selectedTasks={selectedTasks} 
                                         setSelectedTasks={setSelectedTasks}
                                         parentClasses={classes}/>
                    <div className={classes.singleLineDiv}>
                        <div className={classes.singleItem}>
                             <Update className={classes.icon} />
                            <span
                                className={classes.text_button} 
                                onClick={event => handlePrioritizeByInstallDate(event, taskListToMap)}>
                                RePrioritize by Install Date
                            </span>
                        </div>
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
                         <div className={classes.singleItem}>
                             <Clear className={classes.icon} />
                            <span
                                className={classes.text_button} 
                                onClick={event => setSelectedTasks([])}>
                                Clear Selected
                            </span>
                        </div>
                        </div></>
                         :<></>}
                    { selectedTasks && selectedTasks.length > 0 ? <>
                    <TaskListMoveTasks  selectedTasks={selectedTasks} 
                                        setSelectedTasks={setSelectedTasks} 
                                        setTaskListTasks={setTaskListTasks}
                                        setTaskListTasksRefetch={setTaskListTasksRefetch}
                                        parentClasses={classes}/>
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


                <div className={classes.priority_action_heading}>
                    <span>Crew</span>
                </div>
                <TaskListAddCrewDialog taskListTasks={taskListTasks} 
                                       selectedTasks={selectedTasks} 
                                       onClose={()=>{setTaskListTasks(null); setWoiData(null);}} 
                                       setSelectedTasks={setSelectedTasks}
                                       parentClasses={classes}/>

                <div className={classes.priority_info_heading}>
                    <span>Other TaskLists</span>
                </div>
                {
                    taskLists && taskListToMap && taskLists.filter((v,i)=> (v.id != taskListToMap.id)).map((tl, index)=>{
                        const getIcon = (list_name) =>{
                            var return_value;
                            switch(list_name){
                                case "Completed Tasks":
                                    return_value = <PlaylistAddCheck className={classes.icon}/>
                                    break;
                                case "Holds":
                                    return_value = <PanTool className={classes.icon}/>
                                    break;
                                case "Main List":
                                    return_value = <Reorder className={classes.icon}/>
                                    break;
                                default:
                                    return_value = <Reorder className={classes.icon}/>
                                    break;
                            }
                            return return_value;
                        }

                        return(
                            <div className={classes.singleLineDiv}>
                                <div className={classes.singleItem}>
                                    {getIcon(tl.list_name)}
                                    <span
                                        className={classes.text_button} 
                                        onClick={event => handleChangeTaskListToMap(event, tl)}>
                                        {tl.list_name}
                                    </span>
                                 </div>
                            </div>

                        )
                    })
                }
                <div className={classes.priority_info_heading}>
                    <span>Quick Filters</span>
                </div>
                {
                    quickFilters && quickFilters.map((filter, index)=>{
                        const isSelected =  filter && filters &&_.isEqual(filters ,filter.filter_json) && filterInOrOut === (filter.in_out ? "out" : "in" )&& filterAndOr === (filter.and_or ? "or" : "and"); 
                            return(
                            <div className={classes.singleLineDiv}>
                                <div className={classes.singleItem}>
                                    <FilterList className={classes.icon} />
                                    <div key={filter.id} dense button
                                        onClick={event => handleApplySavedFilter(event, filter)}
                                        className={isSelected ? classes.text_button_selected : classes.text_button}
                                    >
                                    <span  className={classes.text_button}>
                                        {filter.name} {filter.task_view ? `(${taskViews.find((tv) =>tv.value === filter.task_view).name})` : ''}
                                    </span>
                                    </div>
                                </div>
                            </div>

                            );
                    })
                }
                <div className={classes.priority_info_heading}>
                    <span>TaskViews</span>
                </div>
                {taskViews?.map((view)=>{
                     const isSelected = activeTaskView === view.value;
     
                    return(
                        <div className={classes.singleLineDiv}>
                            <div className={classes.singleItem}>
                                <ViewColumn className={classes.icon} />
                                <span
                                    className={isSelected ? classes.text_button_selected : classes.text_button}
                                    onClick={event => setActiveTaskView(view.value)}>
                                    {view.name}
                                </span>
                            </div>
                        </div>
                    )
                })}
                    

                <div className={classes.priority_info_heading}>
                    <span>PDF</span>
                </div>
                <div className={classes.singleLineDiv}>
                    <div className={classes.singleItem}>
                        <PictureAsPdf className={classes.icon} />
                        <span
                            className={classes.text_button} 
                            onClick={event =>  handleCreateAndOpenPDF(event)}>
                            Create PDF
                        </span>
                    </div>
                </div>
            </div>
        </Paper>
    );
}


export default TaskListSidebar;

const useStyles = makeStyles(theme => ({
    root: {
        padding: '.3% .3% .3% .3%',
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
        display: 'flex',
        justifyContent:'center',
        borderBottom: '1px solid #d8d8d8',
        width: '100%',
        background: '#fff',
    },
    singleItem:{
        width: '90%',
        display: 'flex',
        justifyContent:'space-between',
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon:{
        flexBasis: '10%',
        marginRight: '5px',
        width: '.8em',
        height:'.8em',
        color: '#959595'
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
        borderRadius: 'px',
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
        borderRadius: '2px',
    },
    priority_detail_heading:{
        '& span':{
            fontSize: '14px',
        },
        marginTop: '4%',
        display: 'block',
        width: '100%',
        textAlign: 'center',
        backgroundColor: '#22407669',
        color: '#fff',
        borderRadius: '2px',
    },
    priority_action_heading:{
        '& span':{
            fontSize: '14px',
        },
        marginTop: '4%',
        display: 'block',
        width: '100%',
        textAlign: 'center',
        backgroundColor: '#fe6e08b8',
        color: '#fff',
        borderRadius: '2px',
    },
    otherTaskListsDiv:{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text_button:{
        flexBasis: '80%',
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: '12px',
        color: '#677fb3',
        margin: '0% 3% 0% 0%',
        whiteSpace: 'normal',
        '&:hover':{
            color: '#697fb1',
            textDecoration: 'underline',
        }
    },
    text_button_selected:{
        flexBasis: '80%',
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: '12px',
        color: '#222',
        margin: '0% 3% 0% 0%',
        whiteSpace: 'normal',
        background: '#70aaff70',
        padding: '0px 3px',
        borderRadius: 2,
        '&:hover':{
            color: '#697fb1',
            textDecoration: 'underline',

        },
    },
    fieldListItemText:{
        '& span':{
            fontWeight: '600'
        }
    },
  }));
