
import 'isomorphic-unfetch';

async function getAllTaskLists(){
    const route = '/taskLists/getAllTaskLists';
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
    const route = '/taskLists/getTaskList';
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

async function addTaskList(name){
    const route = '/taskLists/addTaskList';
    try{
        var response = await fetch(route, 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({list_name: name})   
            });
        
        return response.ok;
    }catch(error){
        throw error;
    }
}

async function removeTaskList(id){
    const route = '/taskLists/removeTaskList';
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
    const route = '/taskLists/updateTaskList';
    try{
        var reponse = await fetch(route,
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
    const route = '/taskLists/addTaskToList';
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

async function removeTaskFromList(taskList_id){
    const route = '/taskLists/removeTaskFromList';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: taskList_id})
            });
        return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }

}

//Maybe move call this in AddTaskToTaskList instead of calling in frontend
async function reorderTaskList(task_ids, taskList_id){
    const route = '/taskLists/reorderTaskList';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ids: task_ids, tl_id: taskList_id})
            });
            console.log("Response");
        console.log(response);
        return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }

}



module.exports = {
    getAllTaskLists: getAllTaskLists,
    getTaskList: getTaskList,
    addTaskList: addTaskList,
    removeTaskList: removeTaskList,
    updateTaskList: updateTaskList,
    addTaskToList: addTaskToList,
    removeTaskFromList: removeTaskFromList,
    reorderTaskList: reorderTaskList,
};