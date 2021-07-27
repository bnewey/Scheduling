import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles,  Button,  Box, Select,MenuItem, Tooltip } from '@material-ui/core';

     import DeleteIcon from '@material-ui/icons/Clear';
     import DateIcon from '@material-ui/icons/DateRangeTwoTone'

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../../UI/ConfirmYesNo';

import cogoToast from 'cogo-toast';
import moment from 'moment';

import _, { property } from 'lodash';

const TaskListFilter = (props) => {
    //PROPS
    const { taskViews, activeTaskView, handleRefreshView, taskListTasksSaved,drillDateFilters, setDrillDateFilters,
        setRefreshView,tabValue} = props;
 
    //STATE
    const [drillDateFilterOpen, setDrillDateFilterOpen] = useState(null)
    const [selectDrillDateMenuOpen,setSelectDrillDateMenuOpen] = useState(false);
    
    const [isVisible, setIsVisible] = useState(!!taskViews.find((view)=> view.value == activeTaskView)?.array?.find((item)=> item.field === "drill_date" ));

    useEffect(()=>{
        if(activeTaskView && taskViews?.length > 0){
            setIsVisible( !!taskViews.find((view)=> view.value == activeTaskView)?.array?.find((item)=> item.field === "drill_date" ));
        }
    }, [activeTaskView])

    useEffect(() => {
        if(drillDateFilterOpen == null){
            var tmp = window.localStorage.getItem('drillDateFilterOpen');
            var tmpParsed;
            if(tmp != null && tmp != undefined){
                tmpParsed = JSON.parse(tmp);
            }
            if(tmpParsed != null){
                setDrillDateFilterOpen(tmpParsed);
            }else{
                setDrillDateFilterOpen(false);
            }
        }
        if((drillDateFilterOpen != null)){
            window.localStorage.setItem('drillDateFilterOpen', JSON.stringify(drillDateFilterOpen));
        }
        
    }, [drillDateFilterOpen]);
    

    //CSS
    const classes = useStyles();


    const handleOpenDrillDateFilter = (event)=>{
        setDrillDateFilterOpen(true);
        setSelectDrillDateMenuOpen(true);
    }

    const handleClearAndCloseDrillDateFilter = (event)=>{
        setDrillDateFilterOpen(false);
        setDrillDateFilters([]);
        handleRefreshView()
    }

    const handleUpdateDrillDateFilter =(value)=>{
        console.log("Value ", value);

        var newArray = value.map((item)=>{
            return ({property: 'drill_date', value: item})
        })

        setDrillDateFilters(newArray);
        handleCloseSelectMenu();
        handleRefreshView()
    }

    const handleCloseSelectMenu = (event)=>{
        setSelectDrillDateMenuOpen(false);
    }

    const handleOpenSelectMenu = (event)=>{
        setSelectDrillDateMenuOpen(true);
    }
    
    if(!isVisible){
        return <></>
    }

    return(
        <> 
                {drillDateFilterOpen && taskListTasksSaved ? 
                <div className={classes.filterDrillDateDiv}>
                    <Select  multiple
                            id={"drillDateFilter"}
                            className={classes.selectBox}
                            value={(drillDateFilters?.map((item)=> (item.value))
                            )}
                            open={selectDrillDateMenuOpen}
                            onOpen={handleOpenSelectMenu}
                            onClose={handleCloseSelectMenu}
                            className={classes.filterDrillDate}
                            onChange={event => handleUpdateDrillDateFilter(event.target.value)}
                            >
                        {(()=> {
                            var array = [...taskListTasksSaved].map((task)=> task["drill_date"])
                                           .filter((v, i, array)=> array.indexOf(v)===i && v != null )
                            var newArray = array.sort((a, b) => { return new moment(a).format('YYYYMMDD') - new moment(b).format('YYYYMMDD') })
                            return newArray.map((item,i)=>{
                                return( 
                                <MenuItem value={item}>{moment(item).format('MM/DD/YYYY')}</MenuItem>
                                );
                            }) ;
                        })()}
                    </Select> 
                    <span>
                        <DeleteIcon className={classes.clearDrillDateFilterIcon} onClick={event => handleClearAndCloseDrillDateFilter(event)}/>
                    </span>
                </div> : 
                <Button className={classes.drillDateFilterButton}
                    onClick={event => handleOpenDrillDateFilter(event)}
                    variant="text"
                    color="secondary"
                    size="medium"
                >
                    <DateIcon/>
                    <Box display={{ xs: 'none', md: 'inline' }}  component="span">Drill Date Filter</Box>
                </Button>
                }
        </>
    );

} 

export default TaskListFilter;

const useStyles = makeStyles(theme => ({
    filterDrillDate: {
      
        padding: '0px',
        background: '#fff',
        color: '#19253a',
        '&& .MuiSelect-select':{
            padding: '8px 20px 8px 10px',
            minWidth: '100px',
        },
    },
    filterDrillDateDiv:{
        margin: '0px 10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#ad74d9',
        padding: '2px 4px',
        borderRadius: '3px',
    },
    drillDateFilterButton:{
        color: '#fff',
        border: '1px solid #385248',
        margin: '0px 10px',
        fontWeight: 500,
        backgroundColor: '#ad74d9',
        '&:hover':{
            backgroundColor: '#c184ef',
            color: '#fff',
        }
        
    },
    clearDrillDateFilterIcon:{
        margin: '2px',
        marginTop: '4px',
        '&:hover':{
            color: '#000',
            background: '#b7b7b75c',
            borderRadius: '8px',
        }
    }

      
  }));
