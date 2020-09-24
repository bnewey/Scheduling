import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, withStyles, List, ListItem, ListItemText, CircularProgress, Checkbox, InputBase, IconButton} from '@material-ui/core';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

import cogoToast from 'cogo-toast';
import { FixedSizeList } from 'react-window';



import Util from '../../../js/Util.js';

import Settings from  '../../../js/Settings';
import { WOContext } from '../WOContainer';




const EntitiesDrawer = function(props) {
    const {user, entityDrawerOpen, setEntityDrawerOpen, handleInputOnChange} = props;

    const { workOrders, setWorkOrders, rowDateRange, setDateRowRange, detailWOid,
    currentView, setCurrentView, views, activeWorkOrder,setActiveWorkOrder, editWOModalOpen, setEditWOModalOpen, raineyUsers} = useContext(WOContext);

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


    const handleEntityOnChange = (entity, field, idField)=>{
        console.log("entity in handleentity change", entity)
        //handleInputOnChange([entity.record_id, entity.name], true, "entity", [idField, field])
        // Settings.getEntityNameById(entity.record_id)
        // .then((data)=>{
        //     console.log('name',data);
        //     var tmp = data[0].name;
        //     console.log("TMP",tmp);
        //     console.log("entity b4",entity);
            
        // })
        // .catch((error)=>{
        //     console.error("Error getting entity name", error);
        //     cogoToast.error("Failed to get entity name");
        // })        
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
                <span className={classes.entityCountyOrParishSpan}>{entity.county_or_parish}</span>
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

      const handleSearch = ()=>{
          if(!searchValue && searchValue != "" ){
            cogoToast.error("Bad search value")
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
            <div className={classes.titleDiv}>
                <span className={classes.titleSpan}>Entities List</span>
            </div>
            <div className={classes.searchDiv}>
                <span>Search</span>
                <div>
                <InputBase
                    className={classes.input}
                    
                    classes={{input: classes.actualInputElement }}
                    placeholder="Search Work Orders"
                    inputProps={{ 'aria-label': 'search work orders', id: "wo_search_input"}}
                    autoFocus={true}
                    value={searchValue }
                    startAdornment={'Name: '}
                    endAdornment={searchValue ? searchXButton() : ""}
                    onChange={event=> handleChangeSearchValue(event.target.value)}
                />
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
                            <span className={classes.entityCountyOrParishSpan}>County</span>
                            </div>
                        </ListItemText>
                        </ListItem>
                </List>
                <FixedSizeList itemData={entityRows} height={400}  itemSize={24} itemCount={entityRows.length}>
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
        padding: '3px 10px',
        borderBottom: '1px solid #aaa'
    },
    titleSpan:{
        fontSize: '15px',
        color: '999',
        fontWeight: '600'
    },
    entityListItem:{
        border: '1px solid #eee',
        padding: '5px 9px',
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
        fontWeight: '600',
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
}));
