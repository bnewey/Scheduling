import React from 'react'
import PropTypes from 'prop-types';

import MainLayout from '../components/Layouts/Main';
import Link from 'next/link';

import Ui from '../components/Machine/Ui';
import IndexHead from '../components/UI/IndexHead';

import TempWriteInput from '../components/Machine/TempWriteInput';


import withData from '../components/Machine/WithData';

class Index extends React.Component {


  render(){ 
    //Gets these props from withData.js HOC
    const {rows, endpoint, socket} = this.props;

    return (
        <MainLayout>
            <IndexHead >Nitrogen Display</IndexHead>
            <TempWriteInput socket={socket}/>
            <Ui rows={rows} socket={socket} endpoint={endpoint}/>     
        </MainLayout>
    );
  }
}

export default withData(Index);



