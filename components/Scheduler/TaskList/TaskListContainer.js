import React, { useState, useContext, useEffect} from 'react';

import TaskListMain from '../TaskList/TaskListMain';

import TaskModal from '../TaskModal/TaskModal';
import { TaskContext } from '../TaskContainer';


//we can make this a functional component now
const TaskListContainer = function(props) {
    const {taskListToMap, modalOpen, setModalOpen, setModalTaskId, taskLists} = useContext(TaskContext);
    
    const [openTaskList, setOpenTaskList] = useState(taskListToMap ? taskListToMap : null);
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const [priorityList, setPriorityList] = useState(null);

    //Sets PriorityList so that we can easily show
    useEffect(()=>{
        if(taskLists){
            setPriorityList(taskLists.filter((list)=>(list.is_priority))[0]);
        }
    }, [taskLists])

    return (
    <div>
        <TaskListMain modalOpen={modalOpen} setModalOpen={setModalOpen} 
                    setModalTaskId={setModalTaskId}
                    openTaskList={openTaskList} setOpenTaskList={setOpenTaskList}
                    isPriorityOpen={isPriorityOpen} setIsPriorityOpen={setIsPriorityOpen}
                    priorityList={priorityList} setPriorityList={setPriorityList}/>
    </div>
    );
}

export default TaskListContainer