import React from 'react'

import MainLayout from '../components/Layouts/Main';
import Link from 'next/link';

import Ui from '../components/Machine/Ui'

import socketIOClient from 'socket.io-client'

const PostLink = props => (
    <li>
        <Link href={`${props.id}`}>
            <a>{props.title}</a>
        </Link>
    </li>
);


export default class Index extends React.Component {


    componentDidMount(){
       
    }
    componentWillUnmount(){
       
    }

    render() {

                
        return (
            <MainLayout>
                <h1>Nitrogen Machine</h1>
                <ul>
                    <PostLink id="machineData" title="List of Machines"/>
                </ul>
                
                <Ui />

            </MainLayout>
        );
    }

 
}



