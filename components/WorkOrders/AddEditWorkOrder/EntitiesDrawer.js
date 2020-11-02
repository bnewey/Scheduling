import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles, List, ListItem, ListItemText, CircularProgress, Checkbox, InputBase, IconButton,} from '@material-ui/core';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

import cogoToast from 'cogo-toast';
import { FixedSizeList } from 'react-window';

import dynamic from 'next/dynamic'
const KeyBinding = dynamic(()=> import('react-keybinding-component'), {
  ssr: false
});

import Util from '../../../js/Util.js';

import Settings from  '../../../js/Settings';
import { ListContext } from '../WOContainer';




const EntitiesDrawer = function(props) {
    const {user, entityDrawerOpen, setEntityDrawerOpen, saveRef} = props;

    const { workOrders, setWorkOrders, rowDateRange, setDateRowRange, detailWOid,
    currentView, setCurrentView, views, activeWorkOrder,setActiveWorkOrder, editWOModalOpen, setEditWOModalOpen, raineyUsers} = useContext(ListContext);

    const [entityRows, setEntityRows] = useState(null);
    const [searchValue,setSearchValue] = useState("");


     useEffect(()=>{
        if(entityRows == null){
            Settings.getEntities()
            .then((data)=>{
                if(data){
                    setEntityRows(data);
                }
            })
            .catch((error)=>{
                cogoToast.error("Failed to get entities")
                console.error("Failed to get entities", error);
            })
        }
     }, [entityRows])
    
    const classes = useStyles();

    const handleInputOnChange = (value, should, type, key) => {
        //this function updates by state instead of ref
        if(value == null || !type || !key){
            console.error("Bad handleInputOnChange call");
            return;
        }
        
        var tmpWorkOrder = {...activeWorkOrder};

        if(type === "date") {
            tmpWorkOrder[key] = Util.convertISODateTimeToMySqlDateTime(value);
        }
        if(type.split('-')[0] === "select"){
            tmpWorkOrder[key] = value.target.value;
        }
        if(type.split('-')[0] === "radio"){
            tmpWorkOrder[key] = value;
        }
        if(type.split('-')[0] === "auto"){
            tmpWorkOrder[key] = value;
        }
        if(type === "check"){
            tmpWorkOrder[key] = value;
        }
        if(type === "entity"){
            tmpWorkOrder[key[0]] = value[0];
            tmpWorkOrder[key[1]] = value[1];
        }
        saveRef.current.handleShouldUpdate(true);
        setActiveWorkOrder(tmpWorkOrder);
    }
    
    function renderRow(props) {
        const { data, index, style } = props;
        let entity = data[index];
        return (
          <ListItem button style={style} className={classes.entityListItem} key={index}>
            <ListItemText  >
                <div className={classes.entityDiv}>
                <span className={classes.entityNameSpan}>{entity.name}</span>
                <div className={classes.entityCheckSpan}>
                    <Checkbox
                        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                        checkedIcon={<CheckBoxIcon fontSize="small" />}
                        name="checkedI"
                        checked={activeWorkOrder && activeWorkOrder["customer_id"] == entity.record_id ? 1 : 0}
                        onChange={(event)=> handleInputOnChange([entity.record_id, entity.name], true, "entity", ["customer_id", "c_name"])}
                    />
                    <Checkbox
                        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                        checkedIcon={<CheckBoxIcon fontSize="small" />}
                        name="checkedI"
                        checked={activeWorkOrder && activeWorkOrder["account_id"] == entity.record_id ? 1 : 0}
                        onChange={(event)=> handleInputOnChange([entity.record_id, entity.name], true, "entity", ["account_id", "a_name"])}
                    />
                </div>
                <span className={classes.entityIdSpan}>{entity.record_id}</span>
                {/*<span className={classes.entityCountyOrParishSpan}>{entity.county_or_parish}</span>*/}
                <span className={classes.entityCountyOrParishSpan}>{entity.city}</span>
                <span className={classes.entityIdSpan}>{entity.state}</span>
                </div>
            </ListItemText>
          </ListItem>
        );
      }

      //SEARCH ///////////
      const searchXButton = () =>{
        return(
          <div className={classes.searchXDiv}>
            <IconButton type="submit" className={classes.iconButton} aria-label="clear-search" onClick={event=> handleClearSearch()}>
              <ClearIcon />
            </IconButton>
          </div>
        )
      }

      const handleChangeSearchValue = (value)=>{
        let str = value;
        str = str.replace(/^\s+/, '');
        if(str || str == '' ){
          setSearchValue(str)
        } 
      }
   
      const handleClearSearch = () =>{
        setSearchValue("");
        setEntityRows(null)
      }

      const handleCloseEntityDrawer = ()=>{
        setEntityDrawerOpen(false);
        setSearchValue("");
        setEntityRows(null);
      }

      const handleSearch = (keyCode,event)=>{
            if(!searchValue && searchValue != "" ){
                cogoToast.error("Bad search value")
                return;
            }
            if((keyCode) && event && !event.target.id){
                console.error("Bad keycode or element on handleClearSelectedTasksOnEsc");
                return;
            }

            var id = event ? event.target.id : null;

            if((keyCode && event ) && !(keyCode === 13 && id ==  "ent_search_input")){
                return;
            }

            Settings.getEntitiesSearch(searchValue)
            .then((data)=>{
                if(data){
                    setEntityRows(data);
                }
            })
            .catch((error)=>{
                cogoToast.error("Failed to search entities")
                console.error("Failed to saerch entities", error)
            })
        }
            //END OF SEARCH

    return(
        <div className={classes.root}>
            <div className={classes.absCloseButton}>
                <IconButton type="submit"  aria-label="clear-search" onClick={event=> handleCloseEntityDrawer()}>
              <ClearIcon />
            </IconButton></div>
            <div className={classes.titleDiv}>
                <span className={classes.titleSpan}>Entities List</span>
            </div>
            <div className={classes.searchContainer}>
                <KeyBinding onKey={ (e) => handleSearch(e.keyCode, e) } />
                <div className={classes.searchDiv}>
                <div className={classes.searchInput}>
                    <span className={classes.searchLabel}>Name:</span>
                <InputBase
                    className={classes.input}
                    classes={{input: classes.actualInputElement }}
                    placeholder="Search Entities"
                    inputProps={{ 'aria-label': 'search entities', id: "ent_search_input"}}
                    autoFocus={true}
                    value={searchValue}
                    endAdornment={searchValue ? searchXButton() : ""}
                    onChange={event=> handleChangeSearchValue(event.target.value)}
                /> </div>
                <IconButton type="submit" className={classes.iconButton} aria-label="search" onClick={event=> handleSearch()}>
                    <SearchIcon />
                </IconButton>    
                </div>
            </div>
            <div className={classes.listDiv}>
                {entityRows ? <>
                <List>
                    <ListItem  className={classes.entityHeadItem} key={'header'}>
                        <ListItemText  >
                            <div className={classes.entityDiv}>
                            <span className={classes.entityNameSpan}>Name</span>
                            <span className={classes.entityCheckSpan}>Assign</span>
                            <span className={classes.entityIdSpan}>ID</span>
                            {/*<span className={classes.entityCountyOrParishSpan}>County</span>*/}
                            <span className={classes.entityCountyOrParishSpan}>City</span>
                            <span className={classes.entityIdSpan}>State</span>
                            </div>
                        </ListItemText>
                        </ListItem>
                </List>
                <FixedSizeList itemData={entityRows} height={350}  itemSize={24} itemCount={entityRows.length}>
                    {renderRow}
                </FixedSizeList></>
                : <>{<CircularProgress/>}</>}
            </div>
        </div>
    )
}

export default EntitiesDrawer

const useStyles = makeStyles(theme => ({
    root:{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignContent: 'center',

    },
    titleDiv:{
        padding: '5px 10px',
        marginBottom: '3px',
        borderBottom: '1px solid #aaa'
    },
    titleSpan:{
        color: '#888',
        fontSize: 15,
        textTransform: 'uppercase',
        fontFamily: 'sans-serif',
    },
    entityListItem:{
        borderBottom: '1px solid #ddd',
        padding: '5px 9px',
        background: '#fcfcfc'
    },
    entityHeadItem:{
        
        padding: '2px 4px',
        '& span':{
            fontWeight: '600',
        },
        margin: '0px 0px', 
    },
    entityDiv:{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    entityNameSpan:{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth: '100%',
        fontFamily: 'sans-serif',
        fontSize: '10px',
        flexBasis: '50%',
        textOverflow: 'ellipsis',
        fontWeight: '500',
    },
    entityCheckSpan:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignContent: 'center',
        flexBasis: '20%',
        maxWidth: '100%',
        fontFamily: 'sans-serif',
        fontSize: '10px',
    },
    entityIdSpan:{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth: '100%',
        fontFamily: 'sans-serif',
        fontSize: '10px',
        flexBasis: '10%',
        textOverflow: 'ellipsis',
    },
    entityCountyOrParishSpan:{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth: '100%',
        fontFamily: 'sans-serif',
        fontSize: '10px',
        flexBasis: '20%',
        textOverflow: 'ellipsis',
    },
    searchDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        
    },
    searchInput:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'baseline',
        border:'1px solid #ccc',
        padding: '1% 2%',
        margin:'1% 2% 0% 2%',
        borderRadius: '20px',
    },
    searchLabel:{
        fontSize: 11,
        fontWeight: 600,
        color: '#666',
        marginRight: 7,
        
    },
    iconButton:{
        padding: '5px'
    },
    absCloseButton:{
        position: 'absolute',
        top:'10px',
        left: '10px',
    }
}));
