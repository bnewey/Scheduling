import React from 'react'
import 'isomorphic-unfetch'

import Layout from '../components/Layouts/Main'
import DenseTable from '../components/Machine/DenseTable';



//Check between for client or server
let conditionalDataProvider = null;
if (process.browser) { //client
    conditionalDataProvider = async (req) => {	
        try{
            const baseUrl = await req ? `${req.protocol}://${req.get('Host')}` : '';
            const res = await eval("fetch('" + baseUrl + "/api/machines')");
            let machines = await res.json();
            return machines;
        }
            catch(error){
            console.log(error);
        }
    }
} else { //server
	conditionalDataProvider = async (req) => {	
        /*try{
            const pool = await eval("require('" + SERVER_APP_ROOT + "/lib/db')");
            
            await pool.query('SELECT * from machines', async function (error, results, fields) {
                
                try{
                    if(error){
                        console.log(error);
                        return error;
                    } else {
                        let machines = await JSON.parse(JSON.stringify(results));
                        console.log(machines);
                        return machines;
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
            const res = await eval("fetch('" + baseUrl + "/api/machines')");
            let machines = await res.json();
            return machines;
        }
            catch(error){
            console.log(error);
        }
	
    }
}

export default class MachineData extends React.Component {
	static async getInitialProps({req}) {

    }

	render() {
        return (
            <Layout>
                <DenseTable />
            </Layout>
        )
    }
}

