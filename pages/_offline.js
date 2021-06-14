import React, { useEffect , useState} from 'react'
import PropTypes from 'prop-types';

import MainLayout from '../components/Layouts/Main';



const Offline = function (props) {
    
    const {user} = props;

    return (
        <MainLayout>
              <h1>You are offline!</h1>
        </MainLayout>
    );
}

//does work when were being passed props 
// Offline.getInitialProps = async ({ query }) => ({ settings: query.settings });

// Offline.propTypes = {
//   settings: PropTypes.shape({
//     results: PropTypes.array.isRequired,
//   }),
// };

Offline.defaultProps = {
  settings: null,
};

export default Index;