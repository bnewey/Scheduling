import React from 'react'
import PropTypes from 'prop-types';

import MainLayout from '../components/Layouts/Main';

import IndexHead from '../components/UI/IndexHead';

import TaskContainer from '../components/Scheduler/Table/TaskContainer';

const Index = function () {
    
    return (
        <MainLayout>
          
            <IndexHead image={`static/icons8-schedule-40.png`}>Schedule</IndexHead>
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