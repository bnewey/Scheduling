
import 'isomorphic-unfetch';


async function uploadImage(media_item, fileData, user_id){
    const route = '/images/uploadImage';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({media_item,fileData, user_id})
            });
            return response.ok;
    }catch(error){
        throw error;
    }
}



module.exports = {
    uploadImage, 

};