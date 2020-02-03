
import 'isomorphic-unfetch';

async function getAllTasks(){
    const route = '/tasks/getAllTasks';
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

async function getTask(t_id){
    const route = '/tasks/getTask';
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
            throw new Error("GetTaskList returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function removeTask(t_id){
    const route = '/tasks/removeTask';
    try{
        var response = await fetch(route, 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: t_id})   
            });
        return response.ok;
    }catch(error){
        throw error;
        
    }

}

async function updateTask(task){
    const route = '/tasks/updateTask';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({task: task})
            });
            return response.ok;
    }catch(error){
        throw error;
    }

}

module.exports = {
    getAllTasks: getAllTasks,
    getTask: getTask,
    removeTask: removeTask,
    updateTask: updateTask,
};