import React, { useEffect , useState} from 'react'
import PropTypes from 'prop-types';

import MainLayout from '../components/Layouts/Main';
import withAuth from '../server/lib/withAuth';

import TaskContainer from '../components/Scheduler/TaskContainer';


const Index = function (props) {
    
    const {user} = props;

    return (
        <MainLayout>
              <TaskContainer user={user}/>
        </MainLayout>
    );
}

//does work when were being passed props 
// Index.getInitialProps = async ({ query }) => ({ settings: query.settings });

// Index.propTypes = {
//   settings: PropTypes.shape({
//     results: PropTypes.array.isRequired,
//   }),
// };

Index.defaultProps = {
  settings: null,
};

export default(Index);