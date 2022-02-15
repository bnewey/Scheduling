import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles,  Button,  Box, Select,MenuItem, Tooltip } from '@material-ui/core';

     import DeleteIcon from '@material-ui/icons/Clear';
     import DateIcon from '@material-ui/icons/DateRangeTwoTone'
     import FilterIcon from '@material-ui/icons/MoreVert';

const KeyBinding = dynamic(()=> import('react-keybinding-component'), {
    ssr: false
  });
  import dynamic from 'next/dynamic'

import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../../UI/ConfirmYesNo';

import cogoToast from 'cogo-toast';
import moment from 'moment';

import _, { property } from 'lodash';

const ArrivalDateFilter = (props) => {
    //PROPS
    const {activeTaskView,taskViews, handleRefreshView, taskListTasksSaved,tLTasksExtraSaved, arrivalDateFilters, setArrivalDateFilters,
        setRefreshView,tabValue, setSorters,activeTVOrder } = props;
 
    //STATE
    const [arrivalDateFilterOpen, setArrivalDateFilterOpen] = useState(null)
    const [selectArrivalDateMenuOpen,setSelectArrivalDateMenuOpen] = useState(false);
    const [ctrl, setCtrl] = useState(false);
    
    const [isVisible, setIsVisible] = useState(!!taskViews.find((view)=> view.value == activeTaskView)?.array?.find((item)=> item.field === "wo_arrival_dates" ));

    useEffect(()=>{
        if(activeTaskView && taskViews?.length > 0){
            setIsVisible( !!taskViews.find((view)=> view.value == activeTaskView)?.array?.find((item)=> item.field === "wo_arrival_dates" ));
        }
    }, [activeTaskView])


    useEffect(() => {
        if(arrivalDateFilterOpen == null){
            var tmp = window.localStorage.getItem('arrivalDateFilterOpen');
            var tmpParsed;
            if(tmp != null && tmp != undefined){
                tmpParsed = JSON.parse(tmp);
            }
            if(tmpParsed != null){
                setArrivalDateFilterOpen(tmpParsed);
            }else{
                setArrivalDateFilterOpen(false);
            }
        }
        if((arrivalDateFilterOpen != null)){
            window.localStorage.setItem('arrivalDateFilterOpen', JSON.stringify(arrivalDateFilterOpen));
        }
        
    }, [arrivalDateFilterOpen]);
    

    //CSS
    const classes = useStyles({ctrl, filterLength: arrivalDateFilters?.length });


    const handleOpenArrivalDateFilter = (event)=>{
        setArrivalDateFilterOpen(true);
        setSelectArrivalDateMenuOpen(true);
    }

    const handleClearAndCloseArrivalDateFilter = (event)=>{
        setArrivalDateFilterOpen(false);
        setArrivalDateFilters([]);
        handleRefreshView()
    }

    const handleUpdateArrivalDateFilter =(value)=>{
        console.log("Value ", value);

        if(value.find((item)=> item === "clear")){
            setArrivalDateFilters([])
            handleCloseSelectMenu();
            handleRefreshView()
            return;
        }

        var newArray = value.map((item)=>{
            return ({property: 'wo_arrival_dates', value: item})
        })
        if(!ctrl){
            newArray = newArray.slice(newArray.length-1)
        }

        setArrivalDateFilters(newArray);
        setSorters([{property: activeTVOrder, 
            direction: "ASC"}])

        if(!ctrl){
            handleCloseSelectMenu();
        }else{
            
        }
        handleRefreshView()
    }

    const handleCloseSelectMenu = (event)=>{
        setSelectArrivalDateMenuOpen(false);
    }

    const handleOpenSelectMenu = (event)=>{
        setSelectArrivalDateMenuOpen(true);
    }

    const handleCheckCtrlIsDown = async (keyCode, event)=>{
        var id = event.target.id;
        console.log("id", id);
        console.log("keycode", keyCode)
        if(isNaN(keyCode) || keyCode ==null ){
          console.error("Bad keycode or element on handleCheckCtrlIsDown");
          return;
        }
        if(keyCode === 17 && selectArrivalDateMenuOpen){ //enter key & input element's id
          setCtrl(true);
        }
    }

    const handleCheckCtrlIsUp = async (keyCode, event)=>{
        var id = event.target.id;
        console.log("id", id);
        console.log("keycode", keyCode)
        if(isNaN(keyCode) || keyCode ==null  ){
          console.error("Bad keycode or element on handleCheckCtrlIsDown");
          return;
        }
        if(keyCode === 17 && selectArrivalDateMenuOpen){ //enter key & input element's id
          setCtrl(false);
        }
    }

    if(!isVisible){
        return <></>
    }
    
    return(
        <>
                {selectArrivalDateMenuOpen && tLTasksExtraSaved ? 
                <div className={classes.filterInstallDateDiv}>
                    <KeyBinding type={"keydown"} onKey={ (e) => handleCheckCtrlIsDown(e.keyCode, e) } />
                    <KeyBinding type={"keyup"} onKey={ (e) => handleCheckCtrlIsUp(e.keyCode, e) } /> 
                    <Select  multiple
                            autoWidth
                            id={"arrivalDateFilter"}
                            className={classes.selectBox}
                            value={(arrivalDateFilters?.map((item)=> (item.value))
                            )}
                            open={selectArrivalDateMenuOpen}
                            onOpen={handleOpenSelectMenu}
                            onClose={handleCloseSelectMenu}
                            className={classes.filterInstallDate}
                            onChange={event => handleUpdateArrivalDateFilter(event.target.value)}
                            >
                        {(()=> {
                            var array = [...tLTasksExtraSaved].map((task)=> task["wo_arrival_dates"])
                                           .filter((v, i, array)=> array.indexOf(v)===i && v != null )
                                           .filter((item)=> (item != -1 && item != 0 && item != 1 && item != 2 && item != 3))
                            var newArray = array.sort((a, b) => { return new moment(a).format('YYYYMMDD') - new moment(b).format('YYYYMMDD') })
                            return [...newArray.map((item,i)=>{
                                return( 
                                <MenuItem className={classes.menuItem} value={item}>{moment(item).format('MM/DD/YYYY')}</MenuItem>
                                );
                            }),                            
                            // , <MenuItem className={classes.menuItem} value={0}>Not Set</MenuItem>
                            , <MenuItem className={classes.menuItem} value={1}>Arrived</MenuItem> 
                            , <MenuItem className={classes.menuItem} value={2}>Stock</MenuItem> 
                            , <MenuItem className={classes.menuItem} value={3}>On Site</MenuItem>,
                            <MenuItem className={classes.menuItem} value={'clear'}>*Clear*</MenuItem>  ] ;
                        })()}
                    </Select> 
                    <span>
                        <DeleteIcon className={classes.clearArrivalDateFilterIcon} onClick={event => handleClearAndCloseArrivalDateFilter(event)}/>
                    </span>
                </div> : 
                // <Button className={classes.arrivalDateFilterButton}
                //     onClick={event => handleOpenArrivalDateFilter(event)}
                //     variant="text"
                //     color="secondary"
                //     size="medium"
                // >
                //     <DateIcon/>
                //     <Box display={{ xs: 'none', md: 'inline' }}  component="span">Install Date Filter</Box>
                // </Button>
                <div>
                    <FilterIcon className={classes.icon} onClick={event => handleOpenArrivalDateFilter(event)}/>
                </div>
                }
        </>
    );

} 

export default ArrivalDateFilter;

const useStyles = makeStyles(theme => ({
    filterInstallDate: {
      
        padding: '0px',
        background: '#fff',
        color: '#19253a',
        '&& .MuiSelect-select':{
            // padding: '8px 20px 8px 10px',
            // minWidth: '100px',
            padding: '0px',
            minWidth: '1px',
        },
    },
    filterInstallDateDiv:{
        // margin: '0px 10px',
        // display: 'flex',
        // justifyContent: 'center',
        // alignItems: 'center',
        // background: '#d7ffef',
        // padding: '2px 4px',
        // borderRadius: '3px',
        margin: '0px 0px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0px',
        overflow: "hidden",
        width: "1px"
    },
    arrivalDateFilterButton:{
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
    clearArrivalDateFilterIcon:{
        margin: '2px',
        marginTop: '4px',
        '&:hover':{
            color: '#000',
            background: '#b7b7b75c',
            borderRadius: '8px',
        }
    },
    selectBox:{
        display: 'none',
    },
    menuItem:{
        cursor: ({ctrl}) => ctrl ? 'cell': 'pointer',
    },
    icon:{
        color: ({filterLength}) => filterLength > 0 ? '#ff6a1e' : '#fff',
        cursor: 'pointer'
    }

      
  }));
