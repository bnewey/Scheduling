import React, {useRef, useState, useEffect} from 'react';
import PropTypes from 'prop-types';

import MainLayout from '../components/Layouts/Main';

import IndexHead from '../components/UI/IndexHead';
import ItemizationContainer from '../components/WorkOrders/Itemization/ItemizationContainer';
import ItemizationSearch from '../components/WorkOrders/Itemization/ItemizationSearch';


const Itemization = function () {
  const [searchTable, setSearchTable] = useState("woi.description");
  const [searchText, setSearchText] = useState("");
  const [shouldFetch, setShouldFetch] = useState(true);

    return (
        <MainLayout>
            <IndexHead image={`static/survey_40.png`}>Work Orders - Itemization</IndexHead>
            <ItemizationSearch inputText={searchText} setInputText={setSearchText} 
                                  searchTable={searchTable} setSearchTable={setSearchTable}
                                shouldFetch={shouldFetch} setShouldFetch={setShouldFetch} />
            <ItemizationContainer searchText={searchText} searchTable={searchTable} shouldFetch={shouldFetch} setShouldFetch={setShouldFetch}/>
            
        </MainLayout>
    );
}

//does work when were being passed props 
Itemization.getInitialProps = async ({ query }) => ({ settings: query.settings });

Itemization.propTypes = {
  settings: PropTypes.shape({
    results: PropTypes.array.isRequired,
  }),
};

Itemization.defaultProps = {
  settings: null,
};

export default Itemization;