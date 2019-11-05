import React from 'react'
import 'isomorphic-unfetch'

import Layout from '../components/Layouts/Main'
import DenseTable from '../components/Machine/DenseTable';
import IndexHead from '../components/UI/IndexHead.js';
import MachineChart from '../components/Machine/MachineChart.js';
import CircularProgress from '@material-ui/core/CircularProgress';

import socketIOClient from 'socket.io-client';


export default class MachineData extends React.Component {
	static async getInitialProps({req}) {

    }

    constructor(props){
        super(props);

        this.state = {
            rows: "",
            endpoint: "10.0.0.109:8000"
          };

    }
    componentDidMount(){
        //_isMounted checks if the component is mounted before calling api to prevent memory leak
          this._isMounted = true;
          const { endpoint } = this.state;
          const socket = socketIOClient(endpoint);
          socket.on("FromC", async data => {
              if(this._isMounted) {
                var json = await JSON.parse(data);
                this.setState({ rows: json.machines });
              }
          }); 
      }
  
      componentWillUnmount(){
          this._isMounted = false;
      }

	render() {
        const  rows   = this.state.rows;
        
        return (
            <Layout>
                <IndexHead>Machines List</IndexHead>
                <DenseTable />
                {rows  ?  <div><MachineChart rows={rows}/></div> : <div><CircularProgress style={{marginLeft: "47%"}} /></div>}
            </Layout>
        )
    }
}

