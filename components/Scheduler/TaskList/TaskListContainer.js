import React, {useRef, useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';

import CircularProgress from '@material-ui/core/CircularProgress';

import TaskListMain from '../TaskList/TaskListMain';

import TaskLists from '../../../js/TaskLists';
import TaskModal from '../Table/TaskModal/TaskModal';


//we can make this a functional component now
const TaskListContainer = function(props) {
    const [activeTaskList, setActiveTaskList] = useState();
    const [modalOpen, setModalOpen] = React.useState(false);  
    const [modalTaskId, setModalTaskId] = React.useState(); 

    const {taskLists, setTaskLists, mapRows, setMapRows, selectedIds, setSelectedIds, tabValue, setTabValue,
        taskListToMap, setTaskListToMap} = props;
    
     

    return (
    <div>
        <TaskListMain taskLists={taskLists} setTaskLists={setTaskLists} 
                    mapRows={mapRows} setMapRows={setMapRows} 
                    selectedIds={selectedIds} setSelectedIds={setSelectedIds}
                    modalOpen={modalOpen} setModalOpen={setModalOpen} 
                    setModalTaskId={setModalTaskId}
                    activeTaskList={activeTaskList} setActiveTaskList={setActiveTaskList}
                    tabValue={tabValue} setTabValue={setTabValue}
                    taskListToMap={taskListToMap} setTaskListToMap={setTaskListToMap}/>
        <TaskModal modalOpen={modalOpen} setModalOpen={setModalOpen} 
                    modalTaskId={modalTaskId} setModalTaskId={setModalTaskId}
                    taskLists={taskLists} setTaskLists={setTaskLists}/>
    </div>
    );
    
}

export default TaskListContainer