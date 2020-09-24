import React from 'react'
import PropTypes from 'prop-types';

import MainLayout from '../components/Layouts/Main';

import WorkOrderContainer from '../components/WorkOrders/otherPages/WorkOrderIndex/WorkOrderContainer';


const WorkOrders = function () {
    
    return (
        <MainLayout>
            <WorkOrderContainer />
        </MainLayout>
    );
}

//does work when were being passed props 
WorkOrders.getInitialProps = async ({ query }) => ({ settings: query.settings });

WorkOrders.propTypes = {
  settings: PropTypes.shape({
    results: PropTypes.array.isRequired,
  }),
};

WorkOrders.defaultProps = {
  settings: null,
};

export default WorkOrders;