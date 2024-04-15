import React, { useState, useContext } from 'react';
import { TextField, IconButton, makeStyles } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

import { ListContext } from '../../../WOContainer';

const TableSearch = () => {

    const classes = useStyles();

    const {saveParamSearch, setSaveParamSearch} = React.useContext(ListContext);

    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSearchSubmit = () => {
        setSaveParamSearch(searchQuery);
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearchSubmit();
        }
    }

    return (
        <div className={classes.searchContainer}>
            <TextField
                className = {classes.searchInput}
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="Search..."
                variant="outlined"
                size="large"
            />
            <IconButton onClick={handleSearchSubmit}>
                <SearchIcon />
            </IconButton>
        </div>
    );
};

export default TableSearch;

const useStyles = makeStyles(theme => ({
    searchContainer:{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        marginLeft: "10px"
    },
    searchInput:{
        flexGrow: '1', 
        marginRight: '5px'
    },
}));