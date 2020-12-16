import React, { useState, useContext, useEffect} from 'react';

import TaskListMain from '../TaskList/TaskListMain';

import TaskModal from '../TaskModal/TaskModal';
import { TaskContext } from '../TaskContainer';


//we can make this a functional component now
const TaskListContainer = function(props) {
    const {taskListToMap, setTaskListToMap,  modalOpen, setModalOpen, setModalTaskId, taskLists} = useContext(TaskContext);
    
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const [priorityList, setPriorityList] = useState(null);
    const [woiData, setWoiData] = useState(null)


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
                    taskListToMap={taskListToMap} setTaskListToMap={setTaskListToMap}
                    isPriorityOpen={isPriorityOpen} setIsPriorityOpen={setIsPriorityOpen}
                    priorityList={priorityList} setPriorityList={setPriorityList} woiData={woiData} setWoiData={setWoiData}/>
    </div>
    );
}

export default TaskListContainer