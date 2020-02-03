import React from 'react'
import PropTypes from 'prop-types';

import MainLayout from '../components/Layouts/Main';


import TaskContainer from '../components/Scheduler/Table/TaskContainer';

const Index = function () {
    
    return (
        <MainLayout>
              <TaskContainer/>
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

export default Index;