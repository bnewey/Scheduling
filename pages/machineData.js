import React from 'react'
import 'isomorphic-unfetch'

import Layout from '../components/Layouts/Main'
import DenseTable from '../components/Machine/DenseTable';
import IndexHead from '../components/UI/IndexHead.js';
import MachineChart from '../components/Machine/MachineChart.js';
import CircularProgress from '@material-ui/core/CircularProgress';

import socketIOClient from 'socket.io-client';

import getConfig from 'next/config';
const {publicRuntimeConfig} = getConfig();
const {ENDPOINT_PORT} = publicRuntimeConfig;


export default class MachineData extends React.Component {
    constructor(props){
        super(props);
        var endpoint = "10.0.0.109:" + ENDPOINT_PORT;
        this.state = {
            rows: "",
            endpoint: endpoint,
            socket: socketIOClient(endpoint),
          };

    }
    componentDidMount(){
        //_isMounted checks if the component is mounted before calling api to prevent memory leak
          this._isMounted = true;
          const { endpoint, socket } = this.state;
          socket.on("FromC", async data => {
              if(this._isMounted) {
                var json = await JSON.parse(data);
                this.setState({ rows: json.machines });
              }
          }); 
      }
  
      componentWillUnmount(){
          const {socket} = this.state;
          this._isMounted = false;

          socket.disconnect();
      }

	render() {
        const  rows   = this.state.rows;
        
        return (
            <Layout>
                <IndexHead>Machines List</IndexHead>
                {rows ? <div><DenseTable rows={rows} /></div> : <div><CircularProgress style={{marginLeft: "47%"}} /></div> }
                {rows  ? <div><MachineChart rows={rows}/></div> : <div><CircularProgress style={{marginLeft: "47%"}} /></div>}
            </Layout>
        )
    }
}

