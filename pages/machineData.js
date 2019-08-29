import React from 'react'
import 'isomorphic-unfetch'

import Layout from '../components/Layouts/Main'
import DenseTable from '../components/Machine/DenseTable';
import IndexHead from '../components/UI/IndexHead.js';


export default class MachineData extends React.Component {
	static async getInitialProps({req}) {

    }

	render() {
        return (
            <Layout>
                <IndexHead>Machines List</IndexHead>
                <DenseTable />
            </Layout>
        )
    }
}

