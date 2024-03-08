
import 'isomorphic-unfetch';

async function getRaineyUsers(){
    const route = '/scheduling/settings/getRaineyUsers';
    try{
        var data = await fetch(route);
        if(!data.ok){
            throw new Error("GetRaineyUsers returned empty list or bad query")
        }
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }
}

async function getVisibleRaineyUsers(){
    const route = '/scheduling/settings/getVisibleRaineyUsers';
    try{
        var data = await fetch(route);
        if(!data.ok){
            throw new Error("GetVisibleRaineyUsers returned empty list or bad query")
        }
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }
}


async function getRaineyUserByID(user_id){
    const route = '/scheduling/settings/getRaineyUserByID';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({user_id})
            });
        if(!data.ok){
            throw new Error("getRaineyUserByID returned empty or bad list")
        }
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }
}

async function getGoogleUsers(){
    const route = '/scheduling/settings/getGoogleUsers';
    try{
        var data = await fetch(route);
        if(!data.ok){
            throw new Error("getGoogleUsers returned empty list or bad query")
        }
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }
}

async function getGoogleUserById(id){
    const route = '/scheduling/settings/getGoogleUserById';
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
            throw new Error("getGoogleUserById returned empty list or bad query")
        }
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }
}


async function updateUserPermissions( perm_string, id, user){
    const route = '/scheduling/settings/updateUserPermissions';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ perm_string, id, user })
        });

        if(!data.ok){
            throw new Error("updateUserPermissions returned empty list or bad query")
        }
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }
}

async function updateRaineyUser( user_id, is_visible, user){
    const route = '/scheduling/settings/updateRaineyUser';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id, is_visible, user })
        });
        
        if(!data.ok){
            throw new Error("updateRauneyUserV returned empty list or bad query")
        }
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }
}

async function updateRaineyUserVisibility( vis, id, user){
    const route = '/scheduling/settings/updateRaineyUserVisibility';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ vis, id, user })
        });
        
        if(!data.ok){
            throw new Error("updateRauneyUserVisibility returned empty list or bad query")
        }
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }
}

async function addRaineyUser(internal_user, user){
    const route = '/scheduling/settings/addRaineyUser';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({internal_user, user})
            });
            if(!data.ok){
                throw new Error("addRaineyUser returned empty list or bad query")
            }
            var list = await data.json();
            if(list?.user_error || list?.error){
                throw list;
            }
            return(list);
    }
    catch(error){
        throw error;
    }
}

async function getEntities(){
    const route = '/scheduling/settings/getEntities';
    try{
        var data = await fetch(route);
        if(!data.ok){
            throw new Error("getEntities returned empty list or bad query")
        }
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }
}


async function getEntitiesSearch(query){
    const route = '/scheduling/settings/getEntitiesSearch';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({query})
        });

        if(!data.ok){
            throw new Error("getEntitiesSearch returned empty list or bad query")
        }
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }
}

async function getEntityNameById(id){
    const route = '/scheduling/settings/getEntityNameById';
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
            throw new Error("getEntityNameById returned empty list or bad query")
        }
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }
}




async function getPastScoreboardParams(column){
    const route = '/scheduling/settings/getPastScoreboardParams';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({column})
        });

        if(!data.ok){
            throw new Error("getPastScoreboardParams returned empty list or bad query")
        }
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }
}

async function getTaskUserFilters(user_id){
    const route = '/scheduling/settings/getTaskUserFilters';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({user_id})
        });
        if(!data.ok){
            throw new Error("getTaskUserFilters returned empty list or bad query")
        }
        var list = await data.json();
        // if(list?.user_error || list?.error){
        //     throw list;
        // }
        console.log("list", list);
        return(list);
    }catch(error){
        throw error;
    }
}

async function addSavedTaskFilter( name, user_id, filterAndOr, filterInOrOut, filters, task_view){
    const route = '/scheduling/settings/addSavedTaskFilter';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, user_id, filterAndOr, filterInOrOut, filters, task_view })
        });

        if(!data.ok){
            throw new Error("addSavedTaskFilter returned empty list or bad query")
        }
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }
}
 

async function overwriteSavedTaskFilter( filter_id, name, user_id, filterAndOr, filterInOrOut, filters){
    const route = '/scheduling/settings/overwriteSavedTaskFilter';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filter_id, name, user_id, filterAndOr, filterInOrOut, filters })
        });

        if(!data.ok){
            throw new Error("overwriteSavedTaskFilter returned empty list or bad query")
        }
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }
}

// async function updateFilterTaskViewSubscribe( filter_id, sub_types){
//     const route = '/scheduling/settings/updateFilterTaskViewSubscribe';
//     try{
//         var data = await fetch(route,
//         {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ filter_id, sub_types})
//         });

//         if(!data.ok){
//             throw new Error("updateFilterTaskViewSubscribe returned empty list or bad query")
//         }
//         var list = await data.json();
//         return(list);
//     }catch(error){
//         throw error;
//     }
// }


async function updateFilterTaskViewTie( filter_id,task_view){
    const route = '/scheduling/settings/updateFilterTaskViewTie';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filter_id, task_view })
        });

        if(!data.ok){
            throw new Error("updateFilterTaskViewTie returned empty list or bad query")
        }
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }
}

async function removedSavedFilter( filter_id){
    const route = '/scheduling/settings/removedSavedFilter';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filter_id })
        });

        if(!data.ok){
            throw new Error("removedSavedFilter returned empty list or bad query")
        }
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }
}

async function addNotificationSetting( setting){
    const route = '/scheduling/settings/addNotificationSetting';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ setting })
        });

        if(!data.ok){
            throw new Error("addNotificationSetting returned empty list or bad query")
        }
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }
}

async function updateNotificationSetting( setting){
    const route = '/scheduling/settings/updateNotificationSetting';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ setting })
        });

        if(!data.ok){
            throw new Error("updateNotificationSetting returned empty list or bad query")
        }
        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }
}

async function getNotificationSettings( googleId, page){
    const route = '/scheduling/settings/getNotificationSettings';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({  googleId, page })
        });

        var list = await data.json();
        if(list?.user_error || list?.error){
            throw list;
        }
        return(list);
    }catch(error){
        throw error;
    }
}


module.exports = {
    getRaineyUsers,
    getVisibleRaineyUsers,
    getRaineyUserByID,
    updateRaineyUser,
    updateRaineyUserVisibility,
    addRaineyUser,
    getGoogleUsers,
    getGoogleUserById,
    updateUserPermissions,
    getEntities,
    getEntityNameById,
    getEntitiesSearch,
    getPastScoreboardParams,
    getTaskUserFilters,
    addSavedTaskFilter,
    overwriteSavedTaskFilter,
    // updateFilterTaskViewSubscribe,
    updateFilterTaskViewTie,
    removedSavedFilter,
    addNotificationSetting,
    updateNotificationSetting,
    getNotificationSettings,
};