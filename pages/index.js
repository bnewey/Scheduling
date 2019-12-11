import React from 'react'
import PropTypes from 'prop-types';

import MainLayout from '../components/Layouts/Main';

import Ui from '../components/Machine/Ui';
import IndexHead from '../components/UI/IndexHead';

import TempWriteInput from '../components/Machine/TempWriteInput';
import WithData from '../components/Machine/WithData';

const Index = function ({rows, endpoint, socket, settings} ) {
    
    return (
        <MainLayout>
            <IndexHead >Nitrogen Display</IndexHead>
            <TempWriteInput socket={socket}/>
            <Ui rows={rows} socket={socket} endpoint={endpoint}/>
        </MainLayout>
    );
}

//does work when were being passed props 
Index.getInitialProps = async ({ query }) => ({ settings: query.settings });

Index.propTypes = {
  settings: PropTypes.shape({
    results: PropTypes.array.isRequired,
  }),
};

Index.defaultProps = {
  settings: null,
};

export default WithData(Index);