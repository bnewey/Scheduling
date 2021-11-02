import 'isomorphic-unfetch';

async function getNotificationsForUser(id){
    const route = '/scheduling/notifications/getNotificationsForUser';
    //console.log("order", id)
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: id})
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


async function updateNotificationsViewed(items){
    const route = '/scheduling/notifications/updateNotificationsViewed';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({items})
            });
        var list = data.ok;
        return(list);
    }catch(error){
        throw error;
    }

}

// async function deleteOrderOutApprover(id){
//     const route = '/scheduling/notifications/deleteOrderOutApprover';
//     try{
//         var data = await fetch(route,
//             {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({id})
//             });
//         var list = await data.json();
//         return(list);
//     }catch(error){
//         throw error;
//     }

// }

// async function addNewOrderOutApprover(orderOut_item){
//     const route = '/scheduling/notifications/addNewOrderOutApprover';
//     try{
//         var data = await fetch(route,
//             {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({orderOut_item})
//             });
//         var list = await data.json();
//         return(list);
//     }catch(error){
//         throw error;
//     }

// }

// async function addNewNotificationSetting(orderOut_item){
//     const route = '/scheduling/notifications/addNewNotificationSetting';
//     try{
//         var data = await fetch(route,
//             {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({orderOut_item})
//             });
//         var list = await data.json();
//         return(list);
//     }catch(error){
//         throw error;
//     }
    
// }


module.exports = {

    getNotificationsForUser,
    updateNotificationsViewed,
    // deleteOrderOutApprover,
    // addNewOrderOutApprover,

};