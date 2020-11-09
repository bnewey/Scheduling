import React, { useEffect , useState} from 'react'
import PropTypes from 'prop-types';

import MainLayout from '../components/Layouts/Main';
import withAuth from '../server/lib/withAuth';


import EntitiesContainer from '../components/Entities/EntitiesContainer';

const Entities = function (props) {
    
    const {user} = props;

    return (
        <MainLayout>
              <WOContainer user={user}/>
        </MainLayout>
    );
}

//does work when were being passed props 
// Entities.getInitialProps = async ({ query }) => ({ settings: query.settings });

// Entities.propTypes = {
//   settings: PropTypes.shape({
//     results: PropTypes.array.isRequired,
//   }),
// };

Entities.defaultProps = {
  settings: null,
};

export default withAuth(Entities);