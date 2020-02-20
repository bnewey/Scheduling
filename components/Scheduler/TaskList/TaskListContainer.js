import React, { useState} from 'react';

import TaskListMain from '../TaskList/TaskListMain';

import TaskModal from '../Table/TaskModal/TaskModal';


//we can make this a functional component now
const TaskListContainer = function(props) {
    const [activeTaskList, setActiveTaskList] = useState();
    const [modalOpen, setModalOpen] = React.useState(false);  
    const [modalTaskId, setModalTaskId] = React.useState(); 

    return (
    <div>
        <TaskListMain modalOpen={modalOpen} setModalOpen={setModalOpen} 
                    setModalTaskId={setModalTaskId}
                    activeTaskList={activeTaskList} setActiveTaskList={setActiveTaskList}/>
        <TaskModal modalOpen={modalOpen} setModalOpen={setModalOpen} 
                    modalTaskId={modalTaskId} setModalTaskId={setModalTaskId}/>
    </div>
    );
}

export default TaskListContainer