import React from 'react'

import MainLayout from '../components/Layouts/Main';
import Link from 'next/link';

import Ui from '../components/Machine/Ui';
import IndexHead from '../components/UI/IndexHead';

export default class Index extends React.Component {


    componentDidMount(){
       
    }
    componentWillUnmount(){
       
    }

    render() {           
        return (
            <MainLayout>
                <IndexHead />
                
                <Ui />

            </MainLayout>
        );
    }

 
}



