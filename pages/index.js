import React from 'react'

import MainLayout from '../components/Layouts/Main';
import Link from 'next/link';
import Profiles from './profiles';

import Machines from '../components/Machine/Ui'

import socketIOClient from 'socket.io-client'

const PostLink = props => (
    <li>
        <Link href={`${props.id}`}>
            <a>{props.title}</a>
        </Link>
    </li>
);




export default class Index extends React.Component {

    _isMounted = false;

    //disperse data to specific machines here
    constructor(props){
        super(props);
        this.state = {
          rows: "",
          endpoint: "http://localhost:4000"
        };
        
    }

    componentDidMount(){
        //_isMounted checks if the component is mounted before calling api to prevent memory leak
        this._isMounted = true;
        const { endpoint } = this.state;
        const socket = socketIOClient(endpoint);
        socket.on("FromC", async data => {
            if(this._isMounted) {
                this.setState({ rows: data });
            }
        }); 
    }
    componentWillUnmount(){
        this._isMounted = false;
    }

    render() {

        const  rows   = this.state.rows;        
        return (
            <MainLayout>
                <h1>Nitrogen Machine {rows} </h1>
                <ul>
                    <PostLink id="machineData" title="List of Machines"/>
                    <PostLink id="profiles" title="List of Profiles"/>
                </ul>
                
                <Machines />

            </MainLayout>
        );
    }

 
}



