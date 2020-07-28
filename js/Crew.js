import 'isomorphic-unfetch';

async function addCrewMember(name){
    const route = '/scheduling/crew/addCrewMember';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name})
            });
        return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }
}

async function deleteCrewMember(id){
    const route = '/scheduling/crew/deleteCrewMember';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id})
            });
        return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }
}

async function updateCrewMember(name,id){
    const route = '/scheduling/crew/updateCrewMember';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name, id})
            });
        return response.ok;
    }catch(error){
        throw error;
    }
}


async function getCrewMembers(){
    const route = '/scheduling/crew/getCrewMembers';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        if(!data.ok){
            throw new Error("getCrewMembers returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function getCrewMembersByTask(id){
    const route = '/scheduling/crew/getCrewMembersByTask';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id})
            });
        if(!data.ok){
            throw new Error("getCrewMembersByTask returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function getCrewMembersByCrew(crew_id){
    const route = '/scheduling/crew/getCrewMembersByCrew';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({crew_id})
            });
        if(!data.ok){
            throw new Error("getCrewMembersByCrew returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function getCrewJobsByMember(id){
    const route = '/scheduling/crew/getCrewJobsByMember';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id})
            });
        if(!data.ok){
            throw new Error("getCrewJobsByMember returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function getCrewJobsByTask(id){
    const route = '/scheduling/crew/getCrewJobsByTask';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id})
            });
        if(!data.ok){
            throw new Error("getCrewJobsByTask returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function getCrewJobsByTaskIds(ids, job_type){
    const route = '/scheduling/crew/getCrewJobsByTaskIds';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids, job_type})
            });
        if(!data.ok){
            throw new Error("getCrewJobsByTaskIds returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}


async function getAllCrewJobMembers(){
    const route = '/scheduling/crew/getAllCrewJobMembers';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        if(!data.ok){
            throw new Error("getAllCrewJobMembers returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function addNewCrewJobMember(member_id, crew_id, is_leader){
    const route = '/scheduling/crew/addNewCrewJobMember';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({member_id, crew_id, is_leader})
            });
        return await response.json();
    }catch(error){
        console.log(error);
        throw error;
    }
}

async function deleteCrewJobMember(m_id, crew_id){
    const route = '/scheduling/crew/deleteCrewJobMember';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({m_id, crew_id})
            });
        return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }
}

async function getAllCrewJobs(){
    const route = '/scheduling/crew/getAllCrewJobs';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        if(!data.ok){
            throw new Error("getAllCrewJobs returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function addCrewJobs(ids, job_type, crew_id){
    const route = '/scheduling/crew/addCrewJobs';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ids, job_type, crew_id})
            });
        return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }
}

async function deleteCrewJob(id){
    const route = '/scheduling/crew/deleteCrewJob';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id})
            });
        return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }
}

async function updateCrewJob(  crew_id,job_id){
    const route = '/scheduling/crew/updateCrewJob';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({job_id,  crew_id})
            });
        return response.ok;
    }catch(error){
        throw error;
    }
}

async function updateCrewJobMember(crew_id, member_id, is_leader, job_id){
    const route = '/scheduling/crew/updateCrewJobMember';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ crew_id, member_id, is_leader, job_id})
            });
        return response.ok;
    }catch(error){
        throw error;
    }
}

async function addNewCrew(){
    const route = '/scheduling/crew/addNewCrew';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        return await response.json();
    }catch(error){
        console.log(error);
        throw error;
    }
}

async function deleteCrew(crew_id){
    const route = '/scheduling/crew/deleteCrew';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({crew_id})
            });
        return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }
}

async function getAllCrews(){
    const route = '/scheduling/crew/getAllCrews';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        if(!data.ok){
            throw new Error("getAllCrews returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}

async function getCrewJobsByCrew(id){
    const route = '/scheduling/crew/getCrewJobsByCrew';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ crew_id: id})
            });
        if(!data.ok){
            throw new Error("getCrewJobsByCrew returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }
}



module.exports = {
    addCrewMember,
    deleteCrewMember,
    updateCrewMember,
    getCrewMembers,
    getCrewJobsByMember,
    getCrewJobsByTask,
    getCrewJobsByTaskIds,
    getCrewMembersByTask,
    getCrewMembersByCrew,
    getAllCrewJobMembers,
    addNewCrewJobMember,
    deleteCrewJobMember,
    getAllCrewJobs,
    addCrewJobs,
    deleteCrewJob,
    updateCrewJob,
    updateCrewJobMember,
    addNewCrew,
    deleteCrew,
    getAllCrews,
    getCrewJobsByCrew,


};