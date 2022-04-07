import React, { useEffect , useState} from 'react'
import PropTypes from 'prop-types';

import MainLayout from '../components/Layouts/Main';
import withAuth from '../server/lib/withAuth';


import InventoryContainer from '../components/Inventory/InventoryContainer';

const Inventory = function (props) {
    
    const {user} = props;

    return (
        <MainLayout>
              <InventoryContainer user={user}/>
        </MainLayout>
    );
}

//does work when were being passed props 
// WorkOrders.getInitialProps = async ({ query }) => ({ settings: query.settings });

// WorkOrders.propTypes = {
//   settings: PropTypes.shape({
//     results: PropTypes.array.isRequired,
//   }),
// };

Inventory.defaultProps = {
  settings: null,
};

export default(Inventory);