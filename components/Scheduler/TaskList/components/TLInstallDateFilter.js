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
    const {activeTaskView,taskViews, handleRefreshView, taskListTasksSaved,installDateFilters, setInstallDateFilters,
        setRefreshView,tabValue} = props;
 
    //STATE
    const [installDateFilterOpen, setInstallDateFilterOpen] = useState(null)
    const [selectInstallDateMenuOpen,setSelectInstallDateMenuOpen] = useState(false);
    
    const [isVisible, setIsVisible] = useState(!!taskViews.find((view)=> view.value == activeTaskView)?.array?.find((item)=> item.field === "drill_date" ));

    useEffect(()=>{
        if(activeTaskView && taskViews?.length > 0){
            setIsVisible( !!taskViews.find((view)=> view.value == activeTaskView)?.array?.find((item)=> item.field === "drill_date" ));
        }
    }, [activeTaskView])

    useEffect(() => {
        if(installDateFilterOpen == null){
            var tmp = window.localStorage.getItem('installDateFilterOpen');
            var tmpParsed;
            if(tmp != null && tmp != undefined){
                tmpParsed = JSON.parse(tmp);
            }
            if(tmpParsed != null){
                setInstallDateFilterOpen(tmpParsed);
            }else{
                setInstallDateFilterOpen(false);
            }
        }
        if((installDateFilterOpen != null)){
            window.localStorage.setItem('installDateFilterOpen', JSON.stringify(installDateFilterOpen));
        }
        
    }, [installDateFilterOpen]);
    

    //CSS
    const classes = useStyles();


    const handleOpenInstallDateFilter = (event)=>{
        setInstallDateFilterOpen(true);
        setSelectInstallDateMenuOpen(true);
    }

    const handleClearAndCloseInstallDateFilter = (event)=>{
        setInstallDateFilterOpen(false);
        setInstallDateFilters([]);
        handleRefreshView()
    }

    const handleUpdateInstallDateFilter =(value)=>{
        console.log("Value ", value);

        var newArray = value.map((item)=>{
            return ({property: 'sch_install_date', value: item})
        })

        setInstallDateFilters(newArray);
        handleCloseSelectMenu();
        handleRefreshView()
    }

    const handleCloseSelectMenu = (event)=>{
        setSelectInstallDateMenuOpen(false);
    }

    const handleOpenSelectMenu = (event)=>{
        setSelectInstallDateMenuOpen(true);
    }

    if(!isVisible){
        return <></>
    }
    
    return(
        <>
                {installDateFilterOpen && taskListTasksSaved ? 
                <div className={classes.filterInstallDateDiv}>
                    <Select  multiple
                            id={"installDateFilter"}
                            className={classes.selectBox}
                            value={(installDateFilters?.map((item)=> (item.value))
                            )}
                            open={selectInstallDateMenuOpen}
                            onOpen={handleOpenSelectMenu}
                            onClose={handleCloseSelectMenu}
                            className={classes.filterInstallDate}
                            onChange={event => handleUpdateInstallDateFilter(event.target.value)}
                            >
                        {(()=> {
                            var array = [...taskListTasksSaved].map((task)=> task["sch_install_date"])
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
                        <DeleteIcon className={classes.clearInstallDateFilterIcon} onClick={event => handleClearAndCloseInstallDateFilter(event)}/>
                    </span>
                </div> : 
                <Button className={classes.installDateFilterButton}
                    onClick={event => handleOpenInstallDateFilter(event)}
                    variant="text"
                    color="secondary"
                    size="medium"
                >
                    <DateIcon/>
                    <Box display={{ xs: 'none', md: 'inline' }}  component="span">Install Date Filter</Box>
                </Button>
                }
        </>
    );

} 

export default TaskListFilter;

const useStyles = makeStyles(theme => ({
    filterInstallDate: {
      
        padding: '0px',
        background: '#fff',
        color: '#19253a',
        '&& .MuiSelect-select':{
            padding: '8px 20px 8px 10px',
            minWidth: '100px',
        },
    },
    filterInstallDateDiv:{
        margin: '0px 10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#d7ffef',
        padding: '2px 4px',
        borderRadius: '3px',
    },
    installDateFilterButton:{
        color: '#152f24',
        border: '1px solid #385248',
        margin: '0px 10px',
        fontWeight: 500,
        backgroundColor: '#d7ffef',
        '&:hover':{
            backgroundColor: '#85d1b3',
            color: '#222',
        }
        
    },
    clearInstallDateFilterIcon:{
        margin: '2px',
        marginTop: '4px',
        '&:hover':{
            color: '#000',
            background: '#b7b7b75c',
            borderRadius: '8px',
        }
    }

      
  }));
