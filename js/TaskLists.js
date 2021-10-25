
import 'isomorphic-unfetch';

async function getAllTaskLists(){
    const route = '/scheduling/taskLists/getAllTaskLists';
    try{
        var data = await fetch(route);
        if(!data.ok){
            throw new Error("GetTaskList returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function getTaskList(id){
    const route = '/scheduling/taskLists/getTaskList';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: id})
            });
        if(!data.ok){
            throw new Error("GetTaskList returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function getAllTaskListPerTask(t_id){
    const route = '/scheduling/taskLists/getAllTaskListPerTask';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: t_id})
            });
        if(!data.ok){
            throw new Error("getAllTaskListPerTask returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}


async function addTaskList(name){
    const route = '/scheduling/taskLists/addTaskList';
    try{
        var response = await fetch(route, 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({list_name: name})   
            });
        if(!response.ok){
            throw new Error("AddTaskList bad response or query")
        }
        var id = await response.json();
        return(id[0].last_id);
    }catch(error){
        throw error;
    }
}

async function removeTaskList(id){
    const route = '/scheduling/taskLists/removeTaskList';
    try{
        var response = await fetch(route, 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: id})   
            });
        
        return response.ok;
    }catch(error){
        throw error;
    }
}

async function updateTaskList(taskList){
    const route = '/scheduling/taskLists/updateTaskList';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({taskList: taskList})
            });
            return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }
}

async function addTaskToList(task_id, taskList_id){
    const route = '/scheduling/taskLists/addTaskToList';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: task_id, tl_id: taskList_id})
            });
            return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }
}

async function addMultipleTasksToList(task_ids, taskList_id, user){
    const route = '/scheduling/taskLists/addMultipleTasksToList';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ids: task_ids, tl_id: taskList_id, user})
            });
            return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }

}

async function removeTaskFromList(task_id, taskList_id){
    const route = '/scheduling/taskLists/removeTaskFromList';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: task_id, tl_id: taskList_id})
            });
        return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }

}

async function moveTaskToList(task_id, taskList_id, user){
    const route = '/scheduling/taskLists/moveTaskToList';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: task_id, tl_id: taskList_id, user})
            });
        return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }

}

async function removeMultipleFromList(task_ids, taskList_id, user){
    const route = '/scheduling/taskLists/removeMultipleFromList';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ids: task_ids, tl_id: taskList_id, user})
            });
        return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }

}

//Maybe move call this in AddTaskToTaskList instead of calling in frontend
async function reorderTaskList(task_ids, taskList_id, user){
    const route = '/scheduling/taskLists/reorderTaskList';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ids: task_ids, tl_id: taskList_id, user})
            });
        return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }

}

async function setPriorityTaskList(task_list_id, task_list_name){
    const route = '/scheduling/taskLists/setPriorityTaskList';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({task_list_id: task_list_id, task_list_name: task_list_name})
            });
        return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }
}

async function getAllSignScbdWOIFromTL(id){
    const route = '/scheduling/taskLists/getAllSignScbdWOIFromTL';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({tl_id: id})
            });
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function copyTaskForNewType(t_id, new_type){
    const route = '/scheduling/taskLists/copyTaskForNewType';
    try{
        var response = await fetch(route, 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({t_id, new_type})   
            });
        if(!response.ok){
            throw new Error("copyTaskForNewType bad response or query")
        }
        var id = await response.json();
        return(id[0].last_id);
    }catch(error){
        throw error;
    }
}


module.exports = {
    getAllTaskLists: getAllTaskLists,
    getTaskList: getTaskList,
    getAllTaskListPerTask: getAllTaskListPerTask,
    addTaskList: addTaskList,
    addMultipleTasksToList: addMultipleTasksToList,
    removeTaskList: removeTaskList,
    updateTaskList: updateTaskList,
    addTaskToList: addTaskToList,
    removeTaskFromList: removeTaskFromList,
    moveTaskToList,
    removeMultipleFromList:removeMultipleFromList,
    reorderTaskList: reorderTaskList,
    setPriorityTaskList: setPriorityTaskList,
    getAllSignScbdWOIFromTL,
    copyTaskForNewType,
};