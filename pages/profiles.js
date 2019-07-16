import React from 'react'
import 'isomorphic-unfetch'

import MainLayout from '../components/Layouts/Main'


//Check between for client or server
let conditionalDataProvider = null;
if (process.browser) { //client
    conditionalDataProvider = async (req) => {	
        try{
            const baseUrl = await req ? `${req.protocol}://${req.get('Host')}` : '';
            const res = await eval("fetch('" + baseUrl + "/api/profiles')");
            let profiles = await res.json();
            return profiles;
        }
            catch(error){
            console.log(error);
        }
    }
} else { //server
	conditionalDataProvider = async (req) => {	
        /*try{
            const pool = await eval("require('" + SERVER_APP_ROOT + "/lib/db')");
            
            await pool.query('SELECT * from profiles', async function (error, results, fields) {
                
                try{
                    if(error){
                        console.log(error);
                        return error;
                    } else {
                        let profiles = await JSON.parse(JSON.stringify(results));
                        console.log(profiles);
                        return profiles;
                    }
                } catch(error){
                    console.log(error);
                }
            });
        } catch(error){
            console.log(error);
        }
      */
     // until i figure out how to get results from mysql call, im using api; not sure if i even need to not use api
        try{
            const baseUrl = await req ? `${req.protocol}://${req.get('Host')}` : '';
            const res = await eval("fetch('" + baseUrl + "/api/profiles')");
            let profiles = await res.json();
            return profiles;
        }
            catch(error){
            console.log(error);
        }
	
    }
}

export default class Profiles extends React.Component {
	static async getInitialProps({req}) {
        try{
            let profiles = await conditionalDataProvider(req);
            return {profiles}
        } catch(error){
            console.log(error);
        }
    }

	render() {
    return (
        <MainLayout>
            <h1>Profile list</h1>
            <ul>
                {this.props.profiles.map((profile, i) => {
                    return (
                        <li key={'profile-' + i}>{profile.name}</li>
                    )
                })}
            </ul>
        </MainLayout>
    )
}
}