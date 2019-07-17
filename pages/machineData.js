import React from 'react'
import 'isomorphic-unfetch'

import Layout from '../components/Layouts/Main'
import DenseTable from '../components/Machine/DenseTable';



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

