import React, {useRef, useState, useEffect, useContext} from 'react';
import {List, ListItem, ListItemText,ListItemIcon, ListSubheader, makeStyles, withStyles, Select, MenuItem} from '@material-ui/core';



import clsx from 'clsx';
import cogoToast from 'cogo-toast';

import Util from  '../../../../../js/Util';
import Inventory from  '../../../../../js/Inventory';
import { ListContext } from '../../InvPartsContainer';
import { Clear } from '@material-ui/icons';


const TypeFilterSelect = function(props) {
    const {user} = props;
  
    const { parts, setParts, setPartsRefetch, partsSearchRefetch,setPartsSearchRefetch,currentView, setCurrentView, views,columnState, setColumnState, 
        detailPartId,  setDetailPartId,editPartModalMode,setEditPartModalMode, activePart, setActivePart, editPartModalOpen,setEditPartModalOpen,
           recentParts, setRecentParts, sorters, setSorters, typeFilter, setTypeFilter} = useContext(ListContext);
    const classes = useStyles();

    const [partTypes, setPartTypes] = useState(null);

    useEffect(()=>{
        if(partTypes == null){
            Inventory.getPartTypes()
            .then((data)=>{
                setPartTypes(data);
            })
            .catch((error)=>{
                console.error("Failed to get entity types for TypeFilterSelect", error)
            })
        }
    },[])

    const handleChangeFilter = (event) =>{
        let value = event.target.value;
        setTypeFilter(value);

    }

    const handleRemoveFilter = (event)=>{
        setTypeFilter('');
        setPartsRefetch(true)
    }
   
    return(<>
        <div className={classes.headDiv}>
                <span className={classes.headSpan}>
                    Filter By Type
                </span>
            </div>
    <div className={classes.container}>
        <Select
          className={clsx({[classes.selectItem]:true, [classes.selectedItemActive]: typeFilter})}
          id="filter_select"
          value={typeFilter}
          onChange={handleChangeFilter}
        >
          {partTypes?.map((item)=> 
            <MenuItem value={item.type}>{item.type}</MenuItem>
          )}
        </Select>
        {typeFilter && <div className={classes.removeDiv} onClick={handleRemoveFilter}>
            <Clear className={classes.icon}/>
            <span className={classes.removeSpan}>Remove</span>
        </div>}
    </div> </>)
}

export default TypeFilterSelect;

const useStyles = makeStyles(theme => ({
    container:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeDiv:{
        border: '1px solid #ce2727',
        borderRadius: '2px',
        background: '#ff8888',
        cursor: 'pointer',
        '&:hover':{
            background: '#dd7777',
        },
        padding: '3px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeSpan:{
        fontFamily: 'arial',
        fontSize: '1em',
        color: '#222',
    },
    icon:{
        width: '.6em',
        height: '.6em',
    },
    selectItem:{
        minWidth: '10em',
        maxWidth: '12em',
        lineHeight: '2.4em',
        paddingLeft: '15px',
        backgroundColor: '#fff',
        border: '1px solid #bbb',
        margin: '2px',
        fontSize: '13px',
        fontFamily: 'sans-serif',
        fontWeight: '600',
        color: '#545454',
        '&:hover':{
          backgroundColor: '#d1d1d1',
        },
        padding: 0,
      },
    selectedItemActive:{
        border: '1px solid #0066ff',
    },
    headDiv:{
        width:'100%',
        textAlign: 'center',
        padding: 4,
    },
    headSpan:{
        color: '#666',
        fontSize: 13,
        textAlign: 'center',
        fontFamily: 'sans-serif',
        fontWeight: 600,
        marginRight: 10,
    },
}));