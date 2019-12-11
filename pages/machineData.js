import React from 'react'
import 'isomorphic-unfetch'

import Layout from '../components/Layouts/Main'
import DenseTable from '../components/Machine/DenseTable';
import IndexHead from '../components/UI/IndexHead.js';
import MachineChart from '../components/Machine/MachineChart.js';
import ReconnectSnack from '../components/UI/ReconnectSnack';
import CircularProgress from '@material-ui/core/CircularProgress';

import socketIOClient from 'socket.io-client';

import getConfig from 'next/config';
import WithData from '../components/Machine/WithData';
const {publicRuntimeConfig} = getConfig();
const {ENDPOINT_PORT} = publicRuntimeConfig;


class MachineData extends React.Component {

	render() {
        //Gets these props from withData.js HOC
        const {rows, endpoint, socket} = this.props;
        return (
            <Layout>
                <IndexHead>Machine Data</IndexHead>
                {rows ? <div><DenseTable rows={rows} /></div> : <div><CircularProgress style={{marginLeft: "47%"}} /></div>}
                {rows  ? <div><MachineChart rows={rows}/></div> : <div><CircularProgress style={{marginLeft: "47%"}} /></div>}
                <ReconnectSnack socket={socket}/>
            </Layout>
        )
    }
}

export default WithData(MachineData);