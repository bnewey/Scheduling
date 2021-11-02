
import 'isomorphic-unfetch';

async function getAllEntities(){
    const route = '/scheduling/entities/getAllEntities';
    try{
        var data = await fetch(route,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(!data.ok){
            throw new Error("getAllEntities returned empty list or bad query")
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

async function searchAllEntities(table, query){
    const route = '/scheduling/entities/searchAllEntities';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({table: table, search_query: query})
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

async function getEntityById(ent_id){
    const route = '/scheduling/entities/getEntityById';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_id})
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

async function updateEntity(entity, user){
    const route = '/scheduling/entities/updateEntity';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({entity, user})
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

async function addEntity(entity, user){
    const route = '/scheduling/entities/addEntity';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({entity, user})
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

async function deleteEntity(ent_id, user){
    const route = '/scheduling/entities/deleteEntity';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_id, user})
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

async function getDefaultContacts(ent_id){
    const route = '/scheduling/entities/getDefaultContacts';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_id})
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

async function getDefaultAddresses(ent_id){
    const route = '/scheduling/entities/getDefaultAddresses';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_id})
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


async function getDefaultAddressesForContact(ent_id, contact_id){
    const route = '/scheduling/entities/getDefaultAddressesForContact';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_id, contact_id})
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

async function getEntityTypes(){
    const route = '/scheduling/entities/getEntityTypes';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
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

async function getEntAddresses(ent_id){
    const route = '/scheduling/entities/getEntAddresses';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_id})
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

async function getEntAddressById(ent_add_id){
    const route = '/scheduling/entities/getEntAddressById';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_add_id})
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

async function updateEntityAddress(ent_add, user){
    const route = '/scheduling/entities/updateEntityAddress';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_add,user})
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

async function addEntityAddress(ent_add, user){
    const route = '/scheduling/entities/addEntityAddress';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_add, user})
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

async function deleteEntityAddress(ent_add_id, user){
    const route = '/scheduling/entities/deleteEntityAddress';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_add_id, user})
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

async function getEntContacts(ent_id){
    const route = '/scheduling/entities/getEntContacts';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_id})
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

async function getEntContactById(ent_cont_id){
    const route = '/scheduling/entities/getEntContactById';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_cont_id})
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

async function updateEntityContact(ent_cont, user){
    const route = '/scheduling/entities/updateEntityContact';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_cont, user})
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

async function addEntityContact(ent_cont, user){
    const route = '/scheduling/entities/addEntityContact';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_cont, user})
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

async function deleteEntityContact(ent_cont_id, user){
    const route = '/scheduling/entities/deleteEntityContact';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_cont_id, user})
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

async function getEntContactTitles(ent_id, cont_id){
    const route = '/scheduling/entities/getEntContactTitles';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_id, cont_id})
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

async function deleteContactTitle(title_id, user){
    const route = '/scheduling/entities/deleteContactTitle';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({title_id, user})
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
async function addContactTitle(title_data, user){
    const route = '/scheduling/entities/addContactTitle';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({title_data, user})
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

async function getEntRelatedWorkOrders(ent_id){
    const route = '/scheduling/entities/getEntRelatedWorkOrders';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ent_id})
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
    getAllEntities,
    searchAllEntities,
    getEntityById,
    updateEntity,
    addEntity,
    deleteEntity,
    getDefaultContacts,
    getDefaultAddresses,
    getDefaultAddressesForContact,
    getEntityTypes,
    getEntAddresses,
    getEntAddressById,
    updateEntityAddress,
    addEntityAddress,
    deleteEntityAddress,
    getEntContacts,
    getEntContactById,
    updateEntityContact,
    addEntityContact,
    deleteEntityContact,
    getEntContactTitles,
    deleteContactTitle,
    addContactTitle,
    getEntRelatedWorkOrders
};