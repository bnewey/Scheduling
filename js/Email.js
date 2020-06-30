
import 'isomorphic-unfetch';


async function sendEmail(email, text){
    const route = '/scheduling/email/email';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({email, text})
            });
        if(!response.ok){
            throw new Error("Email error. Server returned bad response")
        }
        return(response.ok);
    }catch(error){
        throw error;
    }

}



module.exports = {
    sendEmail: sendEmail,
    
};