
import 'isomorphic-unfetch';


//BOUNCIE STUFF
async function getCalendar(){
    console.log("at least here");
    const route = '/scheduling/calendar/getCalendar';
    try{
        var data = await fetch(route,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        if(!data.ok){
            throw new Error("getCalendar returned empty list or bad query")
        }
        //console.log("data from getCalendar", await data.json());
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

module.exports = {
    getCalendar,
};