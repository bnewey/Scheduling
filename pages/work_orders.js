import React from 'react'
import PropTypes from 'prop-types';

import MainLayout from '../components/Layouts/Main';

import IndexHead from '../components/UI/IndexHead';


const WorkOrders = function () {
    
    return (
        <MainLayout>
            <IndexHead image={`static/survey_40.png`}>Work Orders</IndexHead>
            
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